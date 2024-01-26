import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../backend/FirebaseConfig'; // Adjust this import based on your file structure

const UserList = ({ route }) => {
  const [clubMembers, setClubMembers] = useState([]);
  const clubName = route?.params?.clubName;
  useEffect(() => {
    const fetchClubMembers = async () => {
      if (!clubName) return;
  
      try {
        const clubRef = ref(db, `clubs/${clubName}/clubMembers`);
        const snapshot = await get(clubRef);
  
        if (snapshot.exists()) {
          const membersData = snapshot.val();
  
          const membersArray = Object.entries(membersData).map(([key, value]) => ({
            id: key,
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
  
  

  const renderMember = ({ item }) => (
    <View style={styles.memberContainer}>
      <Text style={styles.memberName}>{item.userName}</Text>
      <Text style={styles.memberPrivilege}>{item.privilege}</Text>
    </View>
  );

  return (
    <FlatList
      data={clubMembers}
      renderItem={renderMember}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
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
