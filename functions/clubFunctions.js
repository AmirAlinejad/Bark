import * as SecureStore from "expo-secure-store";
import {
  getDocs,
  setDoc,
  collection,
  query,
  where,
  limit,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { FIREBASE_AUTH, firestore } from "../backend/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { getProfileData, getUserData } from "./profileFunctions";
import { sendPushNotification } from "./chatFunctions";
import { emailSplit } from "./backendFunctions";

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

const getClubCategoryData = async (category, searchText) => {
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
  const clubsQuery = query(
    clubsDocRef,
    limit(10),
    where("clubName", ">=", searchText ? searchText : ""),
    orderBy("clubMembers", "desc")
  );
  const clubsSnapshot = await getDocs(clubsQuery);

  if (clubsSnapshot.empty) return;

  const clubs = clubsSnapshot.docs.map((doc) => doc.data());
  return clubs;
};

const fetchClubs = async (querySnapshot, setter) => {
  const fetchedClubs = querySnapshot.docs.map((doc) => doc.data());
  setter(fetchedClubs);
};

const getSetClubData = async (clubId, setter) => {
  const schoolKey = await emailSplit();
  const clubDocRef = doc(firestore, "schools", schoolKey, "clubData", clubId);
  const clubDocSnapshot = await getDoc(clubDocRef);

  if (!clubDocSnapshot.exists()) {
    console.log("Club not found.");
    Alert.alert("Club not found.");
    navigation.goBack();

    return;
  }

  setter(clubDocSnapshot.data());
};

// get club data based on club id
const getClubData = async (clubId) => {
  const schoolKey = await emailSplit();

  const clubDocRef = doc(firestore, "schools", schoolKey, "clubData", clubId);
  const clubDocSnapshot = await getDoc(clubDocRef);

  if (!clubDocSnapshot.exists()) {
    console.log("Club not found.");
    return;
  }

  return clubDocSnapshot.data();
};

// get set my clubs data
const getSetMyClubsData = async (setter, setMutedClubs, setLoading) => {
  const schoolKey = await emailSplit();

  // get user from async storage
  const userData = await getUserData();

  console.log("User data:", userData);

  // get user clubs from firestore to ensure data is up to date
  const userDocRef = doc(
    firestore,
    "schools",
    schoolKey,
    "userData",
    userData.id
  );
  const userDocSnapshot = await getDoc(userDocRef);

  if (!userDocSnapshot.exists()) {
    console.log("User not found.");
    setLoading(false);
    return;
  }

  // get user data
  const userFirestoreData = userDocSnapshot.data();

  const clubs = userFirestoreData.clubs;

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

      if (clubDocSnapshot != undefined && clubDocSnapshot.exists()) {
        clubData[i] = clubDocSnapshot.data();

        // get club member data
        const clubMemberRef = doc(
          firestore,
          "schools",
          schoolKey,
          "clubMemberData",
          "clubs",
          clubId,
          userData.id
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

        if (clubData[i].mostRecentMessage) {
          const messageData = clubData[i].mostRecentMessage;

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
            clubData[i].lastMessageTime = messageData.createdAt.toDate();
          }
        } else {
          clubData[i].lastMessage = "No messages yet";
          clubData[i].lastMessageTime = "";
        }
      } else {
        console.log("Club not found.");
      }
    }
  }

  // update async storage
  await AsyncStorage.setItem("myClubs", JSON.stringify(clubData));

  // get clubs ids from clubData
  let clubIds = clubData.map((club) => club.clubId);
  clubIds = clubIds.filter((clubId) => clubId !== undefined);
  userData.clubs = clubIds;

  await SecureStore.setItemAsync("user", JSON.stringify(userData));

  const updatesData = {
    clubs: clubIds,
  };

  // filter clubs created by user
  let clubsCreated = userFirestoreData.clubsCreated;

  if (clubsCreated) {
    clubsCreated = clubsCreated.filter((club) => clubIds.includes(club));
    updatesData.clubsCreated = clubsCreated;
  }

  // update user data in firestore
  await updateDoc(userDocRef, updatesData);

  if (setMutedClubs) {
    setMutedClubs(mutedClubs);
  }
  setter(clubData);

  setLoading(false);
};

