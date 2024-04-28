import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
// fade
import Fade from 'react-native-fade';
// functions
import { requestToJoinClub, getSetAllEventsData, checkMembership, getSetClubData } from '../../functions/backendFunctions';
import { goToChatScreen, goToAdminChatScreen } from '../../functions/navigationFunctions';
// my components
import Header from '../../components/display/Header';
import UpcomingEvents from '../../components/event/UpcomingEvents';
import CustomText from '../../components/display/CustomText';
import ClubImg from '../../components/club/ClubImg';
import IconButton from '../../components/buttons/IconButton';
import IconText from '../../components/display/IconText';
import Chip from '../../components/display/Chip';
import IconOverlay from '../../components/overlays/IconOverlay';
import CircleButton from '../../components/buttons/CircleButton';
import CustomButton from '../../components/buttons/CustomButton';
// macros
import { CLUBCATEGORIES } from '../../macros/macros';
// colors
import { Colors } from '../../styles/Colors';

const ClubScreen = ({ route, navigation }) => {
  //  get club data
  const { club } = route.params; // just use clubId to get club data
  // membership
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState('none');
  // club data
  const [clubData, setClubData] = useState(null);
  // event data
  const [eventData, setEventData] = useState([]);
  // fade text
  const [showText, setShowText] = useState(true);
  // loading
  const [loading, setLoading] = useState(true);
  // modals
  const [isJoinClubModalVisible, setJoinClubModalVisible] = useState(false);
  const [isRequestClubModalVisible, setRequestClubModalVisible] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  useEffect(() => {

    const asyncFunction = async () => {
      setLoading(true);

      await getSetAllEventsData(setEventData);
      await getSetClubData(club.clubId, setClubData);

      setLoading(false);

      checkMembership(club.clubId, setCurrentUserPrivilege, setIsRequestSent);
    };

    asyncFunction();
  }, []);

  // fade out text after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // go to calendar with this club's events
  const onCalendarButtonPress = () => {
    navigation.navigate("ClubCalendar", {
      club: clubData,
    });
  };

  // request to join club
  const onRequestButtonPress = () => {
    if (isRequestSent) {
      Alert.alert('Request already sent.');
      return;
    } 
    // change modal
    requestToJoinClub(clubData.clubId, clubData.clubName, clubData.publicClub);
    if (clubData.publicClub) {
      setJoinClubModalVisible(true);

      // start timer for checking membership
      const timer = setTimeout(() => {
        checkMembership(club.clubId, setCurrentUserPrivilege, setIsRequestSent);
      }, 1000);
    } else {
      setRequestClubModalVisible(true);
    }
  };

  // goto UserList
  const gotoUserList = () => {
    navigation.navigate('UserList', { clubId : club.clubId, members: clubData.clubMembers, clubName: clubData.clubName });
  }

  // goto message search
  const gotoMessageSearch = () => {
    navigation.navigate('MessageSearchScreen', { clubId: club.clubId, chatName: "chats", pin: false });
  }

  // goto image gallery
  const gotoImageGallery = () => {
    navigation.navigate('ImageGalleryScreen', { clubId: club.clubId });
  }

  // goto admin chat (fix later)
  const gotoAdminChat = () => {
    goToAdminChatScreen(clubData, navigation);
  }

  // go to manage club
  const goToManageClub = () => {
    navigation.navigate('InClubView', { clubId: club.clubId });
  }

  // add event button
  const onAddEventPress = () => {
    navigation.navigate("NewEvent", {
      clubId: club.clubId,
      clubCategories: club.clubCategories,
      fromMap: false,
    });
  }

  // get member count from members object (not used currently)
  const memberCount = () => {
    if (clubData.clubMembers) {
      const memberCount = Object.keys(clubData.clubMembers).length;
      return memberCount;
    } else {
      return 0;
    }
  }

  // filter events by club
  const filterFunct = (event) => {
    if (event.clubId !== club.clubId) {
      return false;
    }
    
    // filter by public events
    if (currentUserPrivilege == 'none') {
      if (!event.public) {
        return false;
      }
    }

    return true;
  }

  const filteredEvents = eventData.filter(filterFunct);

  return (
    <View style={styles.container}>
      <Header back navigation={navigation}></Header>
      {clubData &&
      <ScrollView>
        <View style={styles.content}>
          <ClubImg clubImg={clubData.clubImg} width={120} />

          <View style={styles.clubContent}>

            <CustomText style={styles.clubName} text={clubData.clubName} font="black" />

            {/* categories */}
            <View style={styles.categoriesContent}>
              {club.clubCategories.length !== 0 &&
                club.clubCategories.map((item) => {
                  // get corresponding club category
                  const category = CLUBCATEGORIES.find((clubCategory) => clubCategory.value === item);

                  return (
                    <Chip 
                      key={item} 
                      style={styles.categoriesChip} 
                      text={category.emoji + " " + category.value} 
                      color={category.lightColor} 
                      textColor={category.color}
                    />
                  );
                })
              }
            </View>

            {/* description */}
            <CustomText 
              style={styles.clubDescription} 
              text={clubData.clubDescription} 
              numberOfLines={5}
            />
            
            {/* join club button */}
            {currentUserPrivilege === 'none' && (
              <CustomButton text="Join" onPress={onRequestButtonPress} />
            )}
          </View>

          <View style={styles.clubButtons}>
            {currentUserPrivilege != 'none' && (
              <View>
                <IconText icon="hammer-outline" iconColor={Colors.lightGray} text="Tools" />
                <View style={{ height: 15 }} />
                <IconButton onPress={gotoUserList} text={`Members (${memberCount()})`} icon="people-outline" />
                <View style={styles.separator} />
                <IconButton onPress={gotoMessageSearch} text="Search Messages" icon="search-outline" />
                <View style={styles.separator} />
                <IconButton onPress={gotoImageGallery} text="Image Gallery" icon="images-outline" />
                {(currentUserPrivilege === 'admin' || currentUserPrivilege === 'owner') && (
                  <View>
                    <View style={styles.separator} />
                    <IconButton onPress={gotoAdminChat} text="Admin Chat" icon="key-outline" />
                  </View>
                )}
                <View style={styles.separator} />
                <IconButton onPress={goToManageClub} text="Manage Club" icon="settings-outline" />
              </View>
            )}

            <IconText icon="calendar-outline" iconColor={Colors.lightGray} text="Upcoming Events" />
            <UpcomingEvents filteredEvents={filteredEvents} navigation={navigation} screenName={"ClubScreen"}/>

            {/* extra space at the bottom of the screen */}
            <View style={{height: 50}}/>

            <View style={{position: "absolute", bottom: -600, left: 0, right: 0, backgroundColor: Colors.white, height: 600}}/>
          </View>

        </View>
      </ScrollView>
      }
        
      {/* extra buttons */}
      {(currentUserPrivilege == 'admin' || currentUserPrivilege == 'owner') && (
        <View>
          <View style={{position: 'absolute', bottom: 5, right: 75, margin: 30}}>
            <Fade visible={showText}>
              <CustomText style={styles.popUpText} text="Create an Event." font='bold' />
            </Fade>
          </View>
          <CircleButton icon="calendar-number-outline" onPress={onAddEventPress} position={{ bottom: 0, right: 0 }} size={80} />
        </View>
      )}
      <IconButton icon='calendar-outline' onPress={onCalendarButtonPress} style={styles.calendarButton} text="" color={Colors.buttonBlue} />

      {/* other modals */}
      <IconOverlay visible={isJoinClubModalVisible} setVisible={setJoinClubModalVisible} icon="checkmark-circle-outline" iconColor={Colors.green} text="You have joined the club." />
      <IconOverlay visible={isRequestClubModalVisible} setVisible={setRequestClubModalVisible} icon="mail-outline" iconColor={Colors.green} text="Your request has been sent." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    backgroundColor: Colors.lightGray,
    flex: 1,
  },
  content: {
    marginTop: 30,
    alignItems: 'center',
  },
  clubContent: {
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubName: {
    fontSize: 24,
    textAlign: 'center', 
    marginBottom: 8, 
    marginHorizontal: 40,
  },
  categoriesChip: {
    margin: 5,
    padding: 10,
    borderRadius: 8,
    gap: 10,
    flexDirection: 'row',
  },
  categoriesContent: {
    marginBottom: 20,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clubDescription: {
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 10,
    color: Colors.darkGray,
  },
  clubButtons: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.white,
    width: '100%',
    marginTop: 20,
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
  calendarButton: {
    position: 'absolute',
    top: 70,
    right: 30,
  },
  popUpText: {
    color: Colors.black,
    fontSize: 25,
    textAlign: 'right',
  },
});

export default ClubScreen;