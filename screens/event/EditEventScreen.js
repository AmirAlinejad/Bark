import React, { useEffect, useState } from 'react'
// react native components
import { View, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
// my components
import CustomText from '../../components/CustomText';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Header from '../../components/Header';
// date time picker
import DateTimePicker from '@react-native-community/datetimepicker';
// time functions
import { toTimeString, toDateString } from '../../functions/timeFunctions';
// maps
import MapView, { Marker } from 'react-native-maps';
// backend
import { ref, set, update } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
// fonts
import { textNormal } from '../../styles/FontStyles';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// keyboard aware scroll view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// styles
import { Colors } from '../../styles/Colors';

const EditEventScreen = ({ route, navigation }) => {
  // get user data from previous screen
  const event = route.params.event;
  console.log(event);

  // format date from DOT Mon DD YYYY to create date object
  const dateForObj = (date) => {
    const split = date.split(" ");
    let month = split[1];
    if (month === "Jan") {
      month = "01";
    } else if (month === "Feb") {
      month = "02";
    } else if (month === "Mar") {
      month = "03";
    } else if (month === "Apr") {
      month = "04";
    } else if (month === "May") {
      month = "05";
    } else if (month === "Jun") {
      month = "06";
    } else if (month === "Jul") {
      month = "07";
    } else if (month === "Aug") {
      month = "08";
    } else if (month === "Sep") {
      month = "09";
    } else if (month === "Oct") {
      month = "10";
    } else if (month === "Nov") {
      month = "11";
    } else if (month === "Dec") {
      month = "12";
    }
    let day = split[2];
    const dayNum = parseInt(day) + 1;
    day = dayNum.toString();
    if (day.length === 1) {
      // add 1 to value of day
      day = "0" + day;
    }
    const year = split[3];
    console.log(year + "-" + month + "-" + day);
    return year + "-" + month + "-" + day;
  };

  // time format
  const timeForObj = (time) => {
    const split = time.split(" ");
    const timeSplit = split[0].split(":");
    const hour = timeSplit[0];
    let minute = parseInt(timeSplit[1]) - 3;
    if (minute < 10) {
      minute = "0" + minute;
    }
    console.log(hour + ":" + minute);
    return "0000-00-00T" + hour + ":" + minute + ":00" + "-05:00";
  };

  // state variables
  const [eventName, setEventName] = useState(event.name);
  const [eventDescription, setEventDescription] = useState(event.description);
  const [eventDate, setEventDate] = useState(new Date(dateForObj(event.date)));
  const [eventTime, setEventTime] = useState(new Date(timeForObj(event.time)));
  const [eventRoomNumber, setEventRoomNumber] = useState(event.roomNumber);
  const [eventInstructions, setEventInstructions] = useState(event.instructions);
  const [publicEvent, setPublicEvent] = useState(event.public);
  const [loading, setLoading] = useState(false);

  // edit event
  const onEditEventSubmitted = async (e) => {
    setLoading(true);
    e.preventDefault();

    // try to submit the edit profile request
    try {
        // update old event info
        const userRef = ref(db, `events/${event.id}`);
        await update(userRef, {
            name: eventName,
            description: eventDescription,
            date: eventDate,
            time: eventTime,
            location: event.Location,
            address: event.address,
            roomNumber: eventRoomNumber,
            instructions: eventInstructions,
            public: publicEvent,
        });

        navigation.navigate("HomeScreen");
    } catch (error) {
      console.log(error);
      alert('Edit Event failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // split address into two lines
  const splitAddress = (address) => {
    const split = address.split(", ");
    return split;
  };

  // delete
  const deleteEvent = async () => {
    setLoading(true);
    try {
      const eventRef = ref(db, `events/${event.id}`);
      await set(eventRef, null);
      navigation.navigate("HomeScreen");
    } catch (error) {
      console.log(error);
      alert('Delete Event failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // navigate to map screen
  const onMapPressed = () => {
    navigation.navigate('MapPicker', {
      event: {
        location: event.location,
        address: event.address,
        name: eventName,
        date: eventDate.toDateString(),
        time: eventTime.toTimeString(),
        roomNumber: eventRoomNumber,
        instructions: eventInstructions,
        description: eventDescription,
        public: publicEvent,
      },
      fromEdit: true,
    });
  }

  return (
    <View style={styles.container}>
      <Header text={'Edit ' + eventName} back navigation={navigation}/>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.elementsContainer}
        extraHeight={200}
      >

        <CustomText style={styles.textNormal} font="bold" text="Event Name" />
        <CustomInput
          placeholder="Event Name"
          value={eventName}
          setValue={setEventName}
        />

        <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Public Event" />
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
        <Ionicons
            name={publicEvent ? 'globe-outline' : 'lock-closed'}
            size={30}
            color={Colors.black}
          />
          <Switch
            trackColor={{ false: Colors.black, true: Colors.buttonBlue }}
            thumbColor={Colors.white}
            onValueChange={setPublicEvent}
            value={publicEvent}
          />
        </View>

        <CustomText style={styles.textNormal} font="bold" text="Date" />
        <View style={{ alignItems: 'flex-start'}}> 
          <DateTimePicker
            testID="dateTimePicker"
            value={eventDate}
            mode={'date'}
            is24Hour={true}
            onChange={(event, selectedDate) => setEventDate(selectedDate)}
          />
        </View>

        <CustomText style={[styles.textNormal, {marginTop: 10,}]} font="bold" text="Time" />
        <View style={{ alignItems: 'flex-start', marginLeft: -10 }}> 
          <DateTimePicker
            testID="dateTimePicker"
            value={eventTime}
            mode={'time'}
            is24Hour={true}
            onChange={(event, selectedTime) => setEventTime(selectedTime)}
          />
        </View>

        <CustomText style={[styles.textNormal, {marginTop: 10, marginBottom: 10}]} font="bold" text="Location" />
        <TouchableOpacity style={styles.mapStyle} onPress={onMapPressed}>
          <MapView
            style={styles.mapStyle}
            region={event.location}
          >
            <Marker
              coordinate={{
                latitude: event.location.latitude,
                longitude: event.location.longitude,
              }}
              title={eventName ? eventName : undefined} // doesn't pass if eventName is empty
            />
          </MapView>
          <View style={{position: 'absolute', top: 40, left: 40}} >
            <Ionicons name="location" size={80} color='rgba(0,0,0,0.5)' />
          </View>
        </TouchableOpacity>
        {
          event.address ? (
            <View>
              <CustomText style={styles.textSmall} text={splitAddress(event.address)[0] + "\n" + splitAddress(event.address)[1]} />
            </View>
          ) : (
            <CustomText style={styles.textSmall} text="No location selected" />
          )
        }

        <CustomText style={styles.textNormal} font="bold" text="Room Number" />
        <CustomInput
          placeholder="Room Number (Optional)"
          value={eventRoomNumber}
          setValue={setEventRoomNumber}
          keyboardType="number-pad"
          width={190}
        />

        <CustomText style={styles.textNormal} font="bold" text="Instructions" />
        <CustomInput
          placeholder="ex. Up the stairs on your right (Optional)"
          value={eventInstructions}
          setValue={setEventInstructions}
          keyboardType="default"
        />

        <CustomText style={styles.textNormal} font="bold" text="Details" />
        <View style={styles.largeInputContainer}>
          <TextInput
            placeholder="What's happening?"
            value={eventDescription}
            onChangeText={setEventDescription}
            keyboardType="default"
            maxLength={500}
            numberOfLines={5}
            multiline={true}
            textAlignVertical='top'
          />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton text="Save Changes" onPress={onEditEventSubmitted} />
        </View>

      </KeyboardAwareScrollView>
      
      <View style={styles.rightButtonView}>
          <TouchableOpacity style={styles.addEventButton} onPress={deleteEvent}>
            <Ionicons name="trash-outline" color="white" size={40} />
          </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'flex-start',
  },
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
  elementsContainer: {
    justifyContent: 'flex-start',
    marginTop: 20,
    marginLeft: 20,
  },
  mapStyle: {
    width: 170,
    height: 170,
    borderRadius: 20,
    marginBottom: 10,
  },
  inputContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
    width: '90%',
    padding: 15,
    marginBottom: 20,
  },
  buttonContainer: {
   width: 400,
   height: 100,
  },
  largeInputContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
    width: '90%',
    padding: 15,
    marginBottom: 20,
  },
  textNormal: {
    ...textNormal,
    fontSize: 20,
    marginLeft: 5,
  },
});
export default EditEventScreen;