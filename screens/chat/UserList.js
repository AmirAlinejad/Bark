import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
// storage
import AsyncStorage from '@react-native-async-storage/async-storage';
// my components
import Header from '../../components/display/Header';
import SearchBar from '../../components/input/SearchBar';
import ProfileImg from '../../components/display/ProfileImg';
import CustomText from '../../components/display/CustomText';
import ToggleButton from '../../components/buttons/ToggleButton';
import ProfileOverlay from '../../components/overlays/ProfileOverlay';
// Firebase
import { ref, get, remove, update, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, firestore } from '../../backend/FirebaseConfig';
// icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure react-native-vector-icons is installed
// functions
import { emailSplit, checkMembership, fetchClubMembers } from '../../functions/backendFunctions';
// styles
import { Colors } from '../../styles/Colors';

const UserList = ({ route, navigation }) => {
  const { clubId } = route.params;
  // states
  const [clubMembers, setClubMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrivilege, setSelectedPrivilege] = useState('all');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  // overlay
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayUserData, setOverlayUserData] = useState({});
  // loading
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {

    fetchClubMembers(clubId, setClubMembers);

    const asyncFunc = async () => {
      // get current user id from async storage
      const user = await AsyncStorage.getItem('user');

      setCurrentUserId(user.uid);
      checkMembership(clubId, setCurrentUserPrivilege);
      setLoading(false);
    } 

    asyncFunc();
    
  }, []);

  const filterMembers = (member) => {
    
    // filter members by privilege
    if (selectedPrivilege !== 'all' && member.privilege !== selectedPrivilege) {
      return false;
    }
  
    const fullName = `${member.firstName} ${member.lastName}`;
    // filter members by search query
    if (!member.userName.toLowerCase().includes(searchQuery.toLowerCase()) 
    && !member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) 
    && !member.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    && !fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // true otherwise
    return true;
  };

  // update filtered members when club members change
  useEffect(() => {
    setFilteredMembers(clubMembers.filter(filterMembers));
  }, [clubMembers, searchQuery, selectedPrivilege]);

  // sets buttons for editing members
  const actionButtonPressed = (member) => {
    const buttons = [];
    // Ensure actions cannot be performed on the owner or the current user
    if (member.privilege !== 'owner' && member.id !== currentUserId) {
      if (currentUserPrivilege === 'owner' || currentUserPrivilege === 'admin') {
        buttons.push({ text: "Promote", onPress: () => promoteMember(member.id, member.privilege) });
      }
      if (currentUserPrivilege === 'owner' && member.privilege === 'admin') {
        buttons.push({ text: "Demote", onPress: () => demoteMember(member.id, member.privilege) });
      }
      if (currentUserPrivilege === 'owner' || (currentUserPrivilege === 'admin' && member.privilege !== 'owner')) {
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

      const schoolKey = await emailSplit();

      // Update the member's privilege in the clubMemberData collection
      const memberDocRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, memberId);
      await updateDoc(memberDocRef, { privilege: newPrivilege });
        
      // If promoting to owner, demote the current owner to admin
      if (newPrivilege === 'owner') {
        const currentMemberDocRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, currentUserId);
        await updateDoc(currentMemberDocRef, { privilege: 'admin' });
        setCurrentUserPrivilege('admin');
        Alert.alert("Ownership Transferred", `You are now an admin. ${member.userName} is the new owner.`);
      } else {
        Alert.alert("Promotion Success", `Member has been promoted to ${newPrivilege}.`);
      }

      fetchClubMembers(clubId, setClubMembers);
    } else {
      Alert.alert("Error", "This member is already an owner.");
    }
  };
  
  const demoteMember = async (memberId, memberPrivilege) => {

    let newPrivilege = memberPrivilege === 'admin' ? 'member' : 'admin'; // Simplify for this context

    const schoolKey = await emailSplit();
    const memberDocRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, memberId);
    await updateDoc(memberDocRef, { privilege: newPrivilege });

    fetchClubMembers(clubId, setClubMembers);
    Alert.alert("Demotion Success", `Member has been demoted to ${newPrivilege}.`);
  };

  const removeMemberConfirmed = async (memberId) => {
    // Assuming memberId is the ID of the member being removed.
    const schoolKey = await emailSplit();
    const memberDocRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, memberId);
    await deleteDoc(memberDocRef);
    
    fetchClubMembers(clubId, setClubMembers);
    Alert.alert("Removal Success", "Member has been successfully removed from the club.");
  };

  const renderMember = ({ item }) => {
    console.log(item);
    return (
      <View style={styles.memberContainer}>
      
        <View style={styles.memberInfo}>
          <TouchableOpacity onPress={() => {
            setOverlayVisible(true);
            setOverlayUserData(item);
          }} style={styles.avatarContainer}>
            <ProfileImg profileImg={item.profileImg} width={50} />
          </TouchableOpacity>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '75%'}}>
            <View style={{ flex: 1}}>
              <CustomText style={styles.memberName} text={`${item.firstName} ${item.lastName}`} font="bold"/>
              <CustomText style={styles.memberPrivilege} text={`@${item.userName}`} />
            </View>

            <CustomText style={[styles.memberPrivilege, {marginTop: 12}]} text={item.privilege}/>
          </View>
        </View>

        {item.id !== currentUserId &&
        <TouchableOpacity onPress={() => actionButtonPressed(item)} style={{marginRight: 5}}>
          <Icon name="dots-vertical" size={24} color="black" />
        </TouchableOpacity>}

      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="User List" back={true} />

      <View style={styles.searchBarView}>
        <SearchBar value={searchQuery} setValue={setSearchQuery} placeholder="Search members" />
      </View>

      <View style={styles.upperContent}>
        <View style={styles.filterContainer}>
          {['all', 'member', 'admin', 'owner'].map((privilege) => (
            <ToggleButton
              key={privilege}
              text={privilege.charAt(0).toUpperCase() + privilege.slice(1)}
              toggled={selectedPrivilege === privilege}
              onPress={() => setSelectedPrivilege(privilege)}
              toggledCol={Colors.red}
              untoggledCol={Colors.gray}
            />
          ))}
        </View>
      </View>

      <View style={styles.separator} />

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        style={{paddingHorizontal: 0, backgroundColor: Colors.white}}
      />

      {/* Overlay */}
      <ProfileOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        userData={overlayUserData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  searchBarView: {
    margin: 15,
    marginTop: 5,
    marginBottom: 15,
  },
  upperContent: {
    justifyContent: 'flex-start',
    backgroundColor: Colors.white,
    paddingTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingBottom: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  filterText: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    width: '95%',
    marginRight: 20,
    backgroundColor: Colors.lightGray,
  },
  memberContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  memberInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  memberPrivilege: {
    fontSize: 16,
    color: Colors.darkGray,
    marginRight: -5,
    textTransform: 'capitalize',
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
