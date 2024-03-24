<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// my components
import CustomText from '../CustomText';
// fonts
import { textNormal, title} from '../../styles/FontStyles';
// macros
import { clubCategories } from '../../macros/macros';
// backend functions
import { db } from '../../backend/FirebaseConfig';
import { ref, get } from "firebase/database";
// time functions
import { timeToString } from '../../functions/timeFunctions';
// icons
import { Ionicons } from '@expo/vector-icons';
// style
import { Colors } from '../../styles/Colors';

// club card displayed on the club list screen
const EventCard = ({ onPress, name, time, clubId }) => { // description and time are not used yet

  // state for club data
  const [ clubData, setClubData ] = useState(null);

  useEffect(() => {
    // get data for club
    const clubRef = ref(db, `clubs/${clubId}`);
    get(clubRef).then((snapshot) => {
      if (snapshot.exists()) {
        setClubData(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }, []);

  let iconData = [];
  if (clubData) {
    // get the category icons for the club
    clubData.clubCategories.map((category) => {
      clubCategories.map((item) => {
        if (item.value == category) {
          iconData.push({
            icon: item.icon, 
            color: item.color
          });
        }
      });
    });
  }
  console.log(iconData);

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>   
      <View style={{flexDirection: 'row', gap: 15}}>
        <View>
        {
          iconData.map((item, index) => {
            return (
              <View style={[styles.iconCircle, {backgroundColor: item.color}]}>
                <Ionicons key={index} name={item.icon} size={24} color={Colors.white} />
              </View>
            )
          })
        }
        </View>
        <CustomText style={[styles.textNormal, { fontSize: 20 }]} text={name} font='bold' />
      </View>
      <CustomText style={[styles.textNormal, { marginRight: 10 }]} text={timeToString(time)} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    width: 350,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 50,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.lightGray,
    marginBottom: 10,
  },
  title: {
    ...title,
    color: Colors.white,
  },
  textNormal: 
  {
    ...textNormal,
    color: Colors.black,
    marginTop: 5,
  }
});

=======
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

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default EventCard;