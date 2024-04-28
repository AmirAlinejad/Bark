import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
// my components
import CustomText from '../display/CustomText';
import ProfileImg from '../display/ProfileImg';
// icons
import { Ionicons } from '@expo/vector-icons';
// database
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
// functions
import { emailSplit } from '../../functions/backendFunctions';
import { P } from '@expo/html-elements';

// Mockup methods for fetching user details (replace with your actual implementation)
const fetchUsernameById = async (userID) => {

  const db = getDatabase();
  const userNameRef = ref(db, `${emailSplit()}/users/${userID}/userName`);
  const snapshot = await get(userNameRef);
  return snapshot.exists() ? snapshot.val() : "Unknown User";
};

const fetchProfilePictureById = async (userID) => {
  
  const db = getDatabase();
  const profilePicRef = ref(db, `${emailSplit()}/users/${userID}/profileImg`);
  const snapshot = await get(profilePicRef);
  return snapshot.exists() ? snapshot.val() : null; // Default or placeholder image URL
};

const LikesBottomModal = ({ isVisible, onClose, userIDs }) => {
  const [userDetails, setUserDetails] = useState([]);

  useEffect(() => {
    if (!isVisible) {
      setUserDetails([]); // Clear userDetails when modal is not visible
      return;
    }

    const fetchUserDetails = async () => {
      const details = await Promise.all(userIDs.map(async (userID) => {
        const userName = await fetchUsernameById(userID);
        const profilePicture = await fetchProfilePictureById(userID);
        return { userID, userName, profilePicture };
      }));
      setUserDetails(details);
    };

    fetchUserDetails();
  }, [isVisible, userIDs]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollViewContent} horizontal>
            {userDetails.map((user, index) => (
              <View key={index} style={styles.userDetails}>
              
                <ProfileImg profileImg={user.profilePicture} width={50} style={styles.profilePic} />
                <View style={styles.heartIcon}>
                  <Ionicons name="heart" size={24} color="red" />
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <CustomText text="Close" font="bold" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%', // Adjust based on your preference
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  userDetails: {
    alignItems: 'center',
    padding: 5,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  placeholderProfilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  userNameText: {
    fontSize: 18,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  heartIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});

export default LikesBottomModal;
