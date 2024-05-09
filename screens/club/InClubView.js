import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
// modal
import Modal from 'react-native-modal';
// my components
import Header from '../../components/display/Header';
import IconButton from '../../components/buttons/IconButton';
import CustomText from '../../components/display/CustomText';
import CustomButton from '../../components/buttons/CustomButton';
// navigation
import { useFocusEffect } from '@react-navigation/native';
// styles
import { Colors } from '../../styles/Colors';
// functions
import { getSetClubData, checkMembership, leaveClubConfirmed } from '../../functions/backendFunctions';

const InClubView = ({ navigation, route }) => {
  const { clubId } = route.params;
  const [clubData, setClubData] = useState(null);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState('');
  const [isLeaveClubModalVisible, setLeaveClubModalVisible] = useState(false);

  // refresh states when you come back to this screen
  useFocusEffect(
    useCallback(() => {
      const updateState = async () => {
        await checkMembership(clubId, setCurrentUserPrivilege);
        
        // get club data
        getSetClubData(clubId, setClubData);
      };
  
      updateState();
    }, [clubId])
  );

  // go to edit club screen
  const onEditButtonPress = () => {
    navigation.navigate('EditClub', {
      name: clubData.clubName,
      id: clubData.clubId,
      img: clubData.clubImg,
      publicClub: clubData.publicClub,
      description: clubData.clubDescription,
      
      navigation: navigation, // take out?
    });
  };

  // go to requests screen
  const onRequestsButtonPress = () => {
    navigation.navigate('Requests', {
      clubId: clubData.clubId,
      clubName: clubData.clubName,
    });
  };

  // toggle leave club modal
  const toggleLeaveClubModal = () => {
    setLeaveClubModalVisible(!isLeaveClubModalVisible);
  };

  // get number of requests
  const getNumRequests = () => {
    if (clubData.requests) {
      return Object.keys(clubData.requests).length;
    } else {
      return 0;
    }
  };

  const leaveClub = () => {
    leaveClubConfirmed(clubId);
    toggleLeaveClubModal();
    navigation.navigate('HomeScreen');
  }

  return (
    <View style={styles.container}>
      {clubData === null ? null : (
      <View style={styles.container}>
        <Header navigation={navigation} text="Manage Club" back/>

        <ScrollView>
          <View style={styles.content}>

            <View style={styles.clubButtons}>
              
              <View style={styles.clubSettings}>
                <IconButton
                  text="Edit Club"
                  icon="create-outline"
                  onPress={onEditButtonPress}
                />
                {getNumRequests() > 0 && (
                  <View>
                    <View style={styles.separator} />
                    <IconButton
                      text={`Requests (${getNumRequests()})`}
                      icon="person-add-outline"
                      onPress={onRequestsButtonPress}
                    />
                  </View>
                )}
                <View style={styles.separator} />
                <IconButton icon={'log-out-outline'} text="Leave Club" onPress={toggleLeaveClubModal} color={Colors.red} />
              </View>

              <View style={{position: "absolute", bottom: -600, left: 0, right: 0, backgroundColor: Colors.white, height: 600}}/>
            </View>

          </View>
        </ScrollView>
      </View>
      )}

      {/* leave club modal */}
      <Modal isVisible={isLeaveClubModalVisible}>

        <View style={styles.modalContainer}>
          <CustomText style={styles.modalText} text="Are you sure you want to leave this club?" />
          <View style={styles.modalButtons}>
            <CustomButton text="Yes" onPress={leaveClub} color={Colors.red}/>
            <CustomButton text="No" onPress={toggleLeaveClubModal} color={Colors.green} />
          </View>
        </View>

      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    backgroundColor: Colors.white,
    flex: 1,
  },
  clubContent: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubMembers: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  clubButtons: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.white,
    width: '100%',
    marginTop: 0,
    paddingTop: 20,
    gap: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
  },
  separator: {
    backgroundColor: Colors.lightGray,
    height: 1,
    marginVertical: 10,
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

export default InClubView;
