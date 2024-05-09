import React from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// my components
import CustomText from '../display/CustomText';
// time functions
import { timeToString } from '../../functions/timeFunctions';
// icons
import { Ionicons } from '@expo/vector-icons';
// style
import { Colors } from '../../styles/Colors';

// club card displayed on the club list screen
const EventCard = ({ name, time, icon, iconColor, screenName }) => { // description and time are not used yet

  const onPress = () => {
    // Navigate to the event screen
    navigation.navigate("EventScreen", {
      event: item,
      fromScreen: screenName? screenName : null,
    });
  }

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>   
      <View style={{flexDirection: 'row', gap: 15}}>
        
        <View style={[styles.iconCircle, {backgroundColor: iconColor}]}>
          <Ionicons name={icon} size={24} color={Colors.white} />
        </View>

        <View style={styles.cardText}>
          <CustomText style={[styles.textNormal, {width: '70%'}]} text={name} font='bold' numberOfLines={1}/>
          <View style={{width: 20}}></View>
          <CustomText style={styles.timeText} text={timeToString(time)} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 20,
    borderRadius: 20,
    // shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
  },
  cardText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginRight: 10,
    marginTop: 5,
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.lightGray,
    marginBottom: 10,
  },
  textNormal: {
    fontSize: 16,
    marginTop: 5,
  },
  timeText: {
    marginTop: 5,
    fontSize: 16,
    color: Colors.darkGray,
  },
});

export default EventCard;