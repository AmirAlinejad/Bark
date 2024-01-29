import React from 'react';
// react native components
import { View, StyleSheet } from 'react-native';
// my components
import CustomText from '../CustomText';
// fonts
import { textNormal, title} from '../../styles/FontStyles';
// style
import { Colors } from '../../styles/Colors';

// club card displayed on the club list screen
const EventCard = ({ onPress, name, description, date, time}) => { // description and time are not used yet
  
  return (
    <View style={styles.eventCard} onPress={onPress}>   
      <View style={styles.container}>

        <CustomText style={[styles.textNormal]} text={name} font='bold' />
        <CustomText style={[styles.textNormal, {marginRight: 10}]} text={date} />

      </View>   
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    width: 340,
    margin: 10,
    padding: 10,
    paddingLeft: 20,
    backgroundColor: Colors.lightRed,
    borderRadius: 15,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
  },
  container: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    ...title,
    color: Colors.white,
  },
  textNormal: 
  {
    ...textNormal,
    color: Colors.black,
  }
});

export default EventCard;