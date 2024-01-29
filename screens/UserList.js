import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, Button, TouchableOpacity, TextInput } from 'react-native';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome'; // Assuming you use it for the back button
import { ref, get, remove } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../backend/FirebaseConfig';

const UserList = ({ route, navigation }) => {
  const [clubMembers, setClubMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const clubName = route?.params?.clubName;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (clubName) {
      fetchClubMembers();
    }
  }, [clubName]);

  useEffect(() => {
    filterMembers(searchQuery);
  }, [clubMembers, searchQuery]);

  const fetchClubMembers = async () => {
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

  const filterMembers = (query) => {
    if (!query.trim()) {
      setFilteredMembers(clubMembers);
      return;
    }
    const filtered = clubMembers.filter(member => 
      member.userName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMembers(filtered);
  };

  const leaveClub = async () => {
    try {
      await remove(ref(db, `clubs/${clubName}/clubMembers/${currentUserId}`));
      navigation.navigate("HomeScreen"); // Navigate back after leaving the club
    } catch (error) {
      console.error('Error leaving club:', error);
    }
  };

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
      
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a user..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TouchableOpacity style={styles.leaveClubButton} onPress={leaveClub}>
        <Text style={styles.leaveClubButtonText}>Leave Club</Text>
      </TouchableOpacity>
      <FlatList
        data={filteredMembers}
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
  backButton: {
    position: 'absolute',
    top: 50, // Adjust according to your header's actual layout
    left: 20,
    zIndex: 10, // Ensure button is clickable over the header
  },
  leaveClubButton: {
    position: 'absolute',
    top: 50, // Adjust according to your header's actual layout
    right: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    zIndex: 10, // Ensure button is clickable over the header
  },
  leaveClubButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchBar: {
    fontSize: 18,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 20,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default UserList;
