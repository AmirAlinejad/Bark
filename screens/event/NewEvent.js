import React, { useState, useLayoutEffect } from 'react';
// storage
import AsyncStorage from '@react-native-async-storage/async-storage';
// react native components
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// my components
import CustomInput from '../../components/input/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';
import CustomText from '../../components/display/CustomText';
import Header from '../../components/display/Header';
import IconOverlay from '../../components/overlays/IconOverlay';
import PrivacySwitch from '../../components/input/PrivacySwitch';
// google places autocomplete
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// functions
import { emailSplit, addEventToGoogleCalendar } from '../../functions/backendFunctions';
// backend
import { db, firestore } from '../../backend/FirebaseConfig';
// date time picker
import { ref, set } from "firebase/database";
import { doc, setDoc } from "firebase/firestore"; // firestore
import DateTimePicker from '@react-native-community/datetimepicker';
// maps
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
// styles
import { Colors } from '../../styles/Colors';
// scroll view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';

// initialize geocoder
Geocoder.init('AIzaSyAoX4MTi2eAw2b_W3RzA35Cy5yjpwQYV3E');

const NewEvent = ({ route, navigation }) => { 

  // get club name from previous screen
  const { clubId, clubCategories, event } = route.params;

  // create states for event info
  const [eventName, setName] = useState(event ? event.name : "");
  const [eventDescription, setDescription] = useState("");
  const [date, setDate] = useState(event ? new Date(event.date) : new Date());
  const [time, setTime] = useState(event ? new Date(event.time): new Date());
  const [duration, setDuration] = useState(event ? event.duration : 0); // duration of the event in minutes
  const [roomNumber, setRoomNumber] = useState(event ? event.roomNumber : ""); // room number of the event
  const [instructions, setInstructions] = useState(event ? event.instructions : ""); // instructions to get to the event
  const [publicEvent, setPublicEvent] = useState(true); // whether the event is public or private
  const [loading, setLoading] = useState(false);
  // overlay
  const [overlayVisible, setOverlayVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'New Event',
    });
  }, [navigation]);

  /*// location and address are const (not implemented currently)
  const location = event ? event.location : {
    // university of georgia by default
    latitude: 33.9562,
    longitude: -83.3740,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };*/
  const address = event ? event.address : "";

  // submit the form
  const onSubmitPressed = async () => {
    setLoading(true);

    // name, desc, address, and time are required
    if (!eventName || !eventDescription) {
      alert("Please fill out all required fields.");
      setLoading(false);
      return;
    }
    
    // try to submit the form
    try {
      // generate unique event id
      const eventId = Math.random().toString(36).substring(7);

      // get school key from async storage
      const schoolKey = await emailSplit();

      try {

        const newEvent = {
          id: eventId,
          clubId: clubId,
          categories: clubCategories,
          name: eventName,
          description: eventDescription,
          date: date.toDateString(),
          time: time.toTimeString(),
          publicEvent: publicEvent,
        }
        if (duration) newEvent.duration = duration
        //if (location) newEvent.location = location
        if (address) newEvent.address = address
        if (instructions) newEvent.instructions = instructions
        if (roomNumber) newEvent.roomNumber = roomNumber
        
        await setDoc(doc(firestore, 'schools', schoolKey, 'eventData', eventId), newEvent);

        // set calendar event
        await setDoc(doc(firestore, 'schools', schoolKey, 'calendarData', eventId), {
          clubId: clubId,
          id: eventId,
          name: eventName,
          date: date.toDateString(),
          time: time.toTimeString(),
          categories: clubCategories,
          publicEvent: publicEvent,
        });

        addEventToGoogleCalendar(newEvent);

      } catch (e) {
        console.error("Error adding document: ", e);
      }
  
      setOverlayVisible(true);
    } catch (error) {
      console.log(error);
      alert('event creation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // navigate to map screen
  const onMapPressed = () => {
    navigation.navigate('MapPicker', {
      event: {
        eventName: eventName,
        description: eventDescription,
        //location: location,
        address: address,
        date: date.toDateString(),
        time: time.toTimeString(),
        duration: duration,
        roomNumber: roomNumber,
        instructions: instructions,
        clubId: clubId,
        categories: clubCategories,
        publicEvent: publicEvent,
        rsvps: [],
      }
    });
  }

  // split address into street and city
  const splitAddress = (address) => {
    let split = [];
    split[0] = address.split(',')[0];
    split[1] = address.slice(address.indexOf(',') + 2, address.length);
    return split;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.elementsContainer}
        contentInsetAdjustmentBehavior='automatic'
        extraHeight={200}
      >
        <CustomText style={styles.textNormal} font="bold" text="Event Name*" />
        <CustomInput
          placeholder="Event Name (50 characters)"
          value={eventName}
          setValue={setName}
          maxLength={50}
        />

        <CustomText style={styles.textNormal} font="bold" text={publicEvent ? "Public Event" : "Private Event"} />
        <PrivacySwitch toggled={publicEvent} setToggled={setPublicEvent} />

        <CustomText style={styles.textNormal} font="bold" text="Date" />
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={'date'}
          is24Hour={true}
          onChange={(event, selectedDate) => setDate(selectedDate)}
        />

        <CustomText style={styles.textNormal} font="bold" text="Time" />
        <DateTimePicker
          testID="dateTimePicker"
          value={time}
          mode={'time'}
          is24Hour={true}
          onChange={(event, selectedTime) => setTime(selectedTime)}
        />

        <CustomText style={styles.textNormal} font="bold" text="Location" />
        {
          address ? (
            <TouchableOpacity onPress={onMapPressed}>
              <CustomText style={styles.textPressableSmall} text={splitAddress(address)[0] + "\n" + splitAddress(address)[1]} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onMapPressed}>
              <CustomText style={styles.textPressable} text="Select a location" />
            </TouchableOpacity>
          )
        }

        <CustomText style={styles.textNormal} font="bold" text="Duration" />
        <CustomInput
          placeholder="Duration (in minutes)"
          value={duration}
          setValue={setDuration}
          keyboardType="number-pad"
          width={190}
        />

        {/*<CustomText style={styles.textNormal} font="bold" text="Location" /> 
        <TouchableOpacity style={styles.mapStyle} onPress={onMapPressed}>
          <MapView
            style={styles.mapStyle}
            region={location}
          >
            <Marker coordinate={location} />
          </MapView>
          <View style={{position: 'absolute', top: 40, left: 40, right: 40, down: 40}}>
            <Ionicons name="location" size={70} color='rgba(0,0,0,0.5)' />
          </View>
        </TouchableOpacity>*/}

        <CustomText style={styles.textNormal} font="bold" text="Room Number" />
        <CustomInput
          placeholder="Room Number"
          value={roomNumber}
          setValue={setRoomNumber}
          keyboardType="number-pad"
          width={190}
        />

        <CustomText style={styles.textNormal} font="bold" text="Instructions" />
        <CustomInput
          placeholder="ex. Up the stairs on your right"
          value={instructions}
          setValue={setInstructions}
          keyboardType="default"
        />

        <CustomText style={styles.textNormal} font="bold" text="Details*" />
        <View style={styles.largeInputContainer}>
          <TextInput
            placeholder="What's happening? (250 characters)"
            value={eventDescription}
            onChangeText={setDescription}
            keyboardType="default"
            maxLength={250}
            numberOfLines={5}
            style={styles.input}
            multiline={true}
            textAlignVertical='top'
          />
        </View>

        <CustomText style={styles.smallText} text="* Indicates a required field" />
    
        {loading && <CustomText text="Loading..." />}
        <CustomButton text="Create" onPress={onSubmitPressed} type="primary"/>
        <View style={{height: 50}} />
      </KeyboardAwareScrollView>

      <IconOverlay 
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        closeCondition={() => {
          navigation.goBack();
        }}
        icon="checkmark-circle"
        iconColor={Colors.green}
        text="Event created!"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    gap: 5,
  },
  elementsContainer: {
    marginTop: 0,
    alignItems: 'flex-start',
    marginLeft: 20,
  },
  mapStyle: {
    width: 150,
    height: 150,
    borderRadius: 20,
    marginBottom: 20,
  },
  largeInputContainer: {
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
    width: '90%',
    padding: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.black,
    backgroundColor: 'transparent',
    width: '90%',
  },
  textNormal: {
    fontSize: 20,
    marginLeft: 5,
    marginTop: 10,
  },
  textPressable: {
    fontSize: 18,
    marginLeft: 5,
    marginTop: 10,
    color: Colors.buttonBlue,
  },
  textPressableSmall: {
    fontSize: 16,
    marginLeft: 5,
    marginTop: 10,
    color: Colors.buttonBlue,
  },
  textSmall: {
    fontSize: 12,
    marginLeft: 5,
  },
  smallText: { // for required fields
    marginTop: -5,
    fontSize: 14,
    color: Colors.darkGray,
  },
});

export default NewEvent;