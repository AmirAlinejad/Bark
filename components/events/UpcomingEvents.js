import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// my components
import EventCard from './EventCard';
// fonts
import { textNormal, title} from '../../styles/fontstyles';

const UpcomingEvents = ({ filter, navigation }) => {

  // state for club data
  const [eventData, setEventData] = useState([]);

  // get data from firebase
  useEffect (() => {
    const starCountRef = ref(db, 'events/');
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const newEvents = Object.keys(data).map(key => ({
        id:key, 
        ...data[key]
      }));
      console.log(newEvents);
      setEventData(newEvents);
    })
  }, [])

  // apply filter to event
  filteredEvents = eventData.filter(filter);

  return ( 
    <View style={styles.eventsContent}>
        <Text style={[styles.title, {textAlign: 'center'}]}>Upcoming Events</Text>
        {
            // map through the club data and display each club
            filteredEvents.map((item, index) => {

            const onPress = () => {
            // Navigate to the event screen
            navigation.navigate("EventScreen", {
                key: index,
                name: item.eventName,
                description: item.eventDescription,
                datetime: item.eventDateTime,
                location: item.eventLocation,
            });
            }

            return (
            <View key={index}>
                <EventCard 
                onPress={onPress} 
                name={item.eventName}
                description={item.eventDescription} 
                date={item.eventDateTime.substring(0, item.eventDateTime.indexOf(','))} // just gives date
                />
            </View>
            )
            })
        }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  clubContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicInfo: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContent: {
    marginBottom: 20,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  avatarContainer: {
    marginTop: 50,
  },
  eventsContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  addEventButton: {
    bottom: 0,
    right: 0,
    padding: 20,
    position: 'absolute',
  },
  title: title,
  textNoraml: textNormal,
});

export default UpcomingEvents;