import React from 'react';
// react native components
import { View, StyleSheet } from 'react-native';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton} from 'react-native-paper';
// my components
import Header from '../../components/Header';
// maps
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
// fonts
import { textNormal, title} from '../../styles/fontstyles';

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
      <View style={{marginTop: 30, flex: 1}}>
        <IconButton
          onPress={onBackPress}
          icon="arrow-left"
          size={30}
        />
      </View>
      <Header text={name} back navigation={navigation}></Header>

      <View style={styles.eventContent}>
            <Text style={[styles.title, {textAlign: 'center'}]}>{name}</Text>
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
export default EventScreen;