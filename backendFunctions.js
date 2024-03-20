// backend functions
import { db } from '../backend/FirebaseConfig';
import { ref, get, update, onValue } from "firebase/database"
import { getAuth, onAuthStateChanged } from "firebase/auth";

const getSetUserData = (setter, setLoading) => {
    setLoading(true);
    // get user data from auth
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await updateProfileData(user.uid, setter);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
}

const updateProfileData = async (userId, setter) => {
    try {
      const userRef = ref(db, `users/${userId}`);
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

const getSetAllClubsData = (setter) => {
    const starCountRef = ref(db, 'clubs/');
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

const getClubData = (clubId) => {
    const starCountRef = ref(db, `clubs/${clubId}`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      console.log("data");
      console.log(data);
      return data;
    })
}

const getSetAllEventsData = (setter) => {
  // get event data
  const starCountRef = ref(db, 'events/');
  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    const newEvents = Object.keys(data).map(key => ({
      id:key, 
      ...data[key]
    }));
    console.log(newEvents);
    setter(newEvents);
  })
}

const getSetEventData = (setter, eventId) => {
  const starCountRef = ref(db, `events/${eventId}`);
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

const requestToJoinClub = async (id, name, setIsMember) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('User not authenticated.');
      return;
    }

    const userId = user.uid;
    const userRef = ref(db, `users/${userId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      console.error('User data not found.');
      return;
    }

    const userData = userSnapshot.val();

    // add club to user data
    const updatedUserClubs = {
      ...userData.clubs,
      [name]: {
        clubName: name,
        privilege: 'member',
      }
    };
    
    await set(userRef, {
      ...userData,
      clubs : updatedUserClubs,
    });

    // set club members in club
    const clubRef = ref(db, 'clubs/' + id);
    const clubSnapshot = await get(clubRef);

    if (!clubSnapshot.exists()) {
      console.error('Club data not found.');
      return;
    }

    const clubData = clubSnapshot.val();

    if (clubData.clubMembers && clubData.clubMembers[userId]) {
      alert(`You are already a member of ${name}`);
      return;
    }
    
    const updatedClubMembers = {
      ...clubData.clubMembers,
      [userId]: {
        userName: userData.userName,
        privilege: 'member',
      }
    };

    await set(clubRef, {
      ...clubData,
      clubMembers: updatedClubMembers,
    });
    setIsMember(true);

    alert(`Request sent to join ${name}`);
  } catch (error) {
    console.error('Error processing request:', error);
  }
};

const leaveClubConfirmed = async (id, setIsMember) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user.uid;

    // remove user from club members
    const clubRef = ref(db, `clubs/${id}/clubMembers/${userId}`);

    // check if user is owner
    const clubSnapshot = await get(clubRef);
    const clubData = clubSnapshot.val();
    if (clubData.privilege === 'owner') {
      const wasOwner = true;
    }
    // then remove user from club
    await set(clubRef, null);

    // remove club from user data
    const userRef = ref(db, `users/${userId}/clubs/${id}`);
    await set(userRef, null);

    setIsMember(false);
    setLeaveClubModalVisible(false);

    // delete club if no members
    const clubMembersRef = ref(db, `clubs/${id}/clubMembers`);
    const clubMembersSnapshot = await get(clubMembersRef);

    if (!clubMembersSnapshot.exists()) {
      const clubDeleteRef = ref(db, `clubs/${id}`);
      await set(clubDeleteRef, null);
    }

    // transfer ownership if user was owner
    if (wasOwner) {
      const clubMembersRef = ref(db, `clubs/${id}/clubMembers`);
      const clubMembersSnapshot = await get(clubMembersRef);
      const clubMembers = clubMembersSnapshot.val();
      const newOwner = Object.keys(clubMembers)[0];

      const newOwnerRef = ref(db, `clubs/${id}/clubMembers/${newOwner}`);
      await update(newOwnerRef, {
        privilege: 'owner',
      });
    }

    alert('You have left the club');
  } catch (error) {
    console.error('Error leaving club:', error);
  }
};


export { getSetUserData, updateProfileData, getSetAllClubsData, getClubData, getSetAllEventsData, getSetEventData, requestToJoinClub, leaveClubConfirmed };