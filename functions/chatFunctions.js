import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../backend/FirebaseConfig";
import { emailSplit } from "./backendFunctions";
import { handleImageUpload, handleDocumentUpload } from "./fileFunctions";

const fetchMessages = async (
  querySnapshot,
  setMessages,
  setPinnedMessageCount
) => {
  const fetchedMessages = querySnapshot.docs.map((doc) => {
    // if poll, get poll data
    if (doc.data().voteOptions) {
      return {
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        user: doc.data().user,
        voteOptions: doc.data().voteOptions,
        question: doc.data().question,
        votes: doc.data().votes,
        voters: doc.data().voters,
        pinned: doc.data().pinned || false,
        replyTo: doc.data().replyTo,
      };
    }

    // normal message
    return {
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(),
      text: doc.data().text,
      user: doc.data().user,
      image: doc.data().image,
      likeCount: doc.data().likeCount || 0,
      likes: doc.data().likes || [],
      pinned: doc.data().pinned || false,
      gifUrl: doc.data().gifUrl,
      replyTo: doc.data().replyTo,
    };
  });

  // invert the order of messages to show newest first
  fetchedMessages.reverse();

  setMessages(fetchedMessages);

  // Calculate and update the count of pinned messages.
  if (setPinnedMessageCount)
    setPinnedMessageCount(
      fetchedMessages.filter((message) => message.pinned).length
    );
};

const handleImageUploadAndSend = async (
  chatType,
  setImageUrl,
  closeModal,
  setTempImageUrl
) => {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    alert("You've refused to allow this app to access your photos!");
    return;
  }

  let pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
  });

  if (closeModal) {
    closeModal();
  }

  if (
    !pickerResult.canceled &&
    pickerResult.assets &&
    pickerResult.assets.length > 0
  ) {
    // set image url if needed
    if (setTempImageUrl) {
      const image = pickerResult.assets[0].uri;
      setTempImageUrl(image);

      // add image to async storage
      const images = await AsyncStorage.getItem("userImages");

      if (images) {
        await AsyncStorage.setItem("userImages", images + "," + image);
      } else {
        await AsyncStorage.setItem("userImages", image);
      }
    }

    // send image to firebase
    handleImageUpload(chatType, setImageUrl, pickerResult.assets[0].uri);
  }
};

// Define the function to handle camera press
const handleCameraPress = async (
  chatType,
  setImageUrl,
  closeModal,
  setTempImageUrl
) => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== "granted") {
    alert("Permission to access camera was denied");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  closeModal();

  if (!result.canceled) {
    // set image url if needed
    if (setTempImageUrl) {
      const image = pickerResult.assets[0].uri;
      setTempImageUrl(image);

      // add image to async storage
      const images = await AsyncStorage.getItem("userImages");

      if (images) {
        await AsyncStorage.setItem("userImages", images + "," + image);
      } else {
        await AsyncStorage.setItem("userImages", image);
      }
    }

    // change to where uploads taken photo to firebase
    handleImageUpload(chatType, setImageUrl, result.assets[0].uri);
  }
};

// Define the function to handle document press
const handleDocumentUploadAndSend = async (
  chatType,
  setDocumentUrl,
  closeModal
) => {
  let pickerResult = await DocumentPicker.getDocumentAsync();

  if (closeModal) {
    closeModal();
  }

  if (!pickerResult.canceled) {
    handleDocumentUpload(chatType, setDocumentUrl, pickerResult.assets[0].uri);
  }
};

const handlePressMessage = (
  likes,
  setLikedProfileImages,
  setIsLikesModalVisible
) => {
  // if no likes, return
  if (!likes || likes.length === 0) {
    setLikedProfileImages(new Set());
    return;
  }

  // get user names and profile pictures based on ids from firestore
  const setLikesUserDataById = async () => {
    const schoolKey = await emailSplit();

    let userNames = new Set();
    let profilePics = new Set();
    for (let i = 0; i < likes.length; i++) {
      let userId = likes[i];
      const userDocRef = doc(
        firestore,
        "schools",
        schoolKey,
        "userData",
        userId
      );
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        userNames.add(userData.userName);
        if (userData.profileImg) {
          profilePics.add(userData.profileImg);
        } else {
          profilePics.add(null);
        }
      }
    }

    setLikedProfileImages(profilePics);
  };

  setLikesUserDataById();
  setIsLikesModalVisible(true);
};

// Function to delete a message
const deleteMessage = async (messageRef) => {
  await deleteDoc(messageRef);
};

// pin message
const pinMessage = async (messageRef, newPinStatus) => {
  try {
    await updateDoc(messageRef, { pinned: newPinStatus });
  } catch (error) {
    console.error("Error pinning message:", error);
  }
};

// Define the function to handle long press
const handleLongPress = async (
  message,
  currentUserPrivilege,
  setReplyingToMessage,
  messageRef
) => {
  // get user id
  const userData = await SecureStore.getItemAsync("user");
  const user = JSON.parse(userData);
  const userId = user.id;

  try {
    // Define the options array with the 'Cancel' option
    let options = [
      { text: "Cancel", style: "cancel" },
      {
        text: message.pinned ? "Unpin" : "Pin",
        onPress: () => pinMessage(messageRef, !message.pinned),
      },
      {
        text: "Reply",
        onPress: () => setReplyingToMessage(message),
      },
    ];

    // Add the delete option based on the fetched privilege
    if (
      message.user._id === userId ||
      currentUserPrivilege === "owner" ||
      currentUserPrivilege === "admin"
    ) {
      options.push({
        text: "Delete Message",
        style: "destructive",
        onPress: () => {
          // Assuming the delete operation targets Firestore
          deleteMessage(messageRef);
        },
      });
    }

    Alert.alert("Options", "Select an option", options.filter(Boolean), {
      cancelable: false,
    });
  } catch (error) {
    console.error("Error handling long press:", error);
  }
};

// vote in a poll
const voteInPoll = async (messageRef, voteId, userId) => { // optimize by using batch
  try {
    // get old votes
    const messageSnapshot = await getDoc(messageRef);
    const messageData = messageSnapshot.data();
    let votes = messageData.votes;
    await updateDoc(messageRef, {
      votes: [...votes, voteId],
      voters: [...messageData.voters, userId],
    });
  } catch (error) {
    console.error("Error voting:", error);
  }
};

async function sendPushNotification(
  expoPushToken,
  message,
  firstName,
  lastName,
  clubName,
  clubId,
  chatName
) {
  let text = message ? message : "An image was sent.";
  text = chatName === "chat" ? text : chatName + ": " + text;

  const notification = {
    to: expoPushToken,
    sound: "default",
    title: clubName,
    body: `${firstName} ${lastName}: ${text}`,
    data: { link: "myapp://clubId=" + clubId + "&chatName=" + chatName },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification),
  });
}

export {
  fetchMessages,
  handleImageUploadAndSend,
  handleCameraPress,
  handleDocumentUploadAndSend,
  handlePressMessage,
  deleteMessage,
  handleLongPress,
  pinMessage,
  voteInPoll,
  sendPushNotification,
};
