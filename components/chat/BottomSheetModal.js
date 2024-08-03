import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  FlatList,
  ScrollView,
} from "react-native";
// expo image
import { Image } from "expo-image";
// swipe up down modal
import SwipeUpDownModal from "react-native-swipe-modal-up-down";
// async storage
import AsyncStorage from "@react-native-async-storage/async-storage";
// giphy image
import Giphy from "../../assets/PoweredBy_200px-White_HorizText.png";
import GiphyAttribution from "../../assets/PoweredBy_200px-White_HorizText.png";
// backend
import { firestore } from "../../backend/FirebaseConfig";
import { auth } from "../../backend/FirebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";
// colors
import { useTheme } from "@react-navigation/native";
// icons
import { Ionicons } from "@expo/vector-icons";
// my components
import CustomText from "../display/CustomText";
import CustomInput from "../input/CustomInput";
import SearchBar from "../input/SearchBar";
import CustomButton from "../buttons/CustomButton";
import IconButton from "../buttons/IconButton";

const BottomSheetModal = ({
  isVisible,
  onClose,
  onUploadImage,
  onOpenCamera,
  onUploadGif,
  onOpenDocument,
  setImage,
  setTempImageUrl,
  chatRef,
  userData,
}) => {
  // state
  const [modalMode, setModalMode] = useState("upload"); // ['upload', 'gif', 'file', 'poll']
  const [images, setImages] = useState([]);
  // create states for gifs
  const [gifs, setGifs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { colors } = useTheme();

  // get images from async storage
  useEffect(() => {
    const getImages = async () => {
      try {
        const images = await AsyncStorage.getItem("userImages");
        if (images !== null) {
          console.log("images:", images);
          setImages(images.split(","));
        }
      } catch (error) {
        console.error("Error getting images:", error);
      }
    };

    getImages();
  }, []);

  const setImageAndClose = (image) => {
    setImage(image);
    setTempImageUrl(image);
    onClose();
  };

  // options data
  const options = [
    { key: "Photo", onPress: () => setModalMode("Photo"), icon: "image" },
    { key: "GIF", onPress: () => setModalMode("GIF"), icon: "film" },
    {
      key: "Camera",
      onPress: () => {
        onOpenCamera();
        setModalMode("upload");
      },
      icon: "camera",
    },
    {
      key: "Document",
      onPress: () => {
        onOpenDocument();
        setModalMode("upload");
      },
      icon: "document",
    },
    { key: "Poll", onPress: () => setModalMode("Poll"), icon: "ticket" },
    { key: "Cancel", onPress: onClose, cancel: true },
  ];

  const renderItem = ({ item }) => {
    return item.cancel ? (
      <TouchableOpacity style={styles.option} onPress={item.onPress}>
        <Ionicons name="close" size={24} color={colors.bark} />
        <Text style={[styles.cancelButtonText, { color: colors.bark }]}>
          {item.key}
        </Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.option} onPress={item.onPress}>
        <Ionicons
          name={item.icon || "image"}
          size={24}
          color={modalMode === item.key ? colors.button : colors.textLight}
        />
        <CustomText
          style={[styles.optionText, { color: modalMode === item.key ? colors.button : colors.textLight }]}
          text={item.key}
        />
      </TouchableOpacity>
    );
  };

  const renderImage = ({ item }) => {
    console.log("item:", item);

    if (item === "add") {
      return (
        <TouchableOpacity
          style={{
            width: "33%",
            aspectRatio: 1,
            backgroundColor: colors.gray,
            margin: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={onUploadImage}
        >
          <Ionicons name="camera" size={50} color={colors.darkGray} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={{
          width: "33%",
          aspectRatio: 1,
          backgroundColor: colors.gray,
          margin: 1,
        }}
        onPress={() => setImageAndClose(item)}
      >
        <Image
          source={{ uri: item }}
          style={{ width: "100%", aspectRatio: 1 }}
        />
      </TouchableOpacity>
    );
  };

  // Render poll item
  const renderPollItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.voteOption}>
        <CustomText style={styles.optionText} text={item.text} />
      </TouchableOpacity>
    );
  };

  const renderPollFooter = () => {
    return (
      <View style={styles.voteOption}>
        <CustomInput
          placeholder="Add option"
          width={"85%"}
          setValue={setNewVoteOptionText}
          value={newVoteOptionText}
        />
        <View style={{ justifyContent: "center" }}>
          <IconButton onPress={onAddOption} color={colors.button} icon="add" />
        </View>
      </View>
    );
  };

  // gifs
  const fetchGifs = async () => {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=mCWWr1G26e4ZDcNz1bHjKDsbk9142AOC&q=${
        searchTerm ? searchTerm : "trending"
      }&limit=30&offset=0&rating=g&lang=en`
    );
    const { data } = await response.json();
    setGifs(data.map((item) => item.images.fixed_height.url));
  };

  useEffect(() => {
    fetchGifs();
  }, [searchTerm]);

  // polls
  const [questionText, setQuestionText] = useState("");
  const [newVoteOptionText, setNewVoteOptionText] = useState("");
  // const [editingOption, setEditingOption] = useState(null);
  // const [editingText, setEditingText] = useState('');
  const [voteOptions, setVoteOptions] = useState([]);

  // Add option
  const onAddOption = () => {
    if (newVoteOptionText) {
      setVoteOptions([
        ...voteOptions,
        { id: voteOptions.length.toString(), text: newVoteOptionText },
      ]);
      setNewVoteOptionText("");
    }
  };

  // send poll message
  const sendPoll = useCallback(async () => {
    // Check if there's a question and at least two options
    console.log("questionText:", questionText);
    console.log("voteOptions:", voteOptions);
    console.log("userData:", userData);
    if (questionText && voteOptions.length >= 2) {
      try {
        // Create the sender object
        const user = {
          _id: userData.id,
          name: userData.userName,
          first: userData.firstName,
          last: userData.lastName,
        };
        if (userData.profileImg) {
          user.avatar = userData.profileImg;
        }

        // Create the message object
        const message = {
          _id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
          user,
          question: questionText.trim(),
          voteOptions,
          votes: [],
          voters: [],
        };

        // Add the message to Firestore
        await addDoc(chatRef, message);

        // say "sent an image" if no text
        const notificationText = "sent a poll";

        // clear the input
        setQuestionText("");
        setVoteOptions([]);
        setNewVoteOptionText("");

        ////////////////////// worry ab notifications later //////////////////////

        // do for all members in club (if not muted)
        /*const clubMembersCollection = collection(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId);
          const clubMembers = await getDocs(clubMembersCollection);
          // loop through all members in the club
          for (const member of clubMembers.docs) {
              /*if (!member.data().muted && member.id !== auth.currentUser.uid) {
                  // get the member's data
                  const memberData = await getDoc(doc(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'members', member.id));
                  const memberDataVal = memberData.data();
                  // send the push notification
                  sendPushNotification(memberDataVal.expoPushToken, notificationText, userData.firstName, userData.lastName, clubName);
              }*/

        /*// increment unread messages in club member's data
              const memberRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, member.id);
              const memberSnapshot = await getDoc(memberRef);
              const memberData = memberSnapshot.data();
              const unreadMessages = memberData.unreadMessages + 1;

              await updateDoc(memberRef, { unreadMessages });
          }*/
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  }, [questionText, voteOptions]);

  return (
    <SwipeUpDownModal
      modalVisible={isVisible}
      pressToanimate={isVisible}
      onClose={onClose}
      ContentModal={
        <TouchableWithoutFeedback style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={[styles.bar, { backgroundColor: colors.lightGray }]} />

            {/* Option select */}
            <View style={{ height: 160 }}>
              <FlatList
                scrollEnabled={false}
                data={options}
                renderItem={renderItem}
                numColumns={3}
              />
            </View>

            <View
              style={{ width: "100%", height: 1, backgroundColor: colors.gray }}
            />

            {/* Content */}
            {/* eventually make last square a button to upload image */}
            {modalMode === "Photo" && (
              <FlatList
                data={[...images, "add"]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderImage}
                numColumns={3}
                style={{ width: "100%" }}
              />
            )}
            {modalMode === "GIF" && (
              <View style={{ width: "100%" }}>
                <View style={styles.searchContainer}>
                  <SearchBar
                    value={searchTerm}
                    setValue={setSearchTerm}
                    placeholder="Search for GIFs"
                  />
                </View>

                {/*Giphy attribution mark*/}
                <Image
                  source={Giphy}
                  style={{ height: 30, resizeMode: "center" }}
                />

                <FlatList
                  data={gifs}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderImage}
                  numColumns={3}
                />

                <Image source={{ uri: GiphyAttribution }} />
              </View>
            )}
            {modalMode === "Poll" && (
              <ScrollView
                style={{
                  flex: 1,
                  padding: 16,
                  paddingHorizontal: 20,
                  width: "100%",
                }}
                contentContainerStyle={{ width: "100%" }}
              >
                {/* Title */}
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    gap: 20,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <CustomText
                      style={{ fontSize: 24, color: colors.textLight }}
                      text="Question"
                    />
                    <CustomInput
                      placeholder="Ask a question"
                      width={"85%"}
                      setValue={setQuestionText}
                      value={questionText}
                    />
                  </View>
                </View>

                {/* List of options */}
                <CustomText
                  style={{ fontSize: 24, color: colors.textLight }}
                  text="Answers"
                />
                <FlatList
                  scrollEnabled={false}
                  data={voteOptions}
                  renderItem={renderPollItem}
                  keyExtractor={(item) => item.id}
                  ListFooterComponent={renderPollFooter}
                />

                {/* Post button */}
                <View style={{ alignItems: "center" }}>
                  <CustomButton onPress={sendPoll} text="Post" />
                </View>
              </ScrollView>
            )}
          </View>
        </TouchableWithoutFeedback>
      }
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  modal: {
    width: "100%",
    height: 800,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 60,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  bar: {
    marginTop: 15,
    width: 50,
    height: 5,
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 10,
  },
  input: {
    width: "80%",
    height: 40,
    margin: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#cccccc",
  },
  voteOption: {
    marginVertical: 5,
    gap: 10,
    flexDirection: "row",
  },
  option: {
    width: 120,
    height: 80,
    padding: 15,
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
  },
  cancelButtonText: {
    fontSize: 18,
  },
  searchContainer: {
    alignSelf: "center",
    width: 460,
    marginLeft: 90,
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 20,
  },
});

export default BottomSheetModal;
