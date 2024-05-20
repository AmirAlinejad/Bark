import React, { useState } from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// my components
import CustomButton from '../../components/buttons/CustomButton';
// maps
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// icons
import { Ionicons } from '@expo/vector-icons';
// styles
import { Colors } from '../../styles/Colors';
// initialize geocoder
//Geocoder.init('AIzaSyAoX4MTi2eAw2b_W3RzA35Cy5yjpwQYV3E');

const MapPicker = ({ route, navigation }) => {
  // get club name from previous screen
  const { event, fromEdit } = route.params;
  // create states for event info
  //const [myLocation, setLocation] = useState(event.location);
  const [myAddress, setAddress] = useState(event.address); // address of the event

  // submit the form
  const onSubmitPressed = async () => {
    // create event with updated location and address
    const newEvent = {
      ...event,
      //location: myLocation,
      address: myAddress,
    };
    if (fromEdit) {
      // go back to edit event screen
      navigation.navigate('EditEvent', { 
        event: newEvent,
      });
      return;
    } else {
      // go back to new event screen
      navigation.navigate('NewEvent', { 
        event: newEvent,
        
        clubId: event.clubId,
        clubName: event.clubName,
        clubCategories: event.categories,
        fromMap: true,
      });
    }
  }

  // select a location from autocomplete
  const onLocationSelected = (data, details = null) => {
    // 'details' is provided when fetchDetails = true
    setAddress(data.description);
    console.log(data.description);

    /*// geo code the address
    Geocoder.from(data.description)
      .then(json => {
      var location = json.results[0].geometry.location;
      setLocation({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
      });
      console.log(location);
      })
      .catch(error => console.warn(error));

    console.log(data, details);*/
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onSubmitPressed}>
        <Ionicons name="chevron-back" size={30} color={Colors.black} />
      </TouchableOpacity>
      {/*<MapView
        style={styles.biggerMapStyle}
        region={myLocation}
      > 
        <Marker coordinate={myLocation} />
      </MapView>*/}
      <GooglePlacesAutocomplete
        placeholder='Where is the event?'
        styles={styles.googleAutocomplete}
        onPress={onLocationSelected}
        query={{
          key: 'AIzaSyDbtwDnxvz_M7N8UytcICGgkwpsiY4k72Y',
          language: 'en',
        }}
      />
      <View style={styles.submitButton}>
        <CustomButton text="Submit" onPress={onSubmitPressed} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  biggerMapStyle: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  googleAutocomplete: {
    container: {
      flex: 1,
      marginTop: 70,
    },
    textInputContainer: {
      borderBottomWidth: 1,
      borderColor: Colors.inputBorder,
      paddingBottom: 10,
    },
    textInput: {
      marginLeft: 60, 
      marginRight: 20, 
      height: 30,
      color: '#5d5d5d',
      fontSize: 18,
      textAlignVertical: 'center',
    },
    predefinedPlacesDescription: {
      color: '#1faadb',
    },
    listView: {
      marginRight: 20,
    },
    separator: {
      backgroundColor: '#e0e0e0',
      height: 1,
      marginHorizontal: 20,
    },
    poweredContainer: {
      display: 'none',
    },
  },
  backButton: {
    flex: 1,
    position: 'absolute',
    top: 70,
    left: 25,
    zIndex: 1,
  },
  submitButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: 100,
  },
});

export default MapPicker;