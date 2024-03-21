import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import Header from '../../components/Header';
import { ref, get, remove, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../backend/FirebaseConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure react-native-vector-icons is installed
import { Colors } from '../../styles/Colors';
import { MaterialIcons } from '@expo/vector-icons';

const UserList = ({ route, navigation }) => {
  const [clubMembers, setClubMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrivilege, setSelectedPrivilege] = useState('all');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState('');
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
      filterMembers(searchQuery);
    } else {
      Alert.alert("No members found for club", clubName);
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

  const actionButtonPressed = (member) => {
    const buttons = [];
    // Ensure actions cannot be performed on the owner
    if (member.privilege !== 'owner') {
      if (currentUserId !== member.id && (currentUserPrivilege === 'owner' || (currentUserPrivilege === 'admin' && member.privilege === 'member'))) {
        buttons.push({ text: "Promote", onPress: () => promoteMember(member.id, member.privilege) });
      }
      if (currentUserId !== member.id && currentUserPrivilege === 'owner' && member.privilege === 'admin') {
        buttons.push({ text: "Demote", onPress: () => demoteMember(member.id, member.privilege) });
      }
      if (currentUserId !== member.id && (currentUserPrivilege === 'owner' || (currentUserPrivilege === 'admin' && member.privilege !== 'owner'))) {
        buttons.push({ text: "Remove", onPress: () => removeMemberConfirmed(member.id), style: 'destructive' });
      }
    }
  
    // Always allow cancel
    buttons.push({ text: "Cancel", style: 'cancel' });
  
    // Only show alert if there are actions available (more than just the Cancel button)
    if (buttons.length > 1) {
      Alert.alert("Manage Member", member.userName, buttons, { cancelable: true });
    }
  };
  

  const promoteMember = async (memberId, memberPrivilege) => {
    // Assuming memberId is the ID of the member being promoted.
    if (memberPrivilege !== 'owner') {
      let newPrivilege = memberPrivilege === 'member' ? 'admin' : 'owner';
      const memberRef = ref(db, `clubs/${clubName}/clubMembers/${memberId}`);
      const snapshot = await get(memberRef);
      
      if (snapshot.exists()) {
        const member = snapshot.val();
        // Promote the member
        await update(memberRef, { privilege: newPrivilege });
        
        // If promoting to owner, demote the current owner to admin
        if (newPrivilege === 'owner') {
          await update(ref(db, `clubs/${clubName}/clubMembers/${currentUserId}`), { privilege: 'admin' });
          setCurrentUserPrivilege('admin');
          Alert.alert("Ownership Transferred", `You are now an admin. ${member.userName} is the new owner.`);
        } else {
          Alert.alert("Promotion Success", `Member has been promoted to ${newPrivilege}.`);
        }
      } else {
        Alert.alert("Error", "Member not found.");
      }
      fetchClubMembers();
    } else {
      Alert.alert("Error", "This member is already an owner.");
    }
  };
  
  

  const demoteMember = async (memberId, memberPrivilege) => {
    let newPrivilege = memberPrivilege === 'admin' ? 'member' : 'admin'; // Simplify for this context
    await update(ref(db, `clubs/${clubName}/clubMembers/${memberId}`), { privilege: newPrivilege });
    fetchClubMembers();
    Alert.alert("Demotion Success", `Member has been demoted to ${newPrivilege}.`);
  };

  const removeMemberConfirmed = async (memberId) => {
    await remove(ref(db, `clubs/${clubName}/clubMembers/${memberId}`));
    fetchClubMembers();
    Alert.alert("Removal Success", "Member has been successfully removed from the club.");
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberContainer}>
      <View style={styles.memberInfo}>
        <View style={styles.avatarContainer}>
          {/* Use the local asset for the avatar */}
          <Image 
            source={require('../../assets/logo.png')} // Reference the local image here
            style={styles.avatar} 
          />
        </View>
        <View>
          <Text style={styles.memberName}>{item.userName}</Text>
          <Text style={styles.memberPrivilege}>{item.privilege}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => actionButtonPressed(item)}>
        <Icon name="dots-vertical" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
  
  

  return (
    <View style={styles.container}>
  <Header navigation={navigation} text="User List" back={true} />
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color={Colors.gray} />
    
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a user..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
   
   
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
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
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});

export default UserList;
