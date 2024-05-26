import { Alert } from 'react-native';
// backend functions
import { firestore } from '../backend/FirebaseConfig';
import { doc, collection, query, where, limit, updateDoc, deleteDoc, setDoc, getDoc, getDocs, orderBy } from 'firebase/firestore';
import { getAuth, deleteUser } from "firebase/auth";
// storage
import AsyncStorage from '@react-native-async-storage/async-storage';
// macros
import { SCHOOLS } from '../macros/macros';
// image
import * as ImagePicker from 'expo-image-picker';
// functions
import handleImageUpload from './uploadImage';

const emailSplit = async () => {

  // try async storage first
  try {
    const value = await AsyncStorage.getItem('schoolKey');
    if (value !== null) {
      return value;
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
   // get data from async storage
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setter(JSON.parse(userData));
      }
     } catch (error) {
      console.error('Error getting user data:', error);
    }
}

const getProfileData = async (userId) => {
  try {
    const userDocRef = doc(firestore, 'schools', emailSplit(), 'userData', userId);
    const userDocSnapshot = await getDoc(userDocRef);
    return userDocSnapshot.data();
  } catch (error) {
    console.error('Error getting user data:', error);
  }
}

const updateProfileData = async (userId, setter) => {
    try {
      let schoolKey = await emailSplit();

      const userDocRef = doc(firestore, 'schools', schoolKey, 'userData', userId);
      const userDocSnapshot = await getDoc(userDocRef);
      const userData = userDocSnapshot.data();

      // set user data
      setter(userData);
      console.log(userData);
    
    } catch (error) {
      console.log(emailSplit())
      console.error('Error updating user data:', error);
    }
};

const fetchClubMembers = async (clubId, setClubMembers) => {
  const schoolKey = await emailSplit();

  const clubMembersRef = collection(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId);
  const clubMembersSnapshot = await getDocs(clubMembersRef);

  if (clubMembersSnapshot.empty) {
    console.log('No club members found.');
    return;
  }

  const clubMembers = clubMembersSnapshot.docs.map(doc => doc.data());
  setClubMembers(clubMembers);
};

const getClubCategoryData = async (category) => {
  const schoolKey = await emailSplit();

  console.log('Getting clubs for category:', category);

  const clubsDocRef = collection(firestore, 'schools', schoolKey, 'clubSearchData', category, 'clubs');
  // get clubs based on category
  const clubsQuery = query(clubsDocRef, orderBy('clubMembers', 'desc'), limit(10)); // order by club members
  const clubsSnapshot = await getDocs(clubsQuery);

  if (clubsSnapshot.empty) {
    console.log('No clubs found.');
    return;
  }

  const clubs = clubsSnapshot.docs.map(doc => doc.data());
  console.log(clubs);
  return clubs;
}

const fetchClubs = async (querySnapshot, setter) => {
  const fetchedClubs = querySnapshot.docs.map(doc => doc.data());
  setter(fetchedClubs);
};

/*const getSetAllClubsDataObject = async (setter) => {
  const clubsRef = ref(db, `${emailSplit()}/clubs`);
  const snapshot = await get(clubsRef);
  setter(snapshot.val());
}*/

const getSetClubData = async (clubId, setter) => {
  const schoolKey = await emailSplit();
  const clubDocRef = doc(firestore, 'schools', schoolKey, 'clubData', clubId);
  const clubDocSnapshot = await getDoc(clubDocRef);

  if (!clubDocSnapshot.exists()) {
    console.log('Club not found.');
    return;
  }

  setter(clubDocSnapshot.data());
}

