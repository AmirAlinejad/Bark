import React, { useState } from 'react'
// react native components
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
// my components
import CustomText from '../../components/display/CustomText';
import CustomInput from '../../components/input/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';
import PrivacySwitch from '../../components/input/PrivacySwitch';
import CircleButton from '../../components/buttons/CircleButton';
import Header from '../../components/display/Header';
// google places autocomplete
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// date time picker
import DateTimePicker from '@react-native-community/datetimepicker';
// maps
import MapView, { Marker } from 'react-native-maps';
// modal
import Modal from 'react-native-modal';
// backend
import { ref, set, update } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';
import { db, firestore } from '../../backend/FirebaseConfig';
// functions
import { emailSplit, deleteEvent, updateEventInGoogleCalendar, deleteEventFromGoogleCalendar } from '../../functions/backendFunctions';
import { dateForObj, timeForObj } from '../../functions/timeFunctions';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// keyboard aware scroll view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// styles
import { Colors } from '../../styles/Colors';

const EditEventScreen = ({ route, navigation }) => {
  // get user data from previous screen
  const event = route.params.event;
  console.log('editing event', event);

  // state variables
  const [eventName, setEventName] = useState(event.name);
  const [eventDescription, setEventDescription] = useState(event.description);
  const [eventDate, setEventDate] = useState(new Date(dateForObj(event.date)));
  const [eventTime, setEventTime] = useState(new Date(timeForObj(event.time)));
  const [eventDuration, setEventDuration] = useState(event.duration);
  const [eventRoomNumber, setEventRoomNumber] = useState(event.roomNumber);
  const [eventInstructions, setEventInstructions] = useState(event.instructions);
  const [publicEvent, setPublicEvent] = useState(event.publicEvent);
  const [loading, setLoading] = useState(false);
  // overlay
  const [modalVisible, setModalVisible] = useState(false);

  const eventAddress = event.address ? event.address : null;

  // edit event
  const onEditEventSubmitted = async (e) => {
    setLoading(true);
    e.preventDefault();

    // check if any fields are empty
    if (!eventName || !eventDescription) {
      alert('Please fill out all required fields');
      setLoading(false);
      return;
    }

    // try to submit the edit profile request
    try {

      const schoolKey = await emailSplit();

      const updatedEvent = {
        id: event.id,
        clubId: event.clubId,
        clubName: event.clubName,
        categories: event.categories,
        name: eventName,
        description: eventDescription,
        date: eventDate.toDateString(),
        time: eventTime.toTimeString(),
        publicEvent: publicEvent,
      };

      console.log(updatedEvent);
      if (eventDuration) updatedEvent.duration = eventDuration;
      //if (location) updatedEvent.location = location;
      if (eventAddress) updatedEvent.address = eventAddress;
      if (eventRoomNumber) updatedEvent.roomNumber = eventRoomNumber;
      if (eventInstructions) updatedEvent.instructions = eventInstructions;

      // update event in firestore
      const eventDoc = doc(firestore, 'schools', schoolKey, 'eventData', event.id); // 'schools/{schoolId}/events/{eventId}
      await updateDoc(eventDoc, updatedEvent);

      // update calendar data
      const calendarDataDoc = doc(firestore, 'schools', schoolKey, 'calendarData', event.id); // 'schools/{schoolId}/calendarData/{eventId}
      await updateDoc(calendarDataDoc, {
        clubId: event.clubId,
        id: event.id,
        name: eventName,
        date: eventDate.toDateString(),
        time: eventTime.toTimeString(),
        categories: event.categories,
        publicEvent: publicEvent,
      });

      updateEventInGoogleCalendar(updatedEvent);

      navigation.navigate("HomeScreen"); // make go back to event screen eventually
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

  // navigate to map screen
  const onMapPressed = () => {
    navigation.navigate('MapPicker', {
      // send event data to map picker screen
      event: {
        id: event.id,
        eventName: eventName,
        description: eventDescription,
        //location: location,
        address: eventAddress,
        date: eventDate.toDateString(),
        time: eventTime.toTimeString(),
        duration: eventDuration,
        roomNumber: eventRoomNumber,
        instructions: eventInstructions,
        clubId: event.clubId,
        clubName: event.clubName,
        categories: event.categories,
        publicEvent: publicEvent,
      },
      fromEdit: true,
    });
  }

  // delete event
  const deleteThisEvent = async () => {
    deleteEvent(event.id);
    deleteEventFromGoogleCalendar(event);
    navigation.navigate('HomeScreen');
  }

  return (
    <View style={styles.container}>

      <Header text={'Edit ' + eventName} back navigation={navigation}/>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.elementsContainer}
        extraHeight={200}
      >
        <CustomText style={styles.textNormal} font="bold" text="Event Name*" />
        <CustomInput
          placeholder="Event Name"
          value={eventName}
          setValue={setEventName}
        />

        <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Public Event" />
        <PrivacySwitch toggled={publicEvent} setToggled={setPublicEvent} />

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

        <CustomText style={styles.textNormal} font="bold" text="Time" />
        <View style={{ alignItems: 'flex-start' }}> 
          <DateTimePicker
            testID="dateTimePicker"
            value={eventTime}
            mode={'time'}
            is24Hour={true}
            onChange={(event, selectedTime) => setEventTime(selectedTime)}
          />
        </View>

        {/*<CustomText style={[styles.textNormal, {marginVertical: 10}]} font="bold" text="Location" />
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
            />
          </MapView>
          <View style={{position: 'absolute', top: 40, left: 40}} >
            <Ionicons name="location" size={80} color='rgba(0,0,0,0.5)' />
          </View>
        </TouchableOpacity>*/}
        <CustomText style={styles.textNormal} font="bold" text="Location" />
        {
          eventAddress ? (
            <TouchableOpacity onPress={onMapPressed}>
              <CustomText style={styles.textPressableSmall} text={splitAddress(eventAddress)[0] + "\n" + splitAddress(eventAddress)[1]} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onMapPressed}>
              <CustomText style={styles.textPressable} text="Select a location" />
            </TouchableOpacity>
          )
        }

        <CustomText style={styles.textNormal} font="bold" text="Duration" />
        <CustomInput
          placeholder="Duration"
          value={eventDuration}
          setValue={setEventDuration}
          keyboardType="number-pad"
          width={190}
        />

        <CustomText style={styles.textNormal} font="bold" text="Room Number" />
        <CustomInput
          placeholder="Room Number"
          value={eventRoomNumber}
          setValue={setEventRoomNumber}
          keyboardType="number-pad"
          width={190}
        />

        <CustomText style={styles.textNormal} font="bold" text="Instructions" />
        <CustomInput
          placeholder="ex. Up the stairs on your right"
          value={eventInstructions}
          setValue={setEventInstructions}
          keyboardType="default"
        />

        <CustomText style={styles.textNormal} font="bold" text="Details*" />
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

        <CustomText style={styles.smallText} text="* Indicates a required field" />

        <View style={styles.buttonContainer}>
          <CustomButton text="Save Changes" onPress={onEditEventSubmitted} />
        </View>

      </KeyboardAwareScrollView>
      
      <CircleButton icon="trash-outline" onPress={() => setModalVisible(true)} position={{ bottom: 0, right: 0 }} size={80} />

      <Modal isVisible={modalVisible}>

        <View style={styles.modalContainer}>
          <CustomText style={styles.modalText} text="Are you sure you want to delete the event?" />
          <View style={styles.modalButtons}>
            <CustomButton text="Yes" onPress={deleteThisEvent} color={Colors.red}/>
            <CustomButton text="No" onPress={() => setModalVisible(false)} color={Colors.green}/>
          </View>
        </View>

      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'flex-start',
  },
  elementsContainer: {
    justifyContent: 'flex-start',
    marginTop: 20,
    marginLeft: 20,
    gap: 5,
  },
  mapStyle: {
    width: 170,
    height: 170,
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonContainer: {
   width: 400,
   height: 100,
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
  textNormal: {
    fontSize: 20,
    marginLeft: 5,
  },
  smallText: { // for required fields
    marginTop: -5,
    fontSize: 14,
    color: Colors.darkGray,
  },
  textPressable: {
    fontSize: 18,
    marginLeft: 5,
    color: Colors.buttonBlue,
  },
  textPressableSmall: {
    fontSize: 16,
    marginLeft: 5,
    color: Colors.buttonBlue,
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
export default EditEventScreen;