import { Alert } from "react-native";
// backend functions
import { firestore } from "../backend/FirebaseConfig";
import {
  doc,
  collection,
  query,
  where,
  limit,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import { getTimeZoneOffset } from "./timeFunctions";
// storage
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
// macros
import { SCHOOLS } from "../macros/macros";
// image
import * as ImagePicker from "expo-image-picker";
// document picker
import * as DocumentPicker from "expo-document-picker";
// functions
import { handleImageUpload, handleDocumentUpload } from "./uploadImage";
//  calendar
import { apiCalendar } from "../backend/CalendarApiConfig";
import * as Calendar from "expo-calendar";
// toast
import Toast from "react-native-toast-message";

const emailSplit = async () => {
  // try async storage first
  try {
    const value = await AsyncStorage.getItem("schoolKey");
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.error("Error getting school key from async:", error);
  }

  // if not there, get from auth
  const auth = getAuth();
  const user = auth.currentUser;
  return user.email.split("@")[1].split(".")[0];
};

const getSetUserData = async (setter) => {
  // get data from async storage
  try {
    const userData = await SecureStore.getItemAsync("user");
    if (userData) {
      setter(JSON.parse(userData));
    }
  } catch (error) {
    console.error("Error getting user data:", error);
  }
};

const getProfileData = async (userId) => {
  try {
    const userDocRef = doc(
      firestore,
      "schools",
      emailSplit(),
      "userData",
      userId
    );
    const userDocSnapshot = await getDoc(userDocRef);
    return userDocSnapshot.data();
  } catch (error) {
    console.error("Error getting user data:", error);
  }
};

const updateProfileData = async (userId, setter) => {
  try {
    let schoolKey = await emailSplit();

    const userDocRef = doc(firestore, "schools", schoolKey, "userData", userId);
    const userDocSnapshot = await getDoc(userDocRef);
    const userData = userDocSnapshot.data();

    // set user data
    setter(userData);
  } catch (error) {
    console.error("Error updating user data:", error);
  }
};

const fetchClubMembers = async (clubId, setClubMembers) => {
  const schoolKey = await emailSplit();

  const clubMembersRef = collection(
    firestore,
    "schools",
    schoolKey,
    "clubMemberData",
    "clubs",
    clubId
  );
  const clubMembersSnapshot = await getDocs(clubMembersRef);

  if (clubMembersSnapshot.empty) return;

  const clubMembers = clubMembersSnapshot.docs.map((doc) => doc.data());
  setClubMembers(clubMembers);
};

const getClubCategoryData = async (category) => {
  const schoolKey = await emailSplit();

  const clubsDocRef = collection(
    firestore,
    "schools",
    schoolKey,
    "clubSearchData",
    category,
    "clubs"
  );
  // get clubs based on category
  const clubsQuery = query(clubsDocRef, limit(10)); // order by club members
  const clubsSnapshot = await getDocs(clubsQuery);

  if (clubsSnapshot.empty) return;

  const clubs = clubsSnapshot.docs.map((doc) => doc.data());
  return clubs;
};

const fetchClubs = async (querySnapshot, setter) => {
  const fetchedClubs = querySnapshot.docs.map((doc) => doc.data());
  setter(fetchedClubs);
};

/*const getSetAllClubsDataObject = async (setter) => {
  const clubsRef = ref(db, `${emailSplit()}/clubs`);
  const snapshot = await get(clubsRef);
  setter(snapshot.val());
}*/

const getSetClubData = async (clubId, setter) => {
  const schoolKey = await emailSplit();
  const clubDocRef = doc(firestore, "schools", schoolKey, "clubData", clubId);
  const clubDocSnapshot = await getDoc(clubDocRef);

  if (!clubDocSnapshot.exists()) {
    console.log("Club not found.");
    return;
  }

  setter(clubDocSnapshot.data());
};

// get set my clubs data
const getSetMyClubsData = async (setter, setMutedClubs) => {
  const schoolKey = await emailSplit();

  // get clubs from async storage
  const userData = await SecureStore.getItemAsync("user");
  const user = JSON.parse(userData);
  const clubs = user.clubs;

  // get club data
  const clubData = [];
  let mutedClubs = [];
  if (clubs) {
    for (let i = 0; i < clubs.length; i++) {
      const clubId = clubs[i];
      const clubDocRef = doc(
        firestore,
        "schools",
        schoolKey,
        "clubData",
        clubId
      );
      const clubDocSnapshot = await getDoc(clubDocRef);

      if (clubDocSnapshot.exists()) {
        clubData.push(clubDocSnapshot.data());

        // get club member data
        const clubMemberRef = doc(
          firestore,
          "schools",
          schoolKey,
          "clubMemberData",
          "clubs",
          clubId,
          user.id
        );
        const clubMemberSnapshot = await getDoc(clubMemberRef);

        if (clubMemberSnapshot.exists()) {
          const clubMemberData = clubMemberSnapshot.data();
          if (clubMemberData.muted) {
            mutedClubs.push(clubId);
          }
          if (clubMemberData.unreadMessages) {
            clubData[i].unreadMessages = clubMemberData.unreadMessages;
          }
        }

        // get most recent message from club
        const clubMessagesRef = collection(
          firestore,
          "schools",
          schoolKey,
          "chatData",
          "clubs",
          clubId,
          "chats",
          "chat"
        );
        const clubMessagesQuery = query(
          clubMessagesRef,
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const clubMessagesSnapshot = await getDocs(clubMessagesQuery);

        if (!clubMessagesSnapshot.empty) {
          const messageData = clubMessagesSnapshot.docs[0].data();

          // most recent message
          let message =
            messageData.user.first + " " + messageData.user.last[0] + ": ";
          if (messageData.replyTo) {
            message += "replied to a message";
          } else if (messageData.text) {
            message += messageData.text;
          } else if (messageData.image) {
            message += "sent an Image";
          } else if (messageData.gifUrl) {
            message += "sent a GIF";
          } else if (messageData.voteOptions) {
            message += "sent a Poll";
          }
          clubData[i].lastMessage = message;

          // most recent message time
          if (messageData.createdAt) {
            // say date if message was not sent today
            const today = new Date();
            if (messageData.createdAt.toDate().getDate() !== today.getDate()) {
              clubData[i].lastMessageTime = messageData.createdAt
                .toDate()
                .toLocaleDateString();
            } else {
              // take out seconds
              clubData[i].lastMessageTime = messageData.createdAt
                .toDate()
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }
          }
        } else {
          clubData[i].lastMessage = "No messages yet";
          clubData[i].lastMessageTime = null;
        }
      }
    }
  }

  // update async storage
  await AsyncStorage.setItem("myClubs", JSON.stringify(clubData));

  if (setMutedClubs) {
    setMutedClubs(mutedClubs);
  }
  setter(clubData);
};

const getSetCalendarData = async (setter) => {
  // maybe change to query based on date or club
  const schoolKey = await emailSplit();
  const eventsDocRef = collection(
    firestore,
    "schools",
    schoolKey,
    "calendarData"
  );
  const eventsSnapshot = await getDocs(eventsDocRef);

  if (eventsSnapshot.empty) {
    console.log("No events found.");
    return;
  }

  const events = eventsSnapshot.docs.map((doc) => doc.data());
  setter(events);
};

const getSetClubCalendarData = async (clubId, setter) => {
  const schoolKey = await emailSplit();
  const eventsDocRef = collection(
    firestore,
    "schools",
    schoolKey,
    "calendarData"
  );
  const eventsQuery = query(eventsDocRef, where("clubId", "==", clubId));
  const eventsSnapshot = await getDocs(eventsQuery);

  if (eventsSnapshot.empty) {
    console.log("No events found.");
    return;
  }

  const events = eventsSnapshot.docs.map((doc) => doc.data());
  setter(events);
};

const getSetEventData = async (eventId, setter, setRSVPList) => {
  const schoolKey = await emailSplit();
  const eventDocRef = doc(
    firestore,
    "schools",
    schoolKey,
    "eventData",
    eventId
  );
  const eventDocSnapshot = await getDoc(eventDocRef);

  if (!eventDocSnapshot.exists()) {
    console.log("Event not found.");
    return;
  }

  const event = eventDocSnapshot.data();

  // get RSVP list
  setRSVPList(event.rsvps ? event.rsvps : []);

  setter(event);
};

const deleteEvent = async (eventId) => {
  const schoolKey = await emailSplit();

  // delete event data
  await deleteDoc(doc(firestore, "schools", schoolKey, "eventData", eventId));

  // delete event from calendar
  await deleteDoc(
    doc(firestore, "schools", schoolKey, "calendarData", eventId)
  );
};

const joinClub = async (id, privilege, userId) => {
  try {
    let userData;
    if (!userId) {
      // get user data from async storage
      const user = await SecureStore.getItemAsync("user");
      userData = JSON.parse(user);
    } else {
      // get user data based on user id from firestore
      userData = await getProfileData(userId);
    }

    const schoolKey = await emailSplit();

    // add user to club's members
    let clubMember = {
      userName: userData.userName,
      privilege: privilege ? privilege : "member",
      firstName: userData.firstName,
      lastName: userData.lastName,
      muted: false,
      unreadMessages: 0,
      id: userData.id,
    };
    if (userData.profileImg) {
      clubMember.profileImg = userData.profileImg;
    }
    if (userData.expoPushToken) {
      clubMember.expoPushToken = userData.expoPushToken;
    }

    const clubMembersDoc = doc(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      id,
      userData.id
    );
    await setDoc(clubMembersDoc, clubMember);

    // append clubid to user's clubs
    let updatedUserClubs = userData.clubs;

    if (updatedUserClubs == undefined) {
      updatedUserClubs = [];
    }
    updatedUserClubs.push(id);

    const userDocRef = doc(
      firestore,
      "schools",
      schoolKey,
      "userData",
      userData.id
    );
    await updateDoc(userDocRef, {
      clubs: updatedUserClubs,
    });

    // create object of user data with updated clubs
    userData.clubs = updatedUserClubs;
    await SecureStore.setItemAsync("user", JSON.stringify(userData));
  } catch (error) {
    console.error("Error processing request:", error);
  }
};

const requestToJoinClub = async (id, name, publicClub) => {
  if (publicClub) {
    joinClub(id, "member");
  } else {
    const schoolKey = await emailSplit();
    // get user id from async storage
    const userData = await SecureStore.getItemAsync("user");
    const user = JSON.parse(userData);

    // send request to club
    // get club ref
    const clubRequestsDocRef = doc(
      firestore,
      "schools",
      schoolKey,
      "clubRequestsData",
      "clubs",
      id,
      user.id
    );

    let clubRequest = {
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      expoPushToken: user.expoPushToken,
    };
    if (user.profileImg) {
      clubRequest.profileImg = user.profileImg;
    }

    await setDoc(clubRequestsDocRef, clubRequest);
  }
};

const acceptRequest = async (clubId, clubName, userId) => {
  // join club
  joinClub(clubId, "member", userId);

  const schoolKey = await emailSplit();

  // remove request
  await deleteDoc(
    doc(
      firestore,
      "schools",
      schoolKey,
      "clubRequestsData",
      "clubs",
      clubId,
      userId
    )
  );
};

const declineRequest = async (clubId, userId) => {
  const schoolKey = await emailSplit();

  // remove request
  await deleteDoc(
    doc(
      firestore,
      "schools",
      schoolKey,
      "clubRequestsData",
      "clubs",
      clubId,
      userId
    )
  );
};

const getSetRequestsData = async (setter, clubId) => {
  const schoolKey = await emailSplit();

  // get requests from firestore
  const clubRequestsDocRef = collection(
    firestore,
    "schools",
    schoolKey,
    "clubRequestsData",
    clubId
  );
  const clubRequestsSnapshot = await getDocs(clubRequestsDocRef);

  if (clubRequestsSnapshot.empty) {
    console.log("No requests found.");
    return;
  }

  const requests = clubRequestsSnapshot.docs.map((doc) => doc.data());
  setter(requests);
};

const leaveClubConfirmed = async (id) => {
  try {
    const schoolKey = await emailSplit();

    // get user id from async storage
    const userData = await SecureStore.getItemAsync("user");
    const user = JSON.parse(userData);
    const userId = user.id;

    // get current club status
    const clubMembersDoc = doc(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      id,
      userId
    );

    let wasOwner = false;

    // check if user is owner
    const clubMemberSnapshot = await getDoc(clubMembersDoc);
    if (clubMemberSnapshot.exists()) {
      const clubMember = clubMemberSnapshot.data();
      if (clubMember.privilege === "owner") {
        wasOwner = true;
      }
    }

    // check if user is only member
    const clubMembersRef = collection(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      id
    );

    let onlyMember = false;

    const clubMembersSnapshot = await getDocs(clubMembersRef);
    if (clubMembersSnapshot.size === 1) {
      // if user is only member, delete club
      onlyMember = true;
    }

    // then remove user from club
    await deleteDoc(clubMembersDoc);

    // remove club from user data
    const userClubsDocRef = doc(
      firestore,
      "schools",
      schoolKey,
      "userData",
      userId
    );
    const userClubsSnapshot = await getDoc(userClubsDocRef);

    if (userClubsSnapshot.exists()) {
      const userClubs = userClubsSnapshot.data().clubs;
      const updatedUserClubs = userClubs.filter((club) => club !== id);

      await updateDoc(userClubsDocRef, {
        clubs: updatedUserClubs,
      });

      // update async storage
      // create object of user data with updated clubs
      user.clubs = updatedUserClubs;
      await SecureStore.setItemAsync("user", JSON.stringify(user));
    }

    // get club categories for this club
    const clubCategoryRef = doc(
      firestore,
      "schools",
      schoolKey,
      "clubData",
      id
    );
    const clubCategorySnapshot = await getDoc(clubCategoryRef);
    const clubCategories = clubCategorySnapshot.data().clubCategories;

    if (onlyMember) {
      await deleteDoc(doc(firestore, "schools", schoolKey, "clubData", id));
      // delete club from club search data
      clubCategories.forEach(async (category) => {
        await deleteDoc(
          doc(
            firestore,
            "schools",
            schoolKey,
            "clubSearchData",
            category,
            "clubs",
            id
          )
        );
      });

      // eventually delete messages
      // eventually delete events
      alert("You have left the club and the club has been deleted");
      return;
    }

    // transfer ownership if user was owner
    if (wasOwner) {
      // query for a random admin
      const clubMembersRef = collection(
        firestore,
        "schools",
        schoolKey,
        "clubMemberData",
        "clubs",
        id
      );
      const adminQuery = query(
        clubMembersRef,
        where("privilege", "==", "admin"),
        limit(1)
      );

      const adminSnapshot = await getDoc(adminQuery);
      if (adminSnapshot.exists()) {
        const adminData = adminSnapshot.data();
        // update new owner
        await updateDoc(
          doc(
            firestore,
            "schools",
            schoolKey,
            "clubMemberData",
            "clubs",
            id,
            adminData.id
          ),
          {
            privilege: "owner",
          }
        );
      }
    }

    alert("You have left the club");
  } catch (error) {
    console.error("Error leaving club:", error);
  }
};

const getSetSchoolData = async (setter) => {
  const schoolKey = await emailSplit();
  // return school data from macros
  await setter(SCHOOLS[schoolKey]);
};

const checkMembership = async (clubId, setPrivilege, setIsRequestSent) => {
  // get user id from async storage
  const userData = await SecureStore.getItemAsync("user");
  const user = JSON.parse(userData);
  const userId = user.id;

  const schoolKey = await emailSplit();

  const clubMemberDocRef = doc(
    firestore,
    "schools",
    schoolKey,
    "clubMemberData",
    "clubs",
    clubId,
    userId
  );
  const snapshot = await getDoc(clubMemberDocRef);

  // check permissions
  if (snapshot.exists()) {
    const clubMember = snapshot.data();
    if (clubMember.privilege === "member") {
      setPrivilege("member");
    } else if (clubMember.privilege === "admin") {
      setPrivilege("admin");
    } else if (clubMember.privilege === "owner") {
      setPrivilege("owner");
    }
  } else {
    setPrivilege("none");
  }

  // check if user has requested to join
  const clubRequestsDocRef = doc(
    firestore,
    "schools",
    schoolKey,
    "clubRequestsData",
    "clubs",
    clubId,
    userId
  );
  const requestSnapshot = await getDoc(clubRequestsDocRef);

  if (requestSnapshot.exists()) {
    setIsRequestSent(true);
  } else {
    setIsRequestSent(false);
  }
};

const fetchMessages = async (
  querySnapshot,
  setMessages,
  setPinnedMessageCount
) => {
  const fetchedMessages = querySnapshot.docs.map((doc) => {
    // if poll, get poll data
    if (doc.data().voteOptions) {
      const voteOptions = doc.data().voteOptions;
      const question = doc.data().question;
      const votes = doc.data().votes;
      const voters = doc.data().voters;

      const pollData = {
        voteOptions: voteOptions,
        question: question,
        votes: votes,
        voters: voters,
      };

      return {
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        user: doc.data().user,
        voteOptions: voteOptions,
        question: question,
        votes: votes,
        voters: voters,
        pinned: doc.data().pinned || false,
        replyTo: doc.data().replyTo,
      };
    }

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

  // invert the order of messages
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

    //setLikedUserNames(userNames);
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

const deleteAccount = async () => {
  // get user id from async storage
  const userData = await SecureStore.getItemAsync("user");
  const user = JSON.parse(userData);
  const id = user.id;
  const clubArray = user.clubs;

  // remove user from all clubs
  if (clubArray) {
    clubArray.forEach((club) => {
      leaveClubConfirmed(club);
    });
  }

  // remove user from database
  const schoolKey = await emailSplit();
  const userDocRef = doc(firestore, "schools", schoolKey, "userData", id);
  await deleteDoc(userDocRef);

  // delete user from auth
  const auth = getAuth();
  const authUser = auth.currentUser;
  deleteUser(authUser)
    .then(() => {})
    .catch((error) => {
      Alert.alert("Error deleting user:", error);
    });

  // clear user data from async storage
  AsyncStorage.clear();
  SecureStore.deleteItemAsync("user");
};

// add user to attendance for an event
const attendEvent = async (eventId) => {
  const schoolKey = await emailSplit();

  // get user id from async storage
  const userData = await SecureStore.getItemAsync("user");
  const user = JSON.parse(userData);
  const userId = user.id;

  // get event data
  const eventDocRef = doc(
    firestore,
    "schools",
    schoolKey,
    "eventAttendance",
    eventId
  );
  const eventDocSnapshot = await getDoc(eventDocRef);
  const eventData = eventDocSnapshot.data();

  // add user to attendance list
  let attendanceList = eventData.attendance;
  if (attendanceList == undefined) {
    attendanceList = [];
  }
  attendanceList = [...attendanceList, userId];

  await updateDoc(eventDocRef, {
    attendance: attendanceList,
  });
};

// get list of users attending an event
const getSetEventAttendance = async (eventId, setter) => {
  const schoolKey = await emailSplit();

  const eventDocRef = doc(
    firestore,
    "schools",
    schoolKey,
    "eventAttendance",
    eventId
  );
  const eventDocSnapshot = await getDoc(eventDocRef);
  setter(eventDocSnapshot.data().attendance);
};

// get attendees' data
const getAttendeesData = async (attendees, setter) => {
  const schoolKey = await emailSplit();

  let attendeesData = [];
  // for every user id in the attendance list, get user data
  for (let i = 0; i < attendees.length; i++) {
    const userId = attendees[i];
    const userDocRef = doc(firestore, "schools", schoolKey, "userData", userId);
    const userDocSnapshot = await getDoc(userDocRef);

    // append user data to array
    if (userDocSnapshot.exists()) {
      attendeesData = [...attendeesData, userDocSnapshot.data()];
    }
  }

  setter(attendeesData);
};

const getClubCalendarData = async (clubId, setter) => {
  const schoolKey = await emailSplit();

  const eventsDocRef = collection(
    firestore,
    "schools",
    schoolKey,
    "calendarData"
  );
  const eventsQuery = query(eventsDocRef, where("clubId", "==", clubId));
  const eventsSnapshot = await getDocs(eventsQuery);

  if (eventsSnapshot.empty) {
    console.log("No events found.");
    return;
  }

  return setter(eventsSnapshot.docs.map((doc) => doc.data()));
};

const getEventDataForClub = async (clubId) => {
  const schoolKey = await emailSplit();

  const eventsDocRef = collection(firestore, "schools", schoolKey, "eventData");
  const eventsQuery = query(eventsDocRef, where("clubId", "==", clubId));
  const eventsSnapshot = await getDocs(eventsQuery);

  if (eventsSnapshot.empty) {
    console.log("No events found.");
    return;
  }

  return eventsSnapshot.docs.map((doc) => doc.data());
};

////////////////////////// calendar functions  //////////////////////////
// // get default calendar source (helper)
// async function getDefaultCalendarSource() {
//   const defaultCalendar = await Calendar.getDefaultCalendarAsync();
//   return defaultCalendar.source;
// }

// // create calendar
// async function getCalendar() {
//   // see if calendar id is already saved
//   // const calendarID = await AsyncStorage.getItem("calendarID");

//   const defaultCalendarSource = await getDefaultCalendarSource();
//   const newCalendarID = await Calendar.createCalendarAsync({
//     title: "Bark Calendar",
//     color: "red",
//     entityType: Calendar.EntityTypes.EVENT,
//     sourceId: defaultCalendarSource.id,
//     source: defaultCalendarSource,
//     name: "internalCalendarName",
//     ownerAccount: "personal",
//     accessLevel: Calendar.CalendarAccessLevel.OWNER,
//   });

//   // save calendar ID to async storage
//   await AsyncStorage.setItem("calendarID", newCalendarID);
//   return newCalendarID;
// }

// // sync events to calendar
// const syncEventsToCalendar = async () => {
//   // delete old calendar
//   await unsyncEventsFromCalendar();

//   // get calendar ID
//   const calendarID = await getCalendar();
//   console.log("Calendar ID:", calendarID);

//   // get calendar events (eventually cross-reference to make sure no duplicates)
//   // const events = await Calendar.getEventsAsync(
//   //   [calendarID],
//   //   new Date(),
//   //   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
//   // );

//   // get events for clubs user is in
//   const userData = await SecureStore.getItemAsync("user");

//   if (userData) {
//     const user = JSON.parse(userData);
//     const clubs = user.clubs;

//     let events = [];
//     if (user.clubs) {
//       // get user's events
//       for (let i = 0; i < clubs.length; i++) {
//         const clubId = clubs[i];
//         const clubEvents = await getEventDataForClub(clubId);

//         if (clubEvents) {
//           events = [...events, ...clubEvents];
//         }
//       }
//     }

//     // for each event, add to calendar
//     for (let i = 0; i < events.length; i++) {
//       const event = events[i];
//       addEventToCalendar(event, calendarID);
//     }
//   }
// };

// // unsync events from  calendar
// const unsyncEventsFromCalendar = async () => {
//   // delete calendar
//   const calendarID = await AsyncStorage.getItem("calendarID");
//   if (calendarID) {
//     console.log("Calendar ID found:", calendarID);
//     await Calendar.deleteCalendarAsync(calendarID);
//     console.log("Calendar deleted");
//   }

//   // delete calendar ID from async storage
//   await AsyncStorage.removeItem("calendarID");
// };

// // check if sync is toggled on
// const checkToggleSyncCalendar = async () => {
//   const signedIn = await AsyncStorage.getItem("syncCalendar");
//   return signedIn === "true";
// };

// // toggle sync  calendar async
// const toggleSyncCalendar = async (bool) => {
//   const signedIn = await AsyncStorage.getItem("syncCalendar");
//   if (signedIn === "true") {
//     AsyncStorage.setItem("syncCalendar", bool);
//   } else {
//     AsyncStorage.setItem("syncCalendar", bool);
//   }
// };

// // add new event to  calendar
// const addEventToCalendar = async (event, calendarID) => {
//   console.log("Event:", event);
//   const eventDate = event.date;
//   const minutes = event.duration ? event.duration : 30;
//   const endDate = new Date(eventDate) + minutes * 60000;

//   // create event object
//   const newEvent = {
//     title: event.name,
//     startDate: new Date(eventDate),
//     endDate: endDate,
//     location: event.address,
//     notes: event.description,
//   };

//   // add event to  calendar
//   try {
//     await Calendar.createEventAsync(calendarID, newEvent);
//     console.log("Event added to Calendar");
//   } catch (error) {
//     console.error("Error adding event to Calendar:", error);
//   }
// };

const addEventToDefaultCalendar = async (event) => {
  const defaultCalendar = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );

  const minutes = event.duration ? event.duration : 30;
  const endDate = new Date(event.date);
  endDate.setMinutes(endDate.getMinutes() + minutes);

  const newEvent = {
    title: event.name,
    startDate: new Date(event.date),
    endDate: endDate,
    location: event.address,
    notes: event.description,
  };

  await Calendar.createEventAsync(defaultCalendar[0].id, newEvent);
};

// // delete event from calendar
// const deleteEventFromCalendar = async (event) => {
//   try {
//     await apiCalendar.deleteEvent(event.id);
//   } catch (error) {
//     console.error("Error deleting event from  Calendar", error);
//   }
// };

// // update event in  calendar
// const updateEventInCalendar = async (event) => {
//   // create event object
//   const newEvent = {
//     summary: event.name,
//     start: {
//       dateTime: new Date(event.date).toISOString(),
//       timeZone: getTimeZoneOffset(), // change to user's timezone
//     },
//     end: {
//       dateTime: event.duration
//         ? (new Date(event.date) + event.time + event.duration).toISOString()
//         : (new Date(event.date) + event.time + 30).toISOString(),
//       timeZone: getTimeZoneOffset(),
//     },
//   };

//   // update event in  calendar
//   try {
//     await apiCalendar.updateEvent({
//       calendarId: "primary",
//       eventId: event.id,
//       resource: newEvent,
//     });
//   } catch (error) {
//     console.error("Error updating event in  Calendar:", error);
//   }
// };

// vote in a poll
const voteInPoll = async (messageRef, voteId, userId) => {
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

// save dark mode setting
const setDarkMode = async (darkMode) => {
  await AsyncStorage.setItem("darkMode", darkMode);
};

// get dark mode setting
const getDarkMode = async () => {
  const darkMode = await AsyncStorage.getItem("darkMode");
  return darkMode === "true";
};

const showToastIfNewUser = async (type, text1, text2) => {
  const user = await SecureStore.getItemAsync("user");
  const userData = JSON.parse(user);
  if (!userData.clubs || userData.clubs.length === 0) {
    Toast.show({
      text1: text1,
      text2: text2,
      type: type,
    });
  }
};

export {
  emailSplit,
  getSetSchoolData,
  getSetUserData,
  getProfileData,
  updateProfileData,
  getSetClubData,
  getSetMyClubsData,
  fetchClubs,
  getClubCategoryData,
  fetchClubMembers,
  joinClub,
  requestToJoinClub,
  getSetRequestsData,
  acceptRequest,
  declineRequest,
  leaveClubConfirmed,
  checkMembership,
  getSetEventData,
  deleteEvent,
  getSetEventAttendance,
  getAttendeesData,
  attendEvent,
  getSetCalendarData,
  getSetClubCalendarData,
  getClubCalendarData,
  fetchMessages,
  handleCameraPress,
  handleLongPress,
  pinMessage,
  handlePressMessage,
  handleImageUploadAndSend,
  handleDocumentUploadAndSend,
  voteInPoll,
  // syncEventsToCalendar,
  // unsyncEventsFromCalendar,
  // toggleSyncCalendar,
  // checkToggleSyncCalendar,
  // addEventToCalendar,
  // deleteEventFromCalendar,
  // updateEventInCalendar,
  addEventToDefaultCalendar,
  deleteAccount,
  setDarkMode,
  getDarkMode,
  showToastIfNewUser,
};