// get set my clubs data
const getSetMyClubsData = async (setter, setMutedClubs) => {
  const schoolKey = await emailSplit();

  // get clubs from async storage
  const userData = await AsyncStorage.getItem('user');
  const user = JSON.parse(userData);
  const clubs = user.clubs;

  // get club data
  const clubData = [];
  let mutedClubs = [];
  for (let i = 0; i < clubs.length; i++) {
    const clubId = clubs[i];
    const clubDocRef = doc(firestore, 'schools', schoolKey, 'clubData', clubId);
    const clubDocSnapshot = await getDoc(clubDocRef);

    if (clubDocSnapshot.exists()) {
      clubData.push(clubDocSnapshot.data());

      // get club member data
      const clubMemberRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, user.id);
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
      const clubMessagesRef = collection(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'chats', 'chat');
      const clubMessagesQuery = query(clubMessagesRef, orderBy('createdAt', 'desc'), limit(1));
      const clubMessagesSnapshot = await getDocs(clubMessagesQuery);

      if (!clubMessagesSnapshot.empty) {
        const messageData = clubMessagesSnapshot.docs[0].data();
        if (messageData.text == '') {
          if (messageData.image) {
            clubData[i].lastMessage = 'An image was sent';
          } else if (messageData.gif) {
            clubData[i].lastMessage = 'A gif was sent';
          }
        } else {
          clubData[i].lastMessage = messageData.text;
        }

        // most recent message time
        if (messageData.createdAt) {
          // say date if message was not sent today
          const today = new Date();
          if (messageData.createdAt.toDate().getDate() !== today.getDate()) {
            clubData[i].lastMessageTime = messageData.createdAt.toDate().toLocaleDateString();
          } else {
            // take out seconds
            clubData[i].lastMessageTime = messageData.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          }
        }
      } else {
        clubData[i].lastMessage = 'No messages yet';
        clubData[i].lastMessageTime = null;
      }
    }
  }

  console.log('MY CLUBS:', clubData);

  // update async storage
  await AsyncStorage.setItem('myClubs', JSON.stringify(clubData));

  setMutedClubs(mutedClubs);
  setter(clubData);
}

/*const getSetAllEventsData = async (setter) => {
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
}*/

const getSetCalendarData = async (setter) => { // maybe change to query based on date or club
  const schoolKey = await emailSplit();
  const eventsDocRef = collection(firestore, 'schools', schoolKey, 'calendarData');
  const eventsSnapshot = await getDocs(eventsDocRef);

  if (eventsSnapshot.empty) {
    console.log('No events found.');
    return;
  }

  const events = eventsSnapshot.docs.map(doc => doc.data());
  console.log('EVENTS: ', events);
  setter(events);
}

const getSetClubCalendarData = async (clubId, setter) => {
  const schoolKey = await emailSplit();
  const eventsDocRef = collection(firestore, 'schools', schoolKey, 'calendarData');
  const eventsQuery = query(eventsDocRef, where('clubId', '==', clubId));
  const eventsSnapshot = await getDocs(eventsQuery);

  if (eventsSnapshot.empty) {
    console.log('No events found.');
    return;
  }

  const events = eventsSnapshot.docs.map(doc => doc.data());
  console.log('EVENTS: ', events);
  setter(events);
}

const getSetEventData = async (eventId, setter, setRSVPList) => {
  const schoolKey = await emailSplit();
  const eventDocRef = doc(firestore, 'schools', schoolKey, 'eventData', eventId);
  const eventDocSnapshot = await getDoc(eventDocRef);

  if (!eventDocSnapshot.exists()) {
    console.log('Event not found.');
    return;
  }

  const event = eventDocSnapshot.data();

  console.log('Event data:', event);

  // get RSVP list
  setRSVPList(event.rsvps? event.rsvps : []);

  setter(event);
}

const deleteEvent = async (eventId) => {
  const schoolKey = await emailSplit();

  // delete event data
  await deleteDoc(doc(firestore, 'schools', schoolKey, 'eventData', eventId));

  // delete event from calendar
  await deleteDoc(doc(firestore, 'schools', schoolKey, 'calendarData', eventId));
}

const joinClub = async (id, privilege, userId) => {
  try {
    let userData;
    if (!userId) {
      // get user data from async storage
      const user = await AsyncStorage.getItem('user');
      userData = JSON.parse(user);
    } else {
      // get user data based on user id from firestore
      userData = await getProfileData(userId);
    }

    const schoolKey = await emailSplit();

    // add user to club's members
    let clubMember = {
      userName: userData.userName,
      privilege: privilege ? privilege : 'member',
      firstName: userData.firstName,
      lastName: userData.lastName,
      expoPushToken: userData.expoPushToken,
      muted: false,
      unreadMessages: 0,
    };
    if (userData.profileImg) {
      clubMember.profileImg = userData.profileImg;
    }

    const clubMembersDoc = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', id, userData.id);
    await setDoc(clubMembersDoc, clubMember);

    // append clubid to user's clubs
    let updatedUserClubs = userData.clubs;
    
    if (updatedUserClubs == undefined) {
      updatedUserClubs = [];
    }
    updatedUserClubs.push(id);

    const userDocRef = doc(firestore, 'schools', schoolKey, 'userData', userData.id);
    await updateDoc(userDocRef, {
      clubs: updatedUserClubs,
    });

    // update clubSearchData (just updates club members for ordering purposes)
    const clubDocRef = doc(firestore, 'schools', schoolKey, 'clubSearchData', 'clubs', id);
    const clubDocSnapshot = await getDoc(clubDocRef);
    let clubMembers = clubDocSnapshot.data();
    if (clubMembers) {
      clubMembers++;
    } else {
      clubMembers = 1;
    }

    await updateDoc(clubDocRef, {
      clubMembers: clubMembers,
    });

    // update async storage
    // create object of user data with updated clubs
    userData.clubs = updatedUserClubs;
    await AsyncStorage.setItem('user', JSON.stringify(userData));

  } catch (error) {
    console.error('Error processing request:', error);
  }
};

const requestToJoinClub = async (id, name, publicClub) => {
  if (publicClub) {
    joinClub(id, 'member')
  } else {
    const schoolKey = await emailSplit();
    // get user id from async storage
    const userData = await AsyncStorage.getItem('user');
    const user = JSON.parse(userData);

    // send request to club
    // get club ref
    const clubRequestsDocRef = doc(firestore, 'schools', schoolKey, 'clubRequestsData', 'clubs', id, user.id);

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
}

const acceptRequest = async (clubId, clubName, userId) => {

  // join club
  joinClub(clubId, 'member', userId);

  const schoolKey = await emailSplit();

  // remove request
  await deleteDoc(doc(firestore, 'schools', schoolKey, 'clubRequestsData', 'clubs', clubId, userId));
}

const declineRequest = async (clubId, userId) => {
  const schoolKey = await emailSplit();

  // remove request
  await deleteDoc(doc(firestore, 'schools', schoolKey, 'clubRequestsData', 'clubs', clubId, userId));
}

const getSetRequestsData = async (setter, clubId) => {
  const schoolKey = await emailSplit();

  // get requests from firestore
  const clubRequestsDocRef = collection(firestore, 'schools', schoolKey, 'clubRequestsData', clubId);
  const clubRequestsSnapshot = await getDocs(clubRequestsDocRef);

  if (clubRequestsSnapshot.empty) {
    console.log('No requests found.');
    return;
  }

  const requests = clubRequestsSnapshot.docs.map(doc => doc.data());
  setter(requests);
}

const leaveClubConfirmed = async (id) => {
  try {
    const schoolKey = await emailSplit();

    // get user id from async storage
    const userData = await AsyncStorage.getItem('user');
    const user = JSON.parse(userData);
    const userId = user.id;

    // get current club status
    const clubMembersDoc = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', id, userId);

    let wasOwner = false;

    // check if user is owner
    const clubMembersSnapshot = await getDoc(clubMembersDoc);
    if (clubMembersSnapshot.exists()) {
      const clubMember = clubMembersSnapshot.data();
      if (clubMember.privilege === 'owner') {
        wasOwner = true;
      }
    }

    // then remove user from club
    await deleteDoc(clubMembersDoc);

    // remove club from user data
    const userClubsDocRef = doc(firestore, 'schools', schoolKey, 'userData', userId);
    const userClubsSnapshot = await getDoc(userClubsDocRef);
    const userClubs = userClubsSnapshot.data().clubs;
    const updatedUserClubs = userClubs.filter(club => club !== id);

    await updateDoc(userClubsDocRef, {
      clubs: updatedUserClubs,
    });

    // update async storage
    // create object of user data with updated clubs
    user.clubs = updatedUserClubs;
    await AsyncStorage.setItem('user', JSON.stringify(user));

    // subtract club members
    const clubDocRef = doc(firestore, 'schools', schoolKey, 'clubSearchData', 'clubs', id);
    const clubDocSnapshot = await getDoc(clubDocRef);
    let clubMembers = clubDocSnapshot.data().clubMembers;
    clubMembers--;

    await updateDoc(clubDocRef, {
      clubMembers: clubMembers,
    });

    // delete club if no members **not implemented yet**

    // transfer ownership if user was owner
    if (wasOwner) {
      // query for a random admin
      const clubMembersRef = collection(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', id);
      const adminQuery = query(clubMembersRef, where('privilege', '==', 'admin'), limit(1));

      const adminSnapshot = await getDoc(adminQuery);
      if (adminSnapshot.exists()) {
        const adminData = adminSnapshot.data();
        // update new owner
        await updateDoc(doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', id, adminData.id), {
          privilege: 'owner',
        });
      }
    }

    alert('You have left the club');
  } catch (error) {
    console.error('Error leaving club:', error);
  }
};

const getSetSchoolData = async (setter) => {
  const schoolKey = await emailSplit();
  // return school data from macros
  await setter(SCHOOLS[schoolKey]);
}

const checkMembership = async (clubId, setPrivilege, setIsRequestSent) => {
  // get user id from async storage
  const userData = await AsyncStorage.getItem('user');
  const user = JSON.parse(userData);
  const userId = user.id;

  const schoolKey = await emailSplit();

  const clubMemberDocRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, userId);
  const snapshot = await getDoc(clubMemberDocRef);

  // check permissions
  if (snapshot.exists()) {
    const clubMember = snapshot.data();
    if (clubMember.privilege === 'member') {
      setPrivilege('member');
    } else if (clubMember.privilege === 'admin') {
      setPrivilege('admin');
    } else if (clubMember.privilege === 'owner') {
      setPrivilege('owner');
    }
  } else {
    setPrivilege('none');
  }

  // check if user has requested to join **not implemented yet**
};

