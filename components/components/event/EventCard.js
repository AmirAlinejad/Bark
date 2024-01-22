import React from 'react';
// react native components
import { View, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
// my components
import CustomText from '../CustomText';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

// club card displayed on the club list screen
const EventCard = ({ onPress, name, description, date, time}) => { // description and time are not used yet
  
  return (
    <Card style={styles.eventCard} onPress={onPress}>   
      <View style={styles.container}>
        <CustomText style={[styles.textNormal, {flex: 1, fontWeight: 'bold'}]} text={date} />
        <CustomText style={[styles.textNormal, {flex: 1}]} text={name} />
      </View>   
    </Card>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    margin: 10,
    padding: 10,
    paddingLeft: 20,
    backgroundColor: '#ECF0F1',
    borderRadius: 10,
    shadowColor: '#0010',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    width: 250,
  },
  container: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: title,
  textNormal: textNormal,
});

export default EventCard;