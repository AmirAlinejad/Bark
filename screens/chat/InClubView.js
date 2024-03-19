// InClubView.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import { db } from '../../backend/FirebaseConfig';
import { ref, get } from 'firebase/database'; // Import ref and get from Firebase
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const InClubView = ({ navigation, route }) => {
  const [memberCount, setMemberCount] = useState(0);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState('');
  const { clubName, imageUrls, chatName } = route.params;
  console.log('Image URLs:', imageUrls);

  useFocusEffect(
    useCallback(() => {
      const updateState = async () => {
        await fetchMemberCount(clubName);
        await fetchCurrentUserPrivilege();
      };
  
      updateState().then(() => {
        console.log("States refreshed. Current privilege:", currentUserPrivilege);
      });
  
    }, [clubName]) // If clubName is stable, consider adding currentUserPrivilege to the dependency array
  );

  const fetchMemberCount = async (clubName) => {
    try {
      const clubMembersRef = ref(db, `clubs/${clubName}/clubMembers`);
      const snapshot = await get(clubMembersRef);
      if (snapshot.exists()) {
        let memberCount = 0;
        snapshot.forEach(() => {
          memberCount++;
        });
        setMemberCount(memberCount);
      } else {
        // Handle case where no members exist
        setMemberCount(0);
      }
    } catch (error) {
      console.error('Error fetching member count:', error);
    }
  };

  

  const fetchCurrentUserPrivilege = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const userRef = ref(db, `clubs/${clubName}/clubMembers/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userPrivilege = snapshot.val().privilege;
        setCurrentUserPrivilege(userPrivilege);
        console.log("User Privilege:", userPrivilege);
      } else {
        console.log("User data not found.");
      }
    } else {
      console.log("User not authenticated.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header navigation={navigation} text="In Club View" back={true} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <View style={styles.grayImage} />
          <Text style={styles.clubNameText}>{clubName}</Text>
          <Text style={styles.memberCountText}>{`(${memberCount} members)`}</Text>
          {(chatName =="adminchats") && (
            <Text style={styles.memberCountText}>Admin chat view</Text>

          )}
        </View>

        {/* Navigation buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('UserList', {
                clubName: clubName,
                chatName
                // Pass groupChats to UserList screen
              })}
            style={[styles.button, styles.buttonFirst]}>
            <Text style={styles.buttonText}>Search Members</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MessageSearchScreen', {
                clubName,
                chatName
               // Pass groupChats to MessageSearchScreen
              })}
            style={styles.button}>
            <Text style={styles.buttonText}>Search Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PinnedMessagesScreen', {
                clubName,
                chatName,
                // Pass groupChats to PinnedMessagesScreen
              })}
            style={[styles.button, styles.buttonLast]}>
            <Text style={styles.buttonText}>Pinned Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ImageGalleryScreen', {
                clubName,
                imageUrls,
                chatName
              })}
            style={[styles.button, styles.buttonLast]}>
            <Text style={styles.buttonText}>Image Gallery</Text>
          </TouchableOpacity>
          {
          (currentUserPrivilege === 'admin' || currentUserPrivilege === 'owner') && (
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminChat', {clubName})}
              style={[styles.button, styles.buttonLast]}>
              <Text style={styles.buttonText}>Admin Chat</Text>
            </TouchableOpacity>
          )
        }
        </View>
      </View>

      <Text style={styles.footerText}></Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Background color applied here
  },
  headerContainer: {
    width: '100%', // Ensure the header spans across the whole width
  },
  contentContainer: {
    flex: 1, // Fill remaining space
    // Ensure content is spaced evenly
    // Ensure footer doesn't overlap content
  },
  imageContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  
  },
  grayImage: {
    width: 200,
    height: 200,
    backgroundColor: '#ccc', // Gray background color
    borderRadius: 30,
  },
  clubNameText: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 10,
  },
  memberCountText: {
    fontStyle: 'italic',
    marginTop: 5,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
    paddingTop: -100, // Reduce or remove padding at the top
    alignItems: 'left',
  },
  
  button: {
    marginBottom: 5, 
    backgroundColor: '#FAFAFA',
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    alignItems: 'left', 
    width: '90%', 
    borderRadius: 5, 
    alignSelf: 'left', 
  },
  
  buttonFirst: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  buttonLast: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  footerText: {
    backgroundColor: '#FAFAFA', // Same background color as container
    paddingVertical: 10,
    width: '100%', // Ensure full width
    position: 'absolute',
    bottom: 0,
  },
});

export default InClubView;
