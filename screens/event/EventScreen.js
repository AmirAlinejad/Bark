<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
// backend
import { ref, get } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
// my components
import Header from '../../components/Header';
import CustomText from '../../components/CustomText';
import IconButton from '../../components/buttons/IconButton';
import CircleButton from '../../components/buttons/CircleButton';
import ToggleButton from '../../components/buttons/ToggleButton';
// time functions
import { timeToString } from '../../functions/timeFunctions';
// map
import MapView, { Marker } from 'react-native-maps';
// fonts
import { textNormal } from '../../styles/FontStyles';
// colors
import { Colors } from '../../styles/Colors';
// clipboard
import * as Clipboard from 'expo-clipboard'; 

const EventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLeaveClubModalVisible, setLeaveClubModalVisible] = useState(false);
  const [RSVPList, setRSVPList] = useState([]); // list of users who RSVP'd
  const [userRSVP, setUserRSVP] = useState(false); // if the user has RSVP'd

  const userId = getAuth().currentUser.uid;

  // clipboard
  const copyAddressToClipboard = async () => {
    Clipboard.setStringAsync(event.address);
    alert('Event address copied to clipboard');
  }

  // add rsvp data to state
  useEffect(() => {
    const rsvpRef = ref(db, `events/${event.eventId}/rsvp`);
    get(rsvpRef).then((snapshot) => {
      if (snapshot.exists()) {
        setRSVPList(snapshot.val());
      }
    });

    // check if user has RSVP'd
    if (RSVPList.includes(userId)) {
      setUserRSVP(true);
    }

  }, []);

  // club data
  const [clubData, setClubData] = useState({});

  const checkMembership = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      const clubRef = ref(db, `clubs/${event.clubId}/clubMembers`);

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
    // get club data from db
    const clubRef = ref(db, `clubs/${event.clubId}`);
    get(clubRef).then((snapshot) => {
      if (snapshot.exists()) {
        setClubData(snapshot.val());
      }
    });

    checkMembership();
  }, []);

  const onEditButtonPress = () => {
    navigation.navigate('EditEvent', {
      event: event,
    });
  };

  // split address into street and city
  const splitAddress = (address) => {
    let split = [];
    split[0] = address.split(',')[0];
    split[1] = address.slice(address.indexOf(',') + 2, address.length);
    return split;
  }

  const reformatDate = (date) => {
    let split = [];
    split[0] = date.split(' ')[0];
    if (split[0] === 'Mon') {
      split[0] = 'Monday';
    } else if (split[0] === 'Tue') {
      split[0] = 'Tuesday';
    } else if (split[0] === 'Wed') {
      split[0] = 'Wednesday';
    } else if (split[0] === 'Thu') {
      split[0] = 'Thursday';
    } else if (split[0] === 'Fri') {
      split[0] = 'Friday';
    } else if (split[0] === 'Sat') {
      split[0] = 'Saturday';
    } else if (split[0] === 'Sun') {
      split[0] = 'Sunday';
    }
    split[1] = date.split(' ')[1];
    if (split[1] === 'Jan') {
      split[1] = 'January';
    } else if (split[1] === 'Feb') {
      split[1] = 'February';
    } else if (split[1] === 'Mar') {
      split[1] = 'March';
    } else if (split[1] === 'Apr') {
      split[1] = 'April';
    } else if (split[1] === 'May') {
      split[1] = 'May';
    } else if (split[1] === 'Jun') {
      split[1] = 'June';
    } else if (split[1] === 'Jul') {
      split[1] = 'July';
    } else if (split[1] === 'Aug') {
      split[1] = 'August';
    } else if (split[1] === 'Sep') {
      split[1] = 'September';
    } else if (split[1] === 'Oct') {
      split[1] = 'October';
    } else if (split[1] === 'Nov') {
      split[1] = 'November';
    } else if (split[1] === 'Dec') {
      split[1] = 'December';
    }
    split[2] = date.split(' ')[2];
    split[3] = date.split(' ')[3];
    return split[0] + ', ' + split[1] + ' ' + split[2] + ', ' + split[3];
  }

  return (
    <View style={styles.container}>
      <Header text={event.name} back navigation={navigation}></Header>
      <View style={styles.eventContent}>
        
        {/*<CustomText style={styles.title} font='bold' text="Description" />*/}
        <CustomText style={styles.textNormal} text={event.description} />

        {/*<CustomText style={styles.title} font='bold' text="Date" />*/}
        <CustomText style={styles.textNormal} text={reformatDate(event.date)} />

        {/*<CustomText style={styles.title} font='bold' text="Time" />*/}
        <CustomText style={styles.textNormal} text={timeToString(event.time)} />

        <CustomText style={styles.title} font='bold' text="Location" />
        <MapView
          style={styles.mapStyle}
          region={event.location}
        >
          <Marker
            coordinate={event.location}
            title={event.name ? event.name : undefined} // doesn't pass if eventName is empty
          />
        </MapView>
        {event.address ? (        
          <View style={{flexDirection: 'row'}}>
            <View>
              <CustomText style={styles.textSmall} text={splitAddress(event.address)[0]} />
              <CustomText style={styles.textSmall} text={splitAddress(event.address)[1]} />
            </View>
            <IconButton icon={'copy-outline'} text="Copy address" onPress={copyAddressToClipboard} />
          </View>
        ) : (
          <CustomText style={styles.textSmall} text="No address provided" />
        )}

        <ToggleButton toggled={userRSVP} icon={userRSVP ? 'checkmark' : 'people'} toggledCol={Colors.red} untoggledCol={Colors.lightRed} text="RSVP" onPress={() => {
          if (userRSVP) {
            // remove user from rsvp list
            const index = RSVPList.indexOf(userId);
            if (index > -1) {
              RSVPList.splice(index, 1);
            }
            setRSVPList(RSVPList);
            setUserRSVP(false);
          } else {
            // add user to rsvp list
            RSVPList.push(userId);
            setRSVPList(RSVPList);
            setUserRSVP(true);
          }

          // update backend
          const rsvpRef = ref(db, `events/${event.eventId}/rsvp`);
          set(rsvpRef, RSVPList);

          navigation.goBack();
        }} />

        <View style={styles.button}>
          <IconButton icon={'arrow-forward-circle-outline'} text="Go to club" onPress={() => {
            navigation.navigate("ClubScreen", {
              name: clubData.clubName,
              id: clubData.clubId,
              description: clubData.clubDescription,
              categories: clubData.clubCategories,
              img: clubData.clubImg,
              events: clubData.events,
            });
          }} />
        </View>

      </View>

      {isAdmin &&
        <CircleButton icon="create-outline" onPress={onEditButtonPress} position={{ bottom: 0, right: 0 }} size={80} />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  eventContent: {
    marginTop: 20,
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  mapStyle: {
    width: 170,
    height: 170,
    borderRadius: 20,
    marginBottom: 10,
  },
  eventButtons: {
    gap: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    position: 'absolute',
    right: 10,
    top: -60,
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

  // fonts
  title: {
    ...textNormal,
    fontSize: 25,
  },
  textNormal: {
    ...textNormal,
    fontSize: 18,
  },
  textSmall: {
    ...textNormal,
    fontSize: 14,
  },
});

=======
import React from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
import { IconButton} from 'react-native-paper';
// my components
import Header from '../../components/Header';
import CustomText from '../../components/CustomText';
// maps
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

const EventScreen = ({ route, navigation }) => {
  // get event info from the previous screen
  const { name, description, datetime, location } = route.params;
  // go back to the previous screen
  const onBackPress = () => {
    navigation.goBack();
  }
  // get string for date
  const dateStr = datetime.substring(0, datetime.indexOf(','));
  // get string for time
  const timeStr = datetime.substring(datetime.indexOf(',') + 2, datetime.length - 6) + datetime.substring(datetime.length - 3, datetime.length);

  return ( 
    <View style={styles.container}>
      <View style={{marginTop: 30, flex: 1}}>
        <IconButton
          onPress={onBackPress}
          icon="arrow-left"
          size={30}
        />
      </View>
      <Header text={name} back navigation={navigation}></Header>

      <View style={styles.eventContent}>
        <CustomText style={[styles.title, {textAlign: 'center'}]} text={name} />
        <ScrollView contentContainerStyle={styles.eventContent}>
            <View style={{alignItems: 'center'}}>
              <CustomText style={[styles.title, {textAlign: 'center'}]} text={dateStr + ', ' + timeStr} />

              <CustomText style={[styles.textNormal, {textAlign: 'center', marginBottom: 20}]} text={description} />
              <View style={styles.biggerMapView}>
                <MapView
                style={styles.biggerMapStyle}
                region={location}
                >
                <Marker
                  coordinate={location}
                  title={name ? name : undefined} // doesn't pass if eventName is empty
                />
                </MapView>
              </View>
            </View>
        </ScrollView>
      </View>
    </View>   
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#D3D3D3',
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  eventContent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
    flex: 4,
  },
  biggerMapStyle: {
    width: 300,
    height: 300,
    borderRadius: 20,
  },
  title: title,
  textNoraml: textNormal,
});
>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default EventScreen;