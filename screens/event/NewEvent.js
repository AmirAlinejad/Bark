import React, { useState } from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
// my components
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
// backend
import { db } from '../../backend/FirebaseConfig';
// date time picker
import { ref, set } from "firebase/database";
import DateTimePicker from '@react-native-community/datetimepicker';
// maps
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
// fonts
import { textNormal, title} from '../../styles/fontstyles';

const NewEvent = ({ route, navigation }) => {

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

  // go back to club screen
  const onBackPress = () => {
    navigation.goBack();
  }

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
      set(ref(db, 'clubs/' + clubName + '/events/' + eventName), {
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
      <View style={{marginTop: 30}}>
        <IconButton
          onPress={onBackPress}
          icon="arrow-left"
          size={30}
        />
      </View>
      <View style={styles.elementsContainer}>
        <Text style={styles.title}> Create a new Event</Text>
        <CustomInput
          placeholder="Event Name"
          value={eventName}
          setValue={setName}
        />
        <CustomInput
          placeholder="Event Description"
          value={eventDescription}
          setValue={setDescription}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#D3D3D3',
    gap: 10,
  },
  elementsContainer: {
    flex: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
    gap: 10,
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
  },
  biggerMapView: {
    flex: 2,
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

export default NewEvent;