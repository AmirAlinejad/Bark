import React, { useState, } from "react";
// react native components
import { View, StyleSheet } from "react-native";
// my components
import CustomButton from "../../components/buttons/CustomButton";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
// styles
import { useTheme } from "@react-navigation/native";
// initialize geocoder
//Geocoder.init('AIzaSyAoX4MTi2eAw2b_W3RzA35Cy5yjpwQYV3E');

const MapPicker = ({ route, navigation }) => {
  const { colors } = useTheme();
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
      navigation.navigate("Edit Event", {
        event: newEvent,
        fromMap: true,
      });
      return;
    } else {
      // go back to new event screen
      navigation.navigate("NewEvent", {
        event: newEvent,
        clubId: event.clubId,
        clubName: event.clubName,
        categories: event.categories,
        fromMap: true,
      });
    }
  };

  // select a location from autocomplete
  const onLocationSelected = (data, details = null) => {
    // 'details' is provided when fetchDetails = true
    setAddress(data.description);
    console.log("description: ".data.description);

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
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/*<MapView
        style={styles.biggerMapStyle}
        region={myLocation}
      > 
        <Marker coordinate={myLocation} />
      </MapView>*/}
      <GooglePlacesAutocomplete
        placeholder="Where is the event?"
        styles={{
          ...styles.googleAutocomplete,
          textInput: {
            height: 30,
            fontSize: 16,
            textAlignVertical: "center",
            backgroundColor: "transparent",
            borderRadius: 20,
            color: colors.text,
          },
          textInputContainer: {
            margin: 20,
            paddingTop: 4,
            backgroundColor: "transparent",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.inputBorder,
          },
          listView: {
            borderWidth: 1,
            borderRadius: 12,
            borderColor: colors.inputBorder,
            backgroundColor: colors.card,
            marginHorizontal: 20,
            maxHeight: 268,
          },
          separator: {
            backgroundColor: colors.inputBorder,
            height: 1,
          },
          description: {
            color: colors.text,
            backgroundColor: colors.card,
          },
          poweredContainer: {
            display: "none",
          },
          row: {
            padding: 10,
            height: 40,
            backgroundColor: colors.card,
          },
        }}
        onPress={(data, details = null) => {
          console.log(data, details);
          setAddress(data.description);
        }}
        query={{
          key: "AIzaSyA3tXNlmAh0UWxm-HKH1KlIQcIxi7BqdbU",
          language: "en",
        }}
      />
      
      <View style={styles.submitButton}>
        <CustomButton text="Submit" onPress={onSubmitPressed} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // biggerMapStyle: {
  //   flex: 1,
  //   width: '100%',
  //   height: '100%',
  // },
  googleAutocomplete: {
    container: {
      width: "100%",
      marginTop: "35%",
      zIndex: 1000,
    },
  },
  backButton: {
    flex: 1,
    position: "absolute",
    top: 70,
    left: 25,
    zIndex: 1,
  },
  submitButton: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 50,
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    height: 100,
  },
});

export default MapPicker;