const joinClub = async (id, privilege, userId) => {
  const schoolKey = await emailSplit();
  try {
    let userIdToUse;
    if (!userId) {
      // get user id from async storage
      console.log("User id:", FIREBASE_AUTH.currentUser.uid);
      userIdToUse = FIREBASE_AUTH.currentUser.uid;
    } else {
      userIdToUse = userId;
    }

    const userData = await getProfileData(userIdToUse);

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

    // increment club member count in club data
    const clubDocRef = doc(firestore, "schools", schoolKey, "clubData", id);

    const clubDocSnapshot = await getDoc(clubDocRef);
    if (clubDocSnapshot.exists()) {
      const clubData = clubDocSnapshot.data();
      let clubMembers = clubData.clubMembers;
      if (clubMembers == undefined) {
        clubMembers = 0;
      }
      clubMembers++;

      // update club search data
      const clubCategories = clubData.clubCategories;
      clubCategories.forEach(async (category) => {
        await updateDoc(
          doc(
            firestore,
            "schools",
            schoolKey,
            "clubSearchData",
            category,
            "clubs",
            id
          ),
          {
            clubMembers: clubMembers,
          }
        );
      });

      await updateDoc(clubDocRef, {
        clubMembers: clubMembers,
      });
    } else {
      console.log("Club not found.");
    }

    // append clubid to user's clubs
    let updatedUserClubs = userData.clubs;

    if (updatedUserClubs == undefined) {
      updatedUserClubs = [];
    }
    updatedUserClubs = [...updatedUserClubs, id];

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
    };
    if (user.profileImg) {
      clubRequest.profileImg = user.profileImg;
    }
    if (user.expoPushToken) {
      clubRequest.expoPushToken = user.expoPushToken;
    }

    // post request
    await setDoc(clubRequestsDocRef, clubRequest);

    // send notification to club owner and admins
    const clubMembersRef = collection(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      id
    );

    const clubMembersSnapshot = await getDocs(clubMembersRef);

    if (clubMembersSnapshot.empty) {
      console.log("No members found.");
      return;
    }

    clubMembersSnapshot.docs.map(async (doc) => {
      const memberData = doc.data();
      if (
        (memberData.privilege === "owner" ||
          memberData.privilege === "admin") &&
        memberData.expoPushToken
      ) {
        await sendPushNotification(
          memberData.expoPushToken,
          "New Club Request",
          "New member request for " + name,
          "Accept or decline the request in the club settings"
        );
      }
    });
  }
};

const acceptRequest = async (clubId, userId) => {
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

  Alert.alert("Request Accepted", `You have accepted a new member!`);
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
    "clubs",
    clubId
  );
  const clubRequestsSnapshot = await getDocs(clubRequestsDocRef);

  if (clubRequestsSnapshot.empty) {
    console.log("No requests found.");
    return;
  }

  // turn collection into object w key as id and value as data
  let requests = [];
  clubRequestsSnapshot.docs.map((doc, index) => {
    requests.push({
      ...doc.data(),
      userId: doc.id,
    });
  });

  setter(requests);
};

const leaveClubConfirmed = async (clubId, user) => {
  try {
    const schoolKey = await emailSplit();

    let userId;
    let userData;
    if (!user) {
      userId = FIREBASE_AUTH.currentUser.uid;
      console.log("User id:", userId);
      userData = await getProfileData(userId);
    } else {
      userId = user;
    }

    let wasOwner = false;
    let onlyMember = false;

    // get user's membership data
    const clubMembersDoc = doc(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      clubId,
      userId
    );
    const memberSnapshot = await getDoc(clubMembersDoc);
    const memberData = memberSnapshot.data();

    if (!memberSnapshot.exists()) {
      alert("Unable to leave club - Member data not found");
      return;
    }

    const membership = memberData.privilege;

    if (membership === "owner") {
      wasOwner = true;
    }

    // check if user is only member
    const clubMembersRef = collection(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      clubId
    );

    const clubMembersSnapshot = await getDocs(clubMembersRef);
    if (clubMembersSnapshot.size === 1) {
      onlyMember = true;
    }

    // then remove user from club
    await deleteDoc(clubMembersDoc);

    // decrement club member count
    const clubDocRef = doc(firestore, "schools", schoolKey, "clubData", clubId);
    const clubDocSnapshot = await getDoc(clubDocRef);

    if (clubDocSnapshot.exists()) {
      const clubData = clubDocSnapshot.data();
      let clubMembers = clubData.clubMembers;
      clubMembers--;

      // update club search data
      const clubCategories = clubData.clubCategories;
      clubCategories.forEach(async (category) => {
        await updateDoc(
          doc(
            firestore,
            "schools",
            schoolKey,
            "clubSearchData",
            category,
            "clubs",
            clubId
          ),
          {
            clubMembers: clubMembers,
          }
        );
      });

      await updateDoc(clubDocRef, {
        clubMembers: clubMembers,
      });
    }

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
      const updatedUserClubs = userClubs.filter((club) => club !== clubId);

      await updateDoc(userClubsDocRef, {
        clubs: updatedUserClubs,
      });

      // update async storage if user is the one leaving the club
      if (!user) {
        // create object of user data with updated clubs
        userData.clubs = updatedUserClubs;
        await SecureStore.setItemAsync("user", JSON.stringify(userData));
      }
    }

    // get club categories for this club
    const clubCategoryRef = doc(
      firestore,
      "schools",
      schoolKey,
      "clubData",
      clubId
    );
    const clubCategorySnapshot = await getDoc(clubCategoryRef);
    const clubCategories = clubCategorySnapshot.data().clubCategories;

    if (onlyMember) {
      await deleteDoc(doc(firestore, "schools", schoolKey, "clubData", clubId));
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
            clubId
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
      // query for an admin
      const clubMembersRef = collection(
        firestore,
        "schools",
        schoolKey,
        "clubMemberData",
        "clubs",
        clubId
      );
      const adminQuery = query(
        clubMembersRef,
        where("privilege", "==", "admin"),
        limit(1)
      );

      const adminSnapshot = await getDoc(adminQuery);

      if (adminSnapshot.empty) {
        alert("No admins found");

        // find a random user to make owner
        const userQuery = query(
          clubMembersRef,
          where("privilege", "==", "member"),
          limit(1)
        );

        adminSnapshot = await getDoc(userQuery);
      }

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
            clubId,
            adminData.id
          ),
          {
            privilege: "owner",
          }
        );
      }
    }

    // terminate functions if user is not the one leaving the club
    if (user) {
      return;
    }

    alert("You have left the club");

    // update clubs created if user is the one leaving the club
    userData.clubsCreated = user.clubsCreated.filter((club) => club !== clubId);
    await SecureStore.setItemAsync("user", JSON.stringify(userData));

    // user data
    const userDocRef = doc(firestore, "schools", schoolKey, "userData", userId);
    await updateDoc(userDocRef, {
      clubsCreated: user.clubsCreated,
    });
  } catch (error) {
    console.error("Error leaving club:", error);
  }
};

const checkMembership = async (
  clubId,
  setPrivilege,
  setIsRequestSent,
  setMembershipChecked
) => {
  // get user id from auth
  const userId = FIREBASE_AUTH.currentUser.uid;

  const schoolKey = await emailSplit();

  // get doc fot user permissions
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

  if (setIsRequestSent) {
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
  }

  if (setMembershipChecked) {
    setMembershipChecked(true);
  }
};

const updateExpoPushTokenForUserClubs = async (userId, expoPushToken) => {
  console.log("Updating expo push token for user clubs");

  const schoolKey = await emailSplit();

  // get user clubs
  const userDocRef = doc(firestore, "schools", schoolKey, "userData", userId);
  const userDocSnapshot = await getDoc(userDocRef);

  if (!userDocSnapshot.exists()) {
    console.log("User not found.");
    return;
  }

  const userClubs = userDocSnapshot.data().clubs;

  // update expo push token for each club
  userClubs.forEach(async (clubId) => {
    const clubMemberRef = doc(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      clubId,
      userId
    );
    await updateDoc(clubMemberRef, {
      expoPushToken: expoPushToken,
    });
  });
};

export {
  fetchClubMembers,
  getClubCategoryData,
  fetchClubs,
  getSetClubData,
  getClubData,
  getSetMyClubsData,
  joinClub,
  requestToJoinClub,
  acceptRequest,
  declineRequest,
  getSetRequestsData,
  leaveClubConfirmed,
  checkMembership,
  updateExpoPushTokenForUserClubs,
};
