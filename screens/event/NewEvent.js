<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
// my components
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import Header from '../../components/Header';
// backend
import { db } from '../../backend/FirebaseConfig';
// date time picker
import { ref, set } from "firebase/database";
import DateTimePicker from '@react-native-community/datetimepicker';
// maps
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
// styles
import { Colors } from '../../styles/Colors';
// fonts
import { textNormal } from '../../styles/FontStyles';
// scroll view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';

// initialize geocoder
Geocoder.init('AIzaSyAoX4MTi2eAw2b_W3RzA35Cy5yjpwQYV3E');

const NewEvent = ({ route, navigation }) => { 

  // get club name from previous screen
  const { clubId, event } = route.params;

  // create states for event info
  const [eventName, setName] = useState(event ? event.name : "");
  const [eventDescription, setDescription] = useState("");
  const [date, setDate] = useState(event ? new Date(event.date) : new Date());
  const [time, setTime] = useState(event ? new Date(event.time): new Date()); // worry ab later
  const [duration, setDuration] = useState(event ? event.duration : 0); // duration of the event in minutes
  const location = event ? event.location : {
    // university of georgia
    latitude: 33.9562,
    longitude: -83.3740,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  const address = event ? event.address : "";
  const [roomNumber, setRoomNumber] = useState(event ? event.roomNumber : ""); // room number of the event
  const [instructions, setInstructions] = useState(event ? event.instructions : ""); // instructions to get to the event
  const [publicEvent, setPublicEvent] = useState(true); // whether the event is public or private
  const [loading, setLoading] = useState(false);;

  // submit the form
  const onSubmitPressed = async () => {
    setLoading(true);

    // name, desc, address, and time are required
    if (!eventName || !eventDescription || !date || !time) {
      alert("Please fill out all required fields.");
      setLoading(false);
      return;
    }
    
    // try to submit the form
    try {
      // generate unique event id
      const eventId = Math.random().toString(36).substring(7);

      set(ref(db, 'events/' + eventId), {
        id: eventId,
        clubId: clubId,
        name: eventName,
        description: eventDescription,
        date: date.toDateString(),
        time: time.toTimeString(),
        duration: duration,
        location: location,
        address: address,
        instructions: instructions,
        roomNumber: roomNumber,
        public: publicEvent,
      });
  
      navigation.goBack();
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
        location: location,
        address: address,
        date: date.toDateString(),
        time: time.toTimeString(),
        duration: duration,
        roomNumber: roomNumber,
        instructions: instructions,
        clubId: clubId,
        public: publicEvent,
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

  const iconSize = 30;

  return (
    <View style={styles.container}>
      <Header text='New Event' back navigation={navigation}></Header>
        <KeyboardAwareScrollView 
          contentContainerStyle={styles.elementsContainer}
          extraHeight={200}
        >
          <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Event Name" />
          <CustomInput
            placeholder="Event Name"
            value={eventName}
            setValue={setName}
          />

          <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Public Event" />
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Ionicons
              name={publicEvent ? 'globe-outline' : 'lock-closed'}
              size={iconSize}
              color={Colors.black}
            />
            <Switch
              trackColor={{ false: Colors.black, true: Colors.buttonBlue }}
              thumbColor={Colors.white}
              onValueChange={setPublicEvent}
              value={publicEvent}
            />
          </View>

          <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Date" />
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={'date'}
            is24Hour={true}
            onChange={(event, selectedDate) => setDate(selectedDate)}
          />

          <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Time" />
          <DateTimePicker
            testID="dateTimePicker"
            value={time}
            mode={'time'}
            is24Hour={true}
            onChange={(event, selectedTime) => setTime(selectedTime)}
          />

          <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Duration" />
          <CustomInput
            placeholder="Duration (in minutes)"
            value={duration}
            setValue={setDuration}
            keyboardType="number-pad"
            width={190}
          />


          <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Location" /> 
          <TouchableOpacity style={styles.mapStyle} onPress={onMapPressed}>
          <MapView
            style={styles.mapStyle}
            region={location}
          >

            <Marker
              coordinate={location}
              title={eventName ? eventName : undefined} // doesn't pass if eventName is empty
            />

          </MapView>

          <View style={{position: 'absolute', top: 40, left: 40, right: 40, down: 40}}>
            <Ionicons name="location" size={70} color='rgba(0,0,0,0.5)' />
          </View>
        </TouchableOpacity>
        {
          address ? (
            <View>
              <CustomText style={styles.textSmall} text={splitAddress(address)[0] + "\n" + splitAddress(address)[1]} />
            </View>
          ) : (
            <CustomText style={styles.textSmall} text="No location selected" />
          )
        }

        <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Room Number" />
        <CustomInput
          placeholder="Room Number (Optional)"
          value={roomNumber}
          setValue={setRoomNumber}
          keyboardType="number-pad"
          width={190}
        />

        <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Instructions" />
        <CustomInput
          placeholder="ex. Up the stairs on your right (Optional)"
          value={instructions}
          setValue={setInstructions}
          keyboardType="default"
        />

        <CustomText style={[styles.textNormal, {marginTop: 10}]} font="bold" text="Details" />
        <View style={styles.largeInputContainer}>
          <TextInput
            placeholder="What's happening?"
            value={eventDescription}
            onChangeText={setDescription}
            keyboardType="default"
            maxLength={500}
            numberOfLines={5}
            style={styles.input}
            multiline={true}
            textAlignVertical='top'
          />
        </View>
    
        <CustomButton text="Create" onPress={onSubmitPressed} type="primary"/>
        <View style={{height: 50}} />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  elementsContainer: {
    marginTop: 0,
    alignItems: 'flex-start',
    marginLeft: 30,
  },
  mapStyle: {
    width: 150,
    height: 150,
    borderRadius: 20,
    marginBottom: 20,
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
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    backgroundColor: 'transparent',
    width: '90%',
  },
  textNormal: {
    ...textNormal,
    fontSize: 20,
    marginLeft: 5,
  },
  textSmall: {
    ...textNormal,
    fontSize: 12,
    marginLeft: 5,
  },
});

=======
import React, { useState } from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity, Button, ScrollView } from 'react-native';
// my components
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Header from '../../components/Header';
// backend
import { db } from '../../backend/FirebaseConfig';
// date time picker
import { ref, set } from "firebase/database";
import DateTimePicker from '@react-native-community/datetimepicker';
// maps
import MapView, { Marker } from 'react-native-maps';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

const NewEvent = ({ route, navigation }) => {
  // get club name from previous screen
  const { clubName } = route.params;
    
  // create states for event info
  const [eventName, setName] = useState('');
  const [eventDescription, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [map, setMap] = useState({
    coords: {
      latitude: 33.950001, // starting location for pin, eventually make current location
      longitude: -83.383331,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  });
  const [mapSelected, setMapSelected] = useState(false); // if map is editable
  const [loading, setLoading] = useState(false);

  // datetime picker
  const onDateTimeChange = (event, selectedDateTime) => {
    setDateTime(selectedDateTime);
  };

  // map is editable
  const selectMap = () => {
    setMapSelected(true);
  }
  const backMap = () => {
    setMapSelected(false);
  }

  // submit the form
  const onSubmitPressed = async () => {
    setLoading(true);

    // name and dec must be filled
    if (!eventName || !eventDescription) { // change
      alert("Please enter both name and description.");
      setLoading(false);
      return;
    }
    
    // try to submit the form
    try {
      set(ref(db, 'events/' + eventName), {
        clubName: clubName,
        eventName: eventName,
        eventDescription: eventDescription,
        eventDateTime: dateTime.toLocaleString(),
        eventLocation: map.coords,
      });
  
      navigation.navigate("ClubList"); // change
    } catch (error) {
      console.log(error);
      alert('Club creation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header text='New Event' back navigation={navigation}></Header>
      <ScrollView>
        <View style={styles.elementsContainer}>
          <CustomInput
            placeholder="Event Name"
            value={eventName}
            setValue={setName}
          />

          <DateTimePicker
            testID="dateTimePicker"
            value={dateTime}
            mode={'datetime'}
            is24Hour={true}
            onChange={onDateTimeChange}
          />
        </View>
          
        {!mapSelected ? ( // if map is not editable
          <View style={styles.mapView}>
            <TouchableOpacity style={styles.mapStyle} onPress={selectMap}>
              <MapView
                style={styles.mapStyle}
                region={map.coords}
              >
                <Marker
                  coordinate={map.coords}
                  title={eventName ? eventName : undefined} // doesn't pass if eventName is empty
                />
              </MapView>
            </TouchableOpacity>
            <CustomInput
              placeholder="What's happening?"
              value={eventDescription}
              setValue={setDescription}
            />
            <CustomButton text="Submit" onPress={onSubmitPressed} type="primary"/>
          </View>
        ) : ( // if map is editable
          <View style={styles.biggerMapView}>
            <Button style={styles.backButton} title="Back" onPress={backMap} />
            <View style={styles.biggerMapStyle}>
              <MapView
                style={styles.biggerMapStyle}
                region={map.coords}
              >
                <Marker draggable
                  coordinate={map.coords}
                  title={eventName ? eventName : undefined} // doesn't pass if eventName is empty
                  onDragEnd={(e) => setMap({ coords: e.nativeEvent.coordinate })}
                />
              </MapView>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  elementsContainer: {
    marginTop: 50,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: title,
  textNormal: {
    ...textNormal,
    marginTop: 20,
  },
  mapView: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'top',
  },
  mapStyle: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  biggerMapView: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  biggerMapStyle: {
    width: 300,
    height: 300,
    borderRadius: 20,
  },
  backButton: {
    flex: 1,
    alignItems: 'center',
  },
});

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default NewEvent;