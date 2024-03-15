// InClubView.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import { db } from '../../backend/FirebaseConfig';
import { ref, get } from 'firebase/database'; // Import ref and get from Firebase
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const InClubView = ({ navigation, route }) => {
  const [memberCount, setMemberCount] = useState(0);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState('');
  const { clubName, groupChats, imageUris } = route.params;

  useFocusEffect(() => {
    if (route?.params?.clubName) {
      fetchMemberCount(route.params.clubName);
      fetchCurrentUserPrivilege();
    }
  });

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
        </View>

        {/* Navigation buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('UserList', {
                clubName: clubName,
                groupChats: groupChats, // Pass groupChats to UserList screen
              })}
            style={[styles.button, styles.buttonFirst]}>
            <Text style={styles.buttonText}>Search Members</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MessageSearchScreen', {
                clubName,
                groupChats, // Pass groupChats to MessageSearchScreen
              })}
            style={styles.button}>
            <Text style={styles.buttonText}>Search Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PinnedMessagesScreen', {
                clubName,
                groupChats, // Pass groupChats to PinnedMessagesScreen
              })}
            style={[styles.button, styles.buttonLast]}>
            <Text style={styles.buttonText}>Pinned Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ImageGalleryScreen', {
                clubName,
                groupChats,
                imageUris 
              })}
            style={[styles.button, styles.buttonLast]}>
            <Text style={styles.buttonText}>Image Gallery</Text>
          </TouchableOpacity>
          

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('QRCodeScreen', {
                clubName,
                groupChats, // Pass groupChats to QRCodeScreen
              })}
            style={styles.button}>
            <Text style={styles.buttonText}>QR Code</Text>
          </TouchableOpacity>

          

          {currentUserPrivilege === 'admin' || currentUserPrivilege === 'owner' && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AdminChat', {
                  clubName,
                  groupChats, // Pass groupChats to AdminChat
                })}
              style={[styles.button, styles.buttonLast]}>
              <Text style={styles.buttonText}>Admin Chat</Text>
            </TouchableOpacity>
          )}
          {/* Add more buttons for additional screens here */}
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
    justifyContent: 'space-between', // Ensure content is spaced evenly
    // Ensure footer doesn't overlap content
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingTop: 30,
  },
  grayImage: {
    width: 200,
    height: 200,
    backgroundColor: '#ccc', // Gray background color
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
    marginBottom: 300,
    alignItems: 'flex-start',
  },
  button: {
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
    padding: 15,
    alignItems: 'left',
    borderRadius: 0,
  },
  buttonFirst: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  buttonLast: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: "bold",
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
