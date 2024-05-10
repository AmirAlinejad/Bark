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
// date time picker
import DateTimePicker from '@react-native-community/datetimepicker';
// maps
import MapView, { Marker } from 'react-native-maps';
// modal
import Modal from 'react-native-modal';
// backend
import { ref, set, update } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../backend/FirebaseConfig';
// functions
import { emailSplit } from '../../functions/backendFunctions';
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
  console.log(event);

  // state variables
  const [eventName, setEventName] = useState(event.name);
  const [eventDescription, setEventDescription] = useState(event.description);
  const [eventDate, setEventDate] = useState(new Date(dateForObj(event.date)));
  const [eventTime, setEventTime] = useState(new Date(timeForObj(event.time)));
  const [eventRoomNumber, setEventRoomNumber] = useState(event.roomNumber);
  const [eventInstructions, setEventInstructions] = useState(event.instructions);
  const [publicEvent, setPublicEvent] = useState(event.public);
  const [loading, setLoading] = useState(false);
  // overlay
  const [modalVisible, setModalVisible] = useState(false);

  // edit event
  const onEditEventSubmitted = async (e) => {
    setLoading(true);
    e.preventDefault();

    // check if any fields are empty
    if (!eventName || !eventDescription || !eventDate || !eventTime) {
      alert('Please fill out all required fields');
      setLoading(false);
      return;
    }

    // try to submit the edit profile request
    try {
      // update old event info
      const userRef = ref(db, `${emailSplit()}/events/${event.id}`);
      await update(userRef, {
          name: eventName,
          description: eventDescription,
          date: eventDate.toDateString(),
          time: eventTime.toTimeString(),
          location: event.location,
          address: event.address,
          roomNumber: eventRoomNumber,
          instructions: eventInstructions,
          public: publicEvent,
          categories: event.categories,
          id: event.id,
      });

      // update event in firestore
      const eventDoc = doc(db, `${emailSplit()}/eventData/${event.id}`);
      await updateDoc(eventDoc, {
        name: eventName,
        description: eventDescription,
        date: eventDate.toDateString(),
        time: eventTime.toTimeString(),
        location: event.location,
        address: event.address,
        roomNumber: eventRoomNumber,
        instructions: eventInstructions,
        public: publicEvent,
        categories: event.categories,
        id: event.id,
      });

      // update calendar data
      const calendarDataDoc = doc(db, `${emailSplit()}/calendarData/${event.id}`);
      await updateDoc(calendarDataDoc, {
        name: eventName,
        date: eventDate.toDateString(),
        time: eventTime.toTimeString(),
        public: publicEvent,
        id: event.id,
      });

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

  // delete event
  const deleteEvent = async () => {
    setLoading(true);
    try {
      const eventRef = ref(db, `${emailSplit()}/events/${event.id}`);
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
      // send event data to map picker screen
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
        categories: event.categories,
        id: event.id,
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

        <CustomText style={[styles.textNormal, {marginVertical: 10}]} font="bold" text="Location" />
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
        </TouchableOpacity>
        {
          event.address ? (
            <CustomText style={styles.textSmall} text={splitAddress(event.address)[0] + "\n" + splitAddress(event.address)[1]} />
          ) : (
            <CustomText style={styles.textSmall} text="No location selected" />
          )
        }

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
            <CustomButton text="Yes" onPress={deleteEvent} color={Colors.red}/>
            <CustomButton text="No" onPress={() => setModalVisible(false)} color={Colors.buttonBlue}/>
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