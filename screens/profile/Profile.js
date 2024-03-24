import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
// my components
import CustomText from '../../components/CustomText';
import ProfileImg from '../../components/display/ProfileImg';
import IconButton from '../../components/buttons/IconButton';
import Header from '../../components/Header';
import IconText from '../../components/display/IconText';
import ProfileOverlay from '../../components/overlays/ProfileOverlay';
// functions
import { getUserData } from '../../functions/getUserData';
// colors
import { Colors } from '../../styles/Colors';
// fonts
import { title, textNormal } from '../../styles/FontStyles';
// linking
import * as Linking from 'expo-linking';

const Profile = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // state for overlay
  const [visible, setVisible] = useState(false);

  // data for settings flatlist
  const settingsData = [
    {
      id: '1',
      icon: 'create-outline',
      text: 'Edit Profile',
      onPress: () => {
        navigation.navigate("EditProfile", {
          userData: userData,
          navigation: navigation,
        }); 
      }
    },
    {
      id: '2',
      icon: 'log-out-outline',
      text: 'Log Out',
      onPress: () => console.log('Log Out'),
    },
    {
      id: '3',
      icon: 'help-circle-outline',
      text: 'Help',
      onPress: () => {
        Linking.openURL('mailto:help.bark.mobile@gmail.com?subject=Help%20with%20Bark!&body=Please%20describe%20your%20issue%20here.');
      },
    },
    {
      id: '4',
      icon: 'phone-portrait-outline',
      text: 'App Settings',
      onPress: () => {
        Linking.openSettings();
      },
    },
    {
      id: '5',
      icon: 'megaphone-outline',
      text: 'Give Feedback',
      onPress: () => {
        navigation.navigate('FeedbackScreen');
      },
    }
  ];

  // render settings button
  const renderSettingsButton = ({ item }) => {
    return (
      <IconButton icon={item.icon} text={item.text} onPress={item.onPress} style={{marginVertical: 10, marginLeft: 20}} />
    );
  }

  useEffect(() => {
    // get user data from auth
    getUserData(setUserData, setLoading);
  }, []);

  // log out (not yet working)
  const handleLogout = async () => {
    /*const auth = getAuth();*/
    try {
      await signOut(auth); // make signOut function
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // navigate to edit profile screen
  const goToEditProfile = () => {
    console.log(userData);
    navigation.navigate("EditProfile", {
      userData: userData,
      navigation: navigation,
    });
  }

  // convert clubs to array of club names
  const myClubsNames = userData?.clubs ? Object.keys(userData.clubs).map((id) => userData.clubs[id].clubName) : [];

  const newLocal = '';
  return (
    <View style={styles.container}>
      <Header text='Your Profile' />
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => goToEditProfile()}>
          <ProfileImg profileImg={userData?.profileImg} width={120} />
        </TouchableOpacity>
        <CustomText style={styles.name} text={userData?.firstName + " " + userData?.lastName} font='bold'/>
        <CustomText style={styles.userName} text={'@'+userData?.userName} font='bold'/>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          <CustomText text={'🎓' + userData?.graduationYear} style={{color: Colors.darkGray, fontSize: 16}} font='bold'/>
          <View style={{width: 10}}/>
          <CustomText text={userData?.major} style={{color: Colors.darkGray, fontSize: 16}} font='bold'/>
        </View>
      </View>
    
      <View style={styles.setttingsContent}>
        <IconText icon="settings-outline" iconColor={Colors.lightGray} text="Settings" onPress={() => console.log("Settings")} />
        <FlatList
          scrollEnabled={false}
          data={settingsData}
          renderItem={renderSettingsButton}
          keyExtractor={item => item.id}
          style={styles.buttonContainerView}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      <ProfileOverlay visible={visible} setVisible={setVisible} userData={userData} />

      <IconButton icon="" text="show profile overlay" onPress={() => setVisible(true)} style={{position: 'absolute', bottom: 20, alignSelf: 'center'}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 40,
    flex: 4,
  },
  setttingsContent: {
    flex: 4,
    paddingTop: 20,
    paddingLeft: 20,
    backgroundColor: Colors.white,
    
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'flex-start',
  },
  buttonContainerView: {
    flex: 1,
    marginTop: 10,
    marginLeft: -20,
  },
  separator: { 
    borderBottomColor: Colors.lightGray, 
    borderBottomWidth: 0, 
    width: '120%',
    marginLeft: -20,
  },
  title: {
    ...title,
    fontSize: 25,
  },
  name: {
    ...title,
    marginTop: 10,
    fontSize: 30,
  },
  userName: {
    color: Colors.darkGray,
    marginTop: -10,
    fontSize: 20,
    marginBottom: 30,
  }
});

export default Profile;