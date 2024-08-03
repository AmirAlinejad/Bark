import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
// Firebase
import {
  query,
  collection,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig"; // Update this path according to your project structure
// functions
import { fetchMessages } from "../../functions/backendFunctions";
// icons
import { Ionicons } from "@expo/vector-icons";
// my components
import Header from "../../components/display/Header";
import MessageItem from "../../components/chat/MessageItem";
import SearchBar from "../../components/input/SearchBar";
import ProfileOverlay from "../../components/overlays/ProfileOverlay";
import CustomText from "../../components/display/CustomText";
import CircleButton from "../../components/buttons/CircleButton";
import CustomButton from "../../components/buttons/CustomButton";

// icons
import { MaterialCommunityIcons } from "@expo/vector-icons";
// styles
import { useTheme } from "@react-navigation/native";
// gesture handler
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ToggleButton from "../../components/buttons/ToggleButton";

const MessageSearchScreen = ({ route, navigation }) => {
  const { clubId, chatName, pin, schoolKey } = route.params;
  // states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPinned, setSearchPinned] = useState(pin);
  const [messages, setMessages] = useState([]);
  // overlay
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayUserData, setOverlayUserData] = useState({});
  // loading
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Search Messages",
      headerSearchBarOptions: {
        placeholder: "Search messages...",
        onChangeText: (event) => {
          setSearchQuery(event.nativeEvent.text);
        },
        hideWhenScrolling: false,
        textColor: colors.text,
      },
    });
  }, [navigation]);

  useEffect(() => {
    // Fetching messages in descending order to suit the inverted list.
    let messagesQuery;
    if (searchPinned) {
      messagesQuery = query(
        collection(
          firestore,
          "schools",
          schoolKey,
          "chatData",
          "clubs",
          clubId,
          "chats",
          chatName
        ),
        where("pinned", "==", searchPinned),
        orderBy("createdAt")
      );
    } else {
      messagesQuery = query(
        collection(
          firestore,
          "schools",
          schoolKey,
          "chatData",
          "clubs",
          clubId,
          "chats",
          chatName
        ),
        orderBy("createdAt")
      );
    }

    const unsubscribe = onSnapshot(
      messagesQuery,
      (querySnapshot) => {
        fetchMessages(querySnapshot, setMessages);
      },
      (error) => {
        console.error("Error fetching messages: ", error);
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [searchPinned]);

  const filteredMessages = messages.filter((message) =>
    message.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPinButton = () => {
    return (
      <TouchableOpacity
        style={styles.pinnedButton}
        onPress={() => setSearchPinned(!searchPinned)}
      >
        <ToggleButton
          text={`Filter: ${searchPinned ? "Pinned" : "All"}`}
          toggled={searchPinned}
          toggledCol={colors.primary}
          untoggledCol={colors.gray}
          onPress={() => setSearchPinned(!searchPinned)}
        />
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }) => (
    <MessageItem
      item={item}
      setOverlayVisible={setOverlayVisible}
      setOverlayUserData={setOverlayUserData}
      swipeable={false}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/*Toggle pinned messages*/}
        <View style={{ flexDirection: "row", marginLeft: 20 }}>
          {renderPinButton()}
        </View>
        {/* Show if no messages */}
        {filteredMessages.length === 0 && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 200,
            }}
          >
            <Ionicons name="chatbubbles" size={100} color={colors.gray} />
            <CustomText
              text="No messages to display."
              font="bold"
              style={{ fontSize: 20, color: colors.textLight }}
            />
          </View>
        )}

        {/* Messages */}

        <GestureHandlerRootView>
          <FlatList
            data={filteredMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            scrollEnabled={false}
          />
        </GestureHandlerRootView>
      </ScrollView>
      {/* Overlay */}
      <ProfileOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        userData={overlayUserData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarView: {
    margin: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  messageList: {
    paddingBottom: 20,
    paddingHorizontal: 0,
  },
  pinnedButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
});

export default MessageSearchScreen;
