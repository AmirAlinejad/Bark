import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Profile = ({ route }) => {
  const [userData, setUserData] = useState(null); // State to hold user data
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firebase Auth
          const { displayName, email } = user;

          // Set user data to state
          setUserData({ username: displayName, email });
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      } else {
        // User is signed out
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Detach the listener when unmounting
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View>
          <Text style={styles.title}>User Profile</Text>
          <Text style={styles.text}>Username: {userData?.username}</Text>
          <Text style={styles.text}>Email: {userData?.email}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#ECF0F1',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#ECF0F1',
    marginBottom: 10,
  },
});

export default Profile;
