import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Button } from 'react-native';
import { getAuth } from 'firebase/auth';
// backend
import { ref, get } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
// functions
import { requestToJoinClub, leaveClubConfirmed, getSetAllEventsData } from '../../functions/backendFunctions';
// my components
import Header from '../../components/Header';
import UpcomingEvents from '../../components/event/UpcomingEvents';
import CustomText from '../../components/CustomText';
import ClubImg from '../../components/club/ClubImg';
import IconButton from '../../components/buttons/IconButton';
import IconText from '../../components/display/IconText';
import Chip from '../../components/display/Chip';
// modal
import Modal from 'react-native-modal';
// macros
import { clubCategories } from '../../macros/macros';
// icons
import { Ionicons } from '@expo/vector-icons';
// fonts
import { textNormal } from '../../styles/FontStyles';
// colors
import { Colors } from '../../styles/Colors';
import CircleButton from '../../components/buttons/CircleButton';
import { Icon } from '@rneui/base';

const ClubScreen = ({ route, navigation }) => {
  const { name, img, id, description, categories, members } = route.params;
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLeaveClubModalVisible, setLeaveClubModalVisible] = useState(false);
  // events
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  // join club modal
  const [isJoinClubModalVisible, setJoinClubModalVisible] = useState(false);

  const filterByThisClub = (event) => { // change to where club stores event IDs
    return event.clubId === id;
  }

  const onAddEventPress = () => {
    navigation.navigate("NewEvent", {
      clubName: name,
      clubId: id,
      fromMap: false,
    });
  }

  const onChatButtonPress = () => {
    navigation.navigate('Chat', {
      clubName: name,
    });
  };

  const checkMembership = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      const clubRef = ref(db, `clubs/${id}/clubMembers`);

      const snapshot = await get(clubRef);
      if (snapshot.exists()) {
        const clubMembers = snapshot.val();
        console.log(clubMembers);
        if (clubMembers[userId] !== undefined) {
          setIsMember(true);
        }
        if (clubMembers[userId].privilege === 'admin') {
          setIsAdmin(true);
        }
        if (clubMembers[userId].privilege === 'owner') {
          setIsOwner(true);
          setIsAdmin(true);
        }
      }
    }
  };

  useEffect(() => {
    getSetAllEventsData(setEventData, setLoading);

    checkMembership();
  }, []);

  const toggleLeaveClubModal = () => {
    setLeaveClubModalVisible(!isLeaveClubModalVisible);
  };

  const onEditButtonPress = () => {
    navigation.navigate('EditClub', {
      name: name,
      img: img,
      clubId: id,
      description: description,
      navigation: navigation,
    });
  };

  // go to calendar with this club's events
  const onCalendarButtonPress = () => {
    navigation.navigate('Calendar', {
      calendarSettingProp: "myClubs",
      clubsProp: [name],
    });
  };

  // get member count
  const memberCount = () => {
    if (members) {
      const memberCount = Object.keys(members).length;
      return memberCount;
    } else {
      return 0;
    }
  }
  
  // filter events by club
  const filteredEvents = eventData.filter((event) => filterByThisClub(event));

  return (
    <View style={styles.container}>
      
      <Header text={name} back navigation={navigation}></Header>
      <ScrollView>
        <View style={styles.clubImage}>
          <ClubImg clubImg={img} width={120} />
          <View style={styles.clubContent}>
            <View style={styles.categoriesContent}>
              {categories.length !== 0 &&
                categories.map((item) => {
                  // get corresponding club category
                  const category = clubCategories.find((clubCategory) => clubCategory.value === item);

                  return (
                    <Chip key={item} style={styles.categoriesChip} text={category.emoji + " " + category.value} color={category.lightColor} />
                  );
                })
              }
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Ionicons name="people-outline" size={20} color={Colors.black} />
              <CustomText
                style={[styles.textNormal, { textAlign: 'center', marginBottom: 20 }]}
                text={memberCount()}
              />
            </View>
            <CustomText
              style={[styles.textNormal, { textAlign: 'center', marginBottom: 20 }]}
              text={description}
            />
          </View>

          <View style={styles.clubButtons}>
            <IconText icon="people-outline" iconColor={Colors.lightGray} text="Club Settings" onPress={onChatButtonPress} />
            {!isMember && (
              <IconButton icon={'add-circle-outline'} text="Request to Join" onPress={() => {
                // change modal
                setJoinClubModalVisible(true);
                requestToJoinClub(id, setIsMember)}
              } />
            )}
            {isAdmin && (
              <IconButton icon={'create-outline'} text="Edit Club" onPress={onEditButtonPress} />
            )}
            {isMember && (
              <IconButton icon={'log-out-outline'} text="Leave Club" onPress={toggleLeaveClubModal} />
            )}

            <IconText icon="calendar-outline" iconColor={Colors.lightGray} text="Upcoming Events" />
            <UpcomingEvents filteredEvents={filteredEvents} navigation={navigation} />
            <View style={{position: "absolute", bottom: -600, left: 0, right: 0, backgroundColor: Colors.white, height: 600}}/>
          </View>

        </View>
      </ScrollView>
        
      <CircleButton icon="create-outline" onPress={onAddEventPress} position={{ bottom: 0, right: 0 }} size={80} />

      <CircleButton icon='chatbubbles-outline' onPress={onChatButtonPress} position={{ bottom: 0, left: 0 }} size={80} />

      <Modal isVisible={isLeaveClubModalVisible}>
        <View style={styles.modalContainer}>
          <CustomText style={styles.modalText} text="Are you sure you want to leave this club?" />
          <View style={styles.modalButtons}>
            <Button title="Yes" onPress={() => leaveClubConfirmed(id, setIsMember)} />
            <Button title="No" onPress={toggleLeaveClubModal} />
          </View>
        </View>
      </Modal>

      <Modal isVisible={isJoinClubModalVisible}>
        <View style={styles.modalContainer}>
          <Ionicons name="checkmark-circle-outline" size={90} color={Colors.green} />
          <CustomText style={styles.modalText} text="You have successfully joined the club." />
          <Button title="Ok" onPress={() => setJoinClubModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    backgroundColor: Colors.lightGray,
    flex: 1,
  },
  clubImage: {
    marginTop: 50,
    alignItems: 'center',
  },
  clubContent: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContent: {
    marginBottom: 20,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoriesChip: {
    margin: 5,
    padding: 10,
    borderRadius: 8,
    gap: 10,
    flexDirection: 'row',
  },
  chipText: {
    fontSize: 16,
    color: 'white',
  },
  clubButtons: {
    flex: 1,
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    gap: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  separator: {
    backgroundColor: Colors.lightGray,
    height: 1,
    width: '120%',
    marginLeft: -20,
  },
  calendarButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },

  // bottom buttons
  rightButtonView: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 30,
  },
  addEventButton: {
    backgroundColor: Colors.red,
    padding: 20,
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.25,
  },
  leftButtonView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    margin: 25,
  },
  chatButton: {
    backgroundColor: Colors.red,
    padding: 20,
    borderRadius: 50,
  },

  // modal styles
  modalContainer: {
    backgroundColor: 'white',
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

  // fonts
  textNormal: {
    ...textNormal,
  },
});

export default ClubScreen;