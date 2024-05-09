import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
// my components
import CustomText from '../../components/display/CustomText';
import ProfileImg from '../../components/display/ProfileImg';
import IconButton from '../../components/buttons/IconButton';
import Header from '../../components/display/Header';
import IconText from '../../components/display/IconText';
import CustomButton from '../../components/buttons/CustomButton';
// functions
import { getSetUserData, deleteAccount } from '../../functions/backendFunctions';
// firebase
import { getAuth, signOut } from 'firebase/auth';
// modal
import Modal from 'react-native-modal';
// colors
import { Colors } from '../../styles/Colors';
// linking
import * as Linking from 'expo-linking';

const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  // delete account overlay
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

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
      id: '3',
      icon: 'phone-portrait-outline',
      text: 'App Settings',
      onPress: () => {
        Linking.openSettings();
      },
    },
    {
      id: '4',
      icon: 'log-out-outline',
      text: 'Log Out',
      onPress: () => {
        setLogoutModal(true);
      }
    },
    {
      id: '5',
      icon: 'chatbubble-outline',
      text: 'Contact Us',
      onPress: () => {
        navigation.navigate('Feedback', {
          userData: userData,
          navigation: navigation,
        });
      },
    },
    {
      id: '6',
      icon: 'trash-outline',
      text: 'Delete Account',
      onPress: () => {
        setDeleteAccountModal(true);
      },
      color: Colors.red,
    }
  ];

  // render settings button
  const renderSettingsButton = ({ item }) => {
    return (
      <IconButton 
        icon={item.icon} 
        text={item.text} 
        onPress={() => { // if not loading, then onPress
          if (!loading) {
            item.onPress();
          }
        }} 
        style={styles.settingsButton} 
        color={item.color ? item.color : Colors.black}
      />
    );
  }

  useEffect(() => {

    const asyncFunc = async () => {
      setLoading(true);
      await getSetUserData(setUserData);
      setLoading(false);
    }

    asyncFunc();
  }, []);

  // navigate to edit profile screen
  const goToEditProfile = () => {
    console.log(userData);
    navigation.navigate("EditProfile", {
      userData: userData,
      navigation: navigation,
    });
  }

  // delete account
  const deleteAccountFunc = () => {
    deleteAccount();
    setDeleteAccountModal(false);
    navigation.navigate('SignIn');
  }

  // log out
  const logOut = () => {
     const auth = getAuth();
     signOut(auth).then(() => {
       navigation.navigate('SignIn');
     }).catch((error) => {
       console.error('Error signing out:', error);
     });
  }

  const gradYear = userData?.graduationYear ? userData.graduationYear : 'Add Year';
  const major = userData?.major ? userData.major : '📚Add Major';

  return (
    <View style={styles.container}>
      <Header text='Your Profile' />
        <View style={styles.profileContainer}>

          <TouchableOpacity onPress={goToEditProfile}>
            <ProfileImg profileImg={userData?.profileImg} width={120} />
          </TouchableOpacity>

          <CustomText style={styles.name} text={userData?.firstName + " " + userData?.lastName} font='bold'/>
          <CustomText style={styles.userName} text={'@'+userData?.userName} font='bold'/>

          <View style={styles.detailsView}>
            <TouchableOpacity onPress={goToEditProfile}>
              <CustomText text={'🎓' + gradYear} style={styles.detailsText} font='bold'/>
            </TouchableOpacity>
          <View style={{width: 25}}/>
          <TouchableOpacity onPress={goToEditProfile}>
            <CustomText text={major} style={styles.detailsText} font='bold' />
          </TouchableOpacity>
        </View>
      </View>
  
      <View style={styles.setttingsContent}>
        <IconText icon="settings-outline" iconColor={Colors.lightGray} text="Settings" />
        <FlatList
          data={settingsData}
          renderItem={renderSettingsButton}
          keyExtractor={item => item.id}
          style={styles.buttonContainerView}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEnabled={false}
        />
      </View>

      <Modal isVisible={deleteAccountModal}>

        <View style={styles.modalContainer}>
          <CustomText style={styles.modalText} text="Are you sure you want to delete your account?" />
          <View style={styles.modalButtons}>
            <CustomButton text="Yes" onPress={deleteAccount} color={Colors.red}/>
            <CustomButton text="No" onPress={() => setDeleteAccountModal(false)} color={Colors.green}/>
          </View>
        </View>

      </Modal>

      <Modal isVisible={logoutModal}>

        <View style={styles.modalContainer}>
          <CustomText style={styles.modalText} text="Are you sure you want to log out of your account?" />
          <View style={styles.modalButtons}>
            <CustomButton text="Yes" onPress={logOut} color={Colors.red}/>
            <CustomButton text="No" onPress={() => setLogoutModal(false)} color={Colors.green}/>
          </View>
        </View>

      </Modal>
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
  detailsView: {
    flexDirection: 'row',
    marginTop: 0,
  },
  detailsText: {
    fontSize: 16,
    color: Colors.darkGray,
  },
  setttingsContent: {
    justifyContent: 'flex-start',
    flex: 4,
    paddingTop: 20,
    paddingLeft: 20,
    backgroundColor: Colors.white,
    
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  settingsButton: {
    marginVertical: 10,
  },
  buttonContainerView: {
    flex: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  separator: { 
    backgroundColor: Colors.lightGray,
    height: 1,
    marginRight: 20,
  },
  title: {
    fontSize: 25,
    marginVertical: 0,
  },
  name: {
    marginTop: 10,
    fontSize: 30,
  },
  userName: {
    color: Colors.darkGray,
    marginTop: 0,
    fontSize: 20,
    marginBottom: 30,
  },

   // modal styles
   modalContainer: {
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    margin: 20,
    borderRadius: 20,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 80,
    justifyContent: 'space-between',
  },
});

export default Profile;