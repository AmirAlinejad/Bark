import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Button } from 'react-native';
import { Avatar, IconButton, Chip } from 'react-native-paper';
import { getAuth } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
import Header from '../../components/Header';
import UpcomingEvents from '../../components/event/UpcomingEvents';
import CustomText from '../../components/CustomText';
import CircleButton from '../../components/CircleButton';
import Modal from 'react-native-modal';

const ClubScreen = ({ route, navigation }) => {
  const { name, description, categories, img } = route.params;
  const [isMember, setIsMember] = useState(false);
  const [isLeaveClubModalVisible, setLeaveClubModalVisible] = useState(false);

  const filterByThisClub = (event) => {
    return event.clubName === name;
  }

  const onAddEventPress = () => {
    navigation.navigate("NewEvent", {
      clubName: name,
    });
  }

  const onChatButtonPress = () => {
    navigation.navigate('Chat', {
      clubName: name,
    });
  };

  const onButtonPressRequest = async () => {
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
  
      const clubRef = ref(db, 'clubs/' + name);
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

  const checkMembership = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      const clubRef = ref(db, `clubs/${name}/clubMembers`);

      const snapshot = await get(clubRef);
      if (snapshot.exists()) {
        const clubMembers = snapshot.val();
        setIsMember(!!clubMembers[userId]);
      }
    }
  };

  useEffect(() => {
    checkMembership();
  }, [name]);

  const leaveClub = () => {
    setLeaveClubModalVisible(true);
  };

  const leaveClubConfirmed = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const userId = user.uid;

      const clubRef = ref(db, `clubs/${name}/clubMembers/${userId}`);
      await set(clubRef, null);

      setIsMember(false);
      setLeaveClubModalVisible(false);
    } catch (error) {
      console.error('Error leaving club:', error);
    }
  };

  const hideLeaveClubModal = () => {
    setLeaveClubModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header text={name} back navigation={navigation}></Header>
      <ScrollView>
        <View style={styles.clubContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Image source={{ uri: img }} size={150}></Avatar.Image>
          </View>
          <View style={styles.basicInfo}>
            <View style={styles.categoriesContent}>
              {categories.length !== 0 &&
                categories.map((item) => {
                  return <Chip style={{ margin: 5 }}>{item}</Chip>;
                })}
            </View>
            {!isMember && (
              <TouchableOpacity
                style={styles.requestButton}
                onPress={onButtonPressRequest}
              >
                <Text style={styles.requestButtonText}>Join</Text>
              </TouchableOpacity>
            )}
            <CustomText
              style={[styles.textNormal, { textAlign: 'center' }]}
              name={description}
            />
          </View>
          <UpcomingEvents filter={filterByThisClub} navigation={navigation} />
        </View>
      </ScrollView>

      {isMember && (
        <View style={styles.addEventButton}>
          <IconButton
            onPress={onAddEventPress}
            icon="plus-circle"
            size={30}
          />
        </View>
      )}

      {isMember && (
        <CircleButton
          icon="comments"
          onPress={onChatButtonPress}
          position={{ position: 'absolute', bottom: 25, left: 40 }}
        />
      )}

      {isMember && (
        <TouchableOpacity
          style={styles.leaveClubButton}
          onPress={leaveClub}
        >
          <Text style={styles.leaveClubButtonText}>Leave Club</Text>
        </TouchableOpacity>
      )}

      <Modal isVisible={isLeaveClubModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>
            Are you sure you want to leave this club?
          </Text>
          <View style={styles.modalButtons}>
            <Button title="Yes" onPress={leaveClubConfirmed} />
            <Button title="No" onPress={hideLeaveClubModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  clubContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicInfo: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContent: {
    marginBottom: 20,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  avatarContainer: {
    marginTop: 50,
  },
  eventsContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  addEventButton: {
    bottom: 0,
    right: 0,
    padding: 20,
    position: 'absolute',
  },
  rightButton: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    bottom: 20,
    backgroundColor: '#F5F5DC',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  requestButton: {
    backgroundColor: '#FF5028',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  requestButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  leaveClubButton: {
    position: 'absolute',
    top: 50, // Adjust the top position as needed
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

export default ClubScreen;


