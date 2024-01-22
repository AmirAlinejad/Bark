import React, { useState, useEffect } from 'react';
// react native components
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
// icons
import Icon from 'react-native-vector-icons/FontAwesome';
// my components
import CircleButton from '../../components/CircleButton';
import CustomText from '../../components/CustomText';

const Profile = ({ navigation }) => {
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      <View style={[styles.orangeSection, { height: screenHeight * 0.25 }]} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={20} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton}>
        <CustomText style={styles.logoutText} text="Log Out" />
      </TouchableOpacity>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.profileImage}
          />
        </View>
        <CustomText style={styles.usernameText} text="Username" />
        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Icon name="cog" size={20} color="black" style={styles.icon} />
          <CustomText style={styles.buttonText} text="Settings" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Icon name="pencil" size={20} color="black" style={styles.icon} />
          <CustomText style={styles.buttonText} text="Edit Profile" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Icon name="users" size={20} color="black" style={styles.icon} />
          <CustomText style={styles.buttonText} text="Friends" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Icon name="address-book" size={20} color="black" style={styles.icon} />
          <CustomText style={styles.buttonText} text="Manage Clubs" />
        </TouchableOpacity>
      </View>
      <CircleButton
        icon="comments"
        //onPress={handleButtonPress}
        position={{ position: 'absolute', bottom: -275, left: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  orangeSection: {
    backgroundColor: 'white',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  logoutText: {
    color: 'black',
    fontWeight: 'bold',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -120,
    zIndex: 1,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: 'white',
    backgroundColor: 'white',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loadingText: {
    fontSize: 18,
    alignSelf: 'center',
    marginTop: 20,
  },
  userDataContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    paddingHorizontal: 0,
    marginTop: 2,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'left',
    paddingLeft: 30,
  },
  icon: {
    position: 'absolute',
    left: 10,
    top: 8,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
  },
  usernameText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
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
});

export default Profile;


