import React from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton} from 'react-native-paper';
// my components
import Header from '../../components/Header';
// maps
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

const EventScreen = ({ route, navigation }) => {

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
      <Header text={name} back navigation={navigation}></Header>

      <ScrollView style={styles.eventContent}>
        <View style={{alignItems: 'center'}}>
          <Text style={[styles.title, {textAlign: 'center'}]}>{dateStr}, {timeStr}</Text>

          <Text style={[styles.textNormal, {textAlign: 'center', marginBottom: 20}]}>{description}</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  eventContent: {
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

export default EventScreen;