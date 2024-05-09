import { Alert } from 'react-native';
// backend functions
import { db, firestore } from '../backend/FirebaseConfig';
import { ref, get, update, onValue, set} from "firebase/database"
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, deleteUser } from "firebase/auth";
// storage
import { getStorage } from "firebase/storage";
// macros
import { SCHOOLS } from '../macros/macros';
// image
import * as ImagePicker from 'expo-image-picker';
// functions
import handleImageUpload from './uploadImage';

const emailSplit = async () => {

  // try async storage first
  try {
    const value = await AsyncStorage.getItem('school');
    if (value !== null) {
      return value.key;
    }
  } catch (error) {
    console.error('Error getting school key from async:', error);
  }

  // if not there, get from auth
  const auth = getAuth();
  const user = auth.currentUser;
  return user.email.split('@')[1].split('.')[0];
}

const getSetUserData = async (setter) => {
    // get user data from auth
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user.uid;

    updateProfileData(userId, setter);
}

const updateProfileData = async (userId, setter) => {
    try {
      const userRef = ref(db, `${emailSplit()}/users/${userId}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();

        // set user data
        setter(userData);
        console.log(userData);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
};

const getSetAllClubsData = async (setter) => {
    const starCountRef = ref(db, `${emailSplit()}/clubs`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const newClubs = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
      }));
      console.log(newClubs);
      setter(newClubs);
    })
}

const getSetAllClubsDataObject = async (setter) => {
  const clubsRef = ref(db, `${emailSplit()}/clubs`);
  const snapshot = await get(clubsRef);
  setter(snapshot.val());
}

const getSetClubData = async (clubId, setter) => {
    const starCountRef = ref(db, `${emailSplit()}/clubs/${clubId}`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      setter(data);
    })
}

const getSetAllEventsData = async (setter) => {
  // get event data
  const starCountRef = ref(db, `${emailSplit()}/events`);
  onValue(starCountRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.log('No events found.');
      return;
    }
    
    const data = snapshot.val();
    const newEvents = Object.keys(data).map(key => ({
      id:key, 
      ...data[key]
    }));
    console.log(newEvents);
    setter(newEvents);
  })
}

const getSetEventData = async (setter, eventId) => {
  const starCountRef = ref(db, `${emailSplit()}/events/${eventId}`);
  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    const newEvent = {
      id: eventId,
      ...data
    };
    console.log(newEvent);
    setter(newEvent);
  })
}

const joinClub = async (id, name, userId, privilege) => {
  try {
    let _userId;
    if (!userId) {
      const auth = getAuth();
      const user = auth.currentUser;
      _userId = user.uid;
    } else {
      _userId = userId;
    }

    const userRef = ref(db, `${emailSplit()}/users/${_userId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      console.error('User data not found.');
      return;
    }

    const userData = userSnapshot.val();

    // add club to user data
    const updatedUserClubs = {
      ...userData.clubs,
      [id]: {
        clubName: name,
        privilege: 'member',
      }
    };
    
    await set(userRef, {
      ...userData,
      clubs : updatedUserClubs,
    });

    // set club members in club
    const clubRef = ref(db, `${emailSplit()}/clubs/${id}`);
    const clubSnapshot = await get(clubRef);

    if (!clubSnapshot.exists()) {
      console.error('Club data not found.');
      return;
    }

    const clubData = clubSnapshot.val();

    if (clubData.clubMembers && clubData.clubMembers[_userId]) {
      alert(`You are already a member of ${name}`);
      return;
    }
    
    const updatedClubMembers = {
      ...clubData.clubMembers,
      [_userId]: {
        userName: userData.userName,
        privilege: privilege ? privilege : 'member',
        profileImg: userData.profileImg ? userData.profileImg : null,
        firstName: userData.firstName,
        lastName: userData.lastName,
        expoPushToken: userData.expoPushToken,
        muted: false,
      }
    };

    await set(clubRef, {
      ...clubData,
      clubMembers: updatedClubMembers,
    });

  } catch (error) {
    console.error('Error processing request:', error);
  }
};

const requestToJoinClub = async (id, name, publicClub) => {
  if (publicClub) {
    joinClub(id, name, null, 'member')
  } else {
    // send request to club
    // get club ref
    const clubRequestsRef = ref(db, `${emailSplit()}/clubs/${id}/requests`);
    const clubRequestsSnapshot = await get(clubRequestsRef);

    let clubRequestsData = {};
    if (clubRequestsSnapshot.exists()) {
      clubRequestsData = clubRequestsSnapshot.val();
    }

    // get user data
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user.uid;

    const userRef = ref(db, `${emailSplit()}/users/${userId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      console.error('User data not found.');
      return;
    }

    const userData = userSnapshot.val();

    // add request to club data
    const updatedClubRequests = {
      ...clubRequestsData,
      [userId] : {
        userId: userId,
        userName: userData.userName,
        userPhoto: userData.profileImg ? userData.profileImg : null,
        userFirstName: userData.firstName,
        userLastName: userData.lastName,
      }
    };

    await set(clubRequestsRef, updatedClubRequests);
  }
}

const acceptRequest = async (clubId, clubName, userId) => {

  // join club
  joinClub(clubId, clubName, userId, 'member');

  // remove request
  const requestRef = ref(db, `${emailSplit()}/clubs/${clubId}/requests/${userId}`);
  await set(requestRef, null); 
}

const declineRequest = async (clubId, userId) => {
  const requestRef = ref(db, `${emailSplit()}/clubs/${clubId}/requests/${userId}`);
  await set(requestRef, null);
}

const leaveClubConfirmed = async (id) => {
  try {
    // get user id
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user.uid;

    // remove user from club members
    const clubRef = ref(db, `${emailSplit()}/clubs/${id}/clubMembers/${userId}`);

    let wasOwner = false;

    // check if user is owner
    const clubSnapshot = await get(clubRef);
    const clubData = clubSnapshot.val();
    if (clubData.privilege === 'owner') {
      wasOwner = true;
    }
    // then remove user from club
    await set(clubRef, null);

    // remove club from user data
    const userRef = ref(db, `${emailSplit()}/users/${userId}/clubs/${id}`);
    await set(userRef, null);

    // delete club if no members
    const clubMembersRef = ref(db, `${emailSplit()}/clubs/${id}/clubMembers`);
    const clubMembersSnapshot = await get(clubMembersRef);

    if (!clubMembersSnapshot.exists()) {
      const clubDeleteRef = ref(db, `${emailSplit()}/clubs/${id}`);
      await set(clubDeleteRef, null);
      return;
    }

    // transfer ownership if user was owner
    if (wasOwner) {
      const clubMembersRef = ref(db, `${emailSplit()}/clubs/${id}/clubMembers`);
      const clubMembersSnapshot = await get(clubMembersRef);
      const clubMembers = clubMembersSnapshot.val();
      const newOwner = Object.keys(clubMembers)[0];

      const newOwnerRef = ref(db, `${emailSplit()}/clubs/${id}/clubMembers/${newOwner}`);
      await update(newOwnerRef, {
        privilege: 'owner',
      });
    }

    alert('You have left the club');
  } catch (error) {
    console.error('Error leaving club:', error);
  }
};

const getSetSchoolData = async (setter) => {
  // return school data from macros
  await setter(SCHOOLS[emailSplit()]);
}

const checkMembership = async (clubId, setPrivilege, setIsRequestSent) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const userId = user.uid;
    const clubRef = ref(db, `${emailSplit()}/clubs/${clubId}/clubMembers`);

    // check permissions
    const snapshot = await get(clubRef);
    if (snapshot.exists()) {
      const clubMembers = snapshot.val();
      if (clubMembers[userId] === undefined) {
        setPrivilege('none');
      } else if (clubMembers[userId].privilege === 'member') {
        setPrivilege('member');
      } else if (clubMembers[userId].privilege === 'admin') {
        setPrivilege('admin');
      } else if (clubMembers[userId].privilege === 'owner') {
        setPrivilege('owner');
      }
    }

    // check if user has requested to join
    if (setIsRequestSent !== undefined) {
      const requestsRef = ref(db, `${emailSplit()}/clubs/${clubId}/requests`);
      const requestsSnapshot = await get(requestsRef);

      if (requestsSnapshot.exists()) {
        const requests = requestsSnapshot.val();
        if (requests[userId] !== undefined) {
          setIsRequestSent(true);
        }
      }
    }
  }
};

const fetchMessages = async (querySnapshot, setMessages, setPinnedMessageCount) => {
  const fetchedMessages = querySnapshot.docs.map(doc => ({
    _id: doc.id,
    createdAt: doc.data().createdAt.toDate(),
    text: doc.data().text,
    user: doc.data().user,
    image: doc.data().image,
    likeCount: doc.data().likeCount || 0,
    likes: doc.data().likes || [],
    pinned: doc.data().pinned || false,
    gifUrl: doc.data().gifUrl,
    replyTo: doc.data().replyTo,
  }));

  // Since we fetch messages in descending order, we set them directly.
  setMessages(fetchedMessages);

  // Calculate and update the count of pinned messages.
  setPinnedMessageCount(fetchedMessages.filter(message => message.pinned).length);
};

// Define the function to handle camera press
const handleCameraPress = async (setImageUrl, closeModal, setTempImageUrl) => {
     
  const { status } = await ImagePicker.requestCameraPermissionsAsync();


  if (status !== 'granted') {
    alert('Permission to access camera was denied');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  console.log(result);

  closeModal();

  if (!result.canceled) {
    setTempImageUrl(result.assets[0].uri);

    // change to where uploads taken photo to firebase
    handleImageUpload("chat", setImageUrl, result.assets[0].uri);
  }
};

const handlePressMessage = (likes, setLikedUserNames, setIsLikesModalVisible) => {
  if (!likes || likes.length === 0) {
    setLikedUserNames([]); // Corrected to use setLikedUserNames
    return;
  }

  setLikedUserNames(likes);
  setIsLikesModalVisible(true);
  console.log('Likes:', likes);
};

// Function to delete a message
const deleteMessage = async (messageId, chatType) => {
  await deleteDoc(doc(firestore, chatType, messageId));
  console.log('Message deleted successfully');
};

// Define the function to handle long press
const handleLongPress = async (message, currentUserPrivilege, setReplyingToMessage, chatType) => {

  // get user id
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user.uid;

  try {
    // Define the options array with the 'Cancel' option
    let options = [
      { text: 'Cancel', style: 'cancel' },
      {
        text: message.pinned ? 'Unpin' : 'Pin',
        onPress: async () => {
          // Assuming this part remains unchanged as it likely updates Firestore
          const newPinStatus = !message.pinned;
          await updateDoc(doc(firestore, chatType, message._id), { pinned: newPinStatus });
        },
      },
      {
        text: 'Reply',
        onPress: () => setReplyingToMessage(message),
      },
    ];

    // Add the delete option based on the fetched privilege
    if (message.user._id === userId || currentUserPrivilege === 'owner' || currentUserPrivilege === 'admin') {
      options.push({
        text: 'Delete Message',
        style: 'destructive',
        onPress: () => {
          // Assuming the delete operation targets Firestore
          deleteMessage(message._id, chatType);
        },
      });
    }

    Alert.alert('Options', 'Select an option', options.filter(Boolean), { cancelable: false });
  } catch (error) {
    console.error('Error handling long press:', error);
  }
};

const handleImageUploadAndSend = async (chatType, setImageUrl, closeModal, setTempImageUrl) => {

  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    alert("You've refused to allow this app to access your photos!");
    return;
  }

  let pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (closeModal) {
    closeModal(); 
  }

  if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
    if (setTempImageUrl) {
      setTempImageUrl(pickerResult.assets[0].uri);
    }

    handleImageUpload(chatType, setImageUrl, pickerResult.assets[0].uri);
  }
};

const deleteAccount = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const id = user.uid;

  // get user's clubs
  const userRef = ref(db, `${emailSplit()}/users/${id}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();
  const userClubs = userData.clubs;

  // turn clubs into array
  const clubArray = Object.keys(userClubs);

  // remove user from all clubs
  clubArray.forEach(club => {
    leaveClubConfirmed(club, id);
  });

  // remove user from database
  await set(userRef, null);

  // delete user from auth
  deleteUser(user).then(() => {
  }).catch((error) => {
    Alert.alert('Error deleting user:', error);
  });

}

export { getSetUserData, updateProfileData, getSetAllClubsData, getSetAllClubsDataObject, getSetClubData, getSetAllEventsData, getSetEventData, joinClub, 
  requestToJoinClub, acceptRequest, declineRequest, leaveClubConfirmed, emailSplit, getSetSchoolData, checkMembership, 
  fetchMessages, handleCameraPress, handleLongPress, handlePressMessage, handleImageUploadAndSend, deleteAccount};