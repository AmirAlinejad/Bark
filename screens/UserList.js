import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, Button, TouchableOpacity, TextInput, Alert } from 'react-native';
import Header from '../components/Header';
import { ref, get, remove, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../backend/FirebaseConfig';
import Modal from 'react-native-modal';

const UserList = ({ route, navigation }) => {
  const [clubMembers, setClubMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrivilege, setSelectedPrivilege] = useState('all');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState('');
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [promotionAction, setPromotionAction] = useState(false);
  const clubName = route?.params?.clubName;

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchCurrentUserPrivilege(user.uid);
      } else {
        setCurrentUserId(null);
        setCurrentUserPrivilege('');
      }
    });
  }, []);

  useEffect(() => {
    if (clubName) {
      fetchClubMembers();
    }
  }, [clubName]);

  useEffect(() => {
    filterMembers(searchQuery);
  }, [clubMembers, searchQuery, selectedPrivilege]);

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
        filterMembers(searchQuery); // Ensure filtering happens after fetching
      } else {
        Alert.alert("No members found for club", clubName);
      }
    } catch (error) {
      Alert.alert("Error fetching club members", error.message);
    }
  };

  const fetchCurrentUserPrivilege = async (userId) => {
    const userRef = ref(db, `clubs/${clubName}/clubMembers/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      setCurrentUserPrivilege(snapshot.val().privilege);
    }
  };

  const filterMembers = (query) => {
    const filtered = clubMembers.filter(member =>
      member.userName.toLowerCase().includes(query.toLowerCase()) &&
      (selectedPrivilege === 'all' || member.privilege === selectedPrivilege)
    );
    setFilteredMembers(filtered);
  };

  const showConfirmation = (message, memberId, isPromotion = false) => {
    setConfirmationMessage(message);
    setMemberToRemove(memberId);
    setPromotionAction(isPromotion);
    setConfirmationVisible(true);
  };

  const hideConfirmation = () => {
    setConfirmationMessage('');
    setMemberToRemove(null);
    setPromotionAction(false);
    setConfirmationVisible(false);
  };

  const promoteMember = async (memberId, memberPrivilege) => {
    let newPrivilege = memberPrivilege === 'member' ? 'admin' : 'owner';
    if (currentUserPrivilege === 'owner' && memberPrivilege === 'admin') {
      // If the current user is an owner and the member is an admin, promote the member to owner
      await update(ref(db, `clubs/${clubName}/clubMembers/${memberId}`), { privilege: 'owner' });
      // And demote the current owner to admin
      await update(ref(db, `clubs/${clubName}/clubMembers/${currentUserId}`), { privilege: 'admin' });
      setCurrentUserPrivilege('admin'); // Update the state to reflect the new privilege
    } else {
      await update(ref(db, `clubs/${clubName}/clubMembers/${memberId}`), { privilege: newPrivilege });
    }

    fetchClubMembers(); // Refresh the list to show updated privileges
    Alert.alert("Promotion Success", `Member has been promoted to ${newPrivilege}.`);
  };

  const removeMemberConfirmed = async () => {
    await remove(ref(db, `clubs/${clubName}/clubMembers/${memberToRemove}`));
    fetchClubMembers(); // Refresh the list to remove the member
    Alert.alert("Removal Success", "Member has been successfully removed from the club.");
  };

  const renderMember = ({ item }) => {
    const canPromote = item.id !== currentUserId && (currentUserPrivilege === 'owner' || (currentUserPrivilege === 'admin' && item.privilege === 'member'));
    const canRemove = item.id !== currentUserId && (currentUserPrivilege === 'owner' || (currentUserPrivilege === 'admin' && item.privilege === 'member'));

    return (
      <View style={styles.memberContainer}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.userName}</Text>
          <Text style={styles.memberPrivilege}>{item.privilege}</Text>
        </View>
        <View style={styles.actionButtons}>
          {canPromote && (
            <Button title="Promote" onPress={() => showConfirmation(`Are you sure you want to promote ${item.userName}?`, item.id, true)} />
          )}
          {canRemove && (
            <Button title="Remove" color="red" onPress={() => showConfirmation(`Are you sure you want to remove ${item.userName}?`, item.id)} />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="User List" back={true} />
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a user..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.filterContainer}>
        {['all', 'member', 'admin', 'owner'].map((privilege) => (
          <TouchableOpacity key={privilege} onPress={() => setSelectedPrivilege(privilege)} style={styles.filterButton}>
            <Text style={styles.filterText}>{privilege.charAt(0).toUpperCase() + privilege.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
      />
      <Modal isVisible={isConfirmationVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>{confirmationMessage}</Text>
          <Button title="Yes" onPress={() => promotionAction ? promoteMember(memberToRemove, filteredMembers.find(member => member.id === memberToRemove).privilege) : removeMemberConfirmed()} />
          <Button title="No" onPress={hideConfirmation} />
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
  searchBar: {
    fontSize: 18,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 20,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  filterButton: {
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ddd',
  },
  filterText: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default UserList;
