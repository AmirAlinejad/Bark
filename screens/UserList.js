import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, Button } from 'react-native';
import Header from '../components/Header';
import { ref, get, remove } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../backend/FirebaseConfig';

const UserList = ({ route, navigation }) => {
  const [clubMembers, setClubMembers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const clubName = route?.params?.clubName;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Set the current user's UID
        setCurrentUserId(user.uid);
      } else {
        // User is not signed in or has been signed out.
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchClubMembers = async () => {
      if (!clubName) return;

      try {
        const clubRef = ref(db, `clubs/${clubName}/clubMembers`);
        const snapshot = await get(clubRef);

        if (snapshot.exists()) {
          const membersData = snapshot.val();

          const membersArray = Object.entries(membersData).map(([key, value]) => ({
            id: key, // Assuming this is the UID of each member
            userName: value.userName,
            privilege: value.privilege,
          }));

          setClubMembers(membersArray);
        } else {
          console.log(`No members found for club ${clubName}`);
        }
      } catch (error) {
        console.error('Error fetching club members:', error);
      }
    };

    fetchClubMembers();
  }, [clubName]);

  const removeMember = async (memberId) => {
    try {
      await remove(ref(db, `clubs/${clubName}/clubMembers/${memberId}`));
      setClubMembers(clubMembers.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Error removing club member:', error);
    }
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberContainer}>
      <Text style={styles.memberName}>{item.userName}</Text>
      <Text style={styles.memberPrivilege}>{item.privilege}</Text>
      {item.privilege === 'member' && item.id !== currentUserId && (
        <Button
          title="Remove"
          color="red"
          onPress={() => removeMember(item.id)}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="User List" back={true} />

      <FlatList
        data={clubMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  memberPrivilege: {
    fontSize: 14,
    color: 'grey',
  },
});

export default UserList;

