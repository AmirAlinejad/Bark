import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Header from "../../components/Header";
import { db } from "../../backend/FirebaseConfig";
import { ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";
const InClubView = ({ navigation, route }) => {
  const [memberCount, setMemberCount] = useState(0);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const { clubName, imageUrls, chatName } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "In Club View",
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const updateState = async () => {
        await fetchMemberCount(clubName);
        await fetchCurrentUserPrivilege();
        await fetchClubDescription(clubName);
      };
    }, [clubName])
  );

  const fetchMemberCount = async (clubName) => {
    try {
      const clubMembersRef = ref(db, `clubs/${clubName}/clubMembers`);
      const snapshot = await get(clubMembersRef);
      if (snapshot.exists()) {
        let memberCount = 0;
        snapshot.forEach(() => {
          memberCount++;
        });
        setMemberCount(memberCount);
      } else {
        setMemberCount(0);
      }
    } catch (error) {
      console.error("Error fetching member count:", error);
    }
  };

  const fetchCurrentUserPrivilege = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const userRef = ref(db, `clubs/${clubName}/clubMembers/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userPrivilege = snapshot.val().privilege;
        setCurrentUserPrivilege(userPrivilege);
      } else {
        console.log("User data not found.");
      }
    } else {
      console.log("User not authenticated.");
    }
  };

  const fetchClubDescription = async (clubName) => {
    try {
      const clubRef = ref(db, `clubs/${clubName}`);
      const snapshot = await get(clubRef);
      if (snapshot.exists()) {
        const description = snapshot.val().clubDescription;
        setClubDescription(description);
      } else {
        console.log("Club not found.");
      }
    } catch (error) {
      console.error("Error fetching club description:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <View style={styles.grayImage}>
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: "100%", height: "100%", resizeMode: "contain" }}
            />
          </View>
          <Text style={styles.clubNameText}>{clubName}</Text>
          <Text
            style={styles.memberCountText}
          >{`(${memberCount} members)`}</Text>
          {chatName === "adminchats" && (
            <Text style={styles.memberCountText}>Admin chat view</Text>
          )}
          <Text style={styles.clubDescriptionText}>{clubDescription}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("UserList", {
                clubName: clubName,
                chatName,
              })
            }
            style={[styles.button, styles.buttonFirst]}
          >
            <MaterialIcons
              name="people"
              size={24}
              color="black"
              style={styles.iconStyle}
            />
            <Text style={styles.buttonText}>Search Members</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="black"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MessageSearchScreen", {
                clubName,
                chatName,
              })
            }
            style={styles.button}
          >
            <MaterialIcons
              name="search"
              size={24}
              color="black"
              style={styles.iconStyle}
            />
            <Text style={styles.buttonText}>Search Messages</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="black"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("PinnedMessagesScreen", {
                clubName,
                chatName,
              })
            }
            style={styles.button}
          >
            <MaterialIcons
              name="push-pin"
              size={24}
              color="black"
              style={styles.iconStyle}
            />
            <Text style={styles.buttonText}>Pinned Messages</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="black"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ImageGalleryScreen", {
                clubName,
                imageUrls,
                chatName,
              })
            }
            style={styles.button}
          >
            <MaterialIcons
              name="photo-library"
              size={24}
              color="black"
              style={styles.iconStyle}
            />
            <Text style={styles.buttonText}>Image Gallery</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="black"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
          {(currentUserPrivilege === "admin" ||
            currentUserPrivilege === "owner") && (
            <TouchableOpacity
              onPress={() => navigation.navigate("AdminChat", { clubName })}
              style={styles.button}
            >
              <MaterialIcons
                name="admin-panel-settings"
                size={24}
                color="black"
                style={styles.iconStyle}
              />
              <Text style={styles.buttonText}>Admin Chat</Text>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={24}
                color="black"
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.footerText}></Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerContainer: {
    width: "100%",
  },
  contentContainer: {
    flex: 1,
  },
  imageContainer: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  grayImage: {
    width: 200,
    height: 200,
    backgroundColor: "#ccc",
    borderRadius: 30,
  },
  clubNameText: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 10,
  },
  memberCountText: {
    fontStyle: "italic",
    marginTop: 5,
  },
  clubDescriptionText: {
    marginTop: 10,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "left",
    marginRight: 50,
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    backgroundColor: "#FAFAFA",
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: "100%",
    borderRadius: 5,
  },
  buttonText: {
    flex: 1,
    textAlign: "left",
    color: "black",
    fontSize: 16,
  },
  iconStyle: {
    marginRight: 10,
  },
  arrowIcon: {
    marginLeft: 60,
  },
  buttonFirst: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  buttonLast: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  footerText: {
    paddingVertical: 10,
    width: "100%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "#FAFAFA",
  },
});

export default InClubView;
