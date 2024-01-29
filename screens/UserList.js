import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, Button, TouchableOpacity, TextInput } from 'react-native';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome'; // Assuming you use it for the back button
import { ref, get, remove } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../backend/FirebaseConfig';
import Modal from 'react-native-modal'; // Import the Modal component

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
  
  const leaveClub = () => {
    showConfirmation("Are you sure you want to leave the club? You will have to request again to join.", null);
  };

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

  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);

  const showConfirmation = (message, memberId) => {
    setConfirmationMessage(message);
    setMemberToRemove(memberId);
    setConfirmationVisible(true);
  };

  const hideConfirmation = () => {
    setConfirmationMessage('');
    setMemberToRemove(null);
    setConfirmationVisible(false);
  };

  const removeMemberConfirmed = async () => {
    if (memberToRemove) {
      try {
        await remove(ref(db, `clubs/${clubName}/clubMembers/${memberToRemove}`));
        setClubMembers(clubMembers.filter(member => member.id !== memberToRemove));
        hideConfirmation();
      } catch (error) {
        console.error('Error removing club member:', error);
      }
    }
  };

  const leaveClubConfirmed = async () => {
    try {
      await remove(ref(db, `clubs/${clubName}/clubMembers/${currentUserId}`));
      navigation.navigate("HomeScreen"); // Navigate back after leaving the club
      hideConfirmation();
    } catch (error) {
      console.error('Error leaving club:', error);
    }
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity style={styles.memberContainer}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.userName}</Text>
        <Text style={styles.memberPrivilege}>{item.privilege}</Text>
      </View>
      {item.privilege === 'member' && item.id !== currentUserId && (
        <Button
          title="Remove"
          color="red"
          onPress={() => showConfirmation("Are you sure you want to remove this user from the club?", item.id)}
        />
      )}
    </TouchableOpacity>
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

      <Modal isVisible={isConfirmationVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>{confirmationMessage}</Text>
          <View style={styles.modalButtons}>
            <Button title="Yes" onPress={confirmationMessage.includes("remove") ? removeMemberConfirmed : leaveClubConfirmed} />
            <Button title="No" onPress={hideConfirmation} />
          </View>
        </View>
      </Modal>
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
  memberInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  memberPrivilege: {
    fontSize: 14,
    color: 'grey',
  },
  leaveClubButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    zIndex: 10,
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
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default UserList;