const fetchMessages = async (querySnapshot, setMessages, setPinnedMessageCount) => {
  const fetchedMessages = querySnapshot.docs.map(doc => ({
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
  }));

  // invert the order of messages
  fetchedMessages.reverse();

  setMessages(fetchedMessages);

  // Calculate and update the count of pinned messages.
  if(setPinnedMessageCount) setPinnedMessageCount(fetchedMessages.filter(message => message.pinned).length);
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

const handlePressMessage = (likes, setLikedProfileImages, setIsLikesModalVisible) => {
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
      const userDocRef = doc(firestore, 'schools', schoolKey, 'userData', userId);
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
  }

  setLikesUserDataById();
  setIsLikesModalVisible(true);
  console.log('Likes:', likes);
};

// Function to delete a message
const deleteMessage = async (messageId, chatType) => {
  await deleteDoc(doc(firestore, chatType, messageId));
  console.log('Message deleted successfully');
};

// Define the function to handle long press
const handleLongPress = async (message, currentUserPrivilege, setReplyingToMessage, messageRef) => {

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
          await updateDoc(messageRef, { pinned: newPinStatus });
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
  // get user id from async storage
  const userData = await AsyncStorage.getItem('user');
  const user = JSON.parse(userData);
  const id = user.id;
  const clubArray = userData.clubs;

  // remove user from all clubs
  clubArray.forEach(club => {
    leaveClubConfirmed(club, id);
  });

  // remove user from database
  const schoolKey = await emailSplit();
  const userDocRef = doc(firestore, 'schools', schoolKey, 'userData', id);
  await deleteDoc(userDocRef);

  // delete user from auth
  const auth = getAuth();
  const authUser = auth.currentUser;
  deleteUser(authUser).then(() => {
  }).catch((error) => {
    Alert.alert('Error deleting user:', error);
  });

  // clear async storage
  await AsyncStorage.clear();
}

export { getSetUserData, getProfileData, updateProfileData, getSetClubData, getSetMyClubsData, getSetEventData, getClubCategoryData, 
  fetchClubs, getSetCalendarData, joinClub, requestToJoinClub, acceptRequest, declineRequest, leaveClubConfirmed, emailSplit, 
  getSetSchoolData, checkMembership, getSetClubCalendarData, fetchMessages, handleCameraPress, handleLongPress, handlePressMessage, 
  handleImageUploadAndSend, deleteAccount, deleteEvent, fetchClubMembers, getSetRequestsData,
};