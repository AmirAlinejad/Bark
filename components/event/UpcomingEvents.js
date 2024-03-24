<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
// functions
import { getSetAllEventsData } from '../../functions/backendFunctions';
// my components
import EventCard from './EventCard';
import CustomText from '../CustomText';
// icons
import IonicIcons from 'react-native-vector-icons/Ionicons';
// colors
import { Colors } from '../../styles/Colors';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

const UpcomingEvents = ({ filteredEvents, navigation }) => {

  // state for event data
  const [eventData, setEventData] = useState([]);

  // get data from firebase and convert to array
  useEffect (() => {
    getSetAllEventsData(setEventData);

  }, []);

  // sort by time
  filteredEvents.sort((a, b) => {
    return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
  });

  // categorize by date
  let categorizedEvents = {};
  filteredEvents.forEach((event) => {
    // change date to format 'Jan 01, 2022'
    let date = new Date(event.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!categorizedEvents[date]) {
      categorizedEvents[date] = [];
    }
    categorizedEvents[date].push(event);
  });

  return ( 
    <View style={styles.eventsContent}>
      <View style={{width: '100%'}}>
      {
        // map through the dates
        categorizedEvents && Object.keys(categorizedEvents).map((date, index) => {
          return (
            <View key={index} style={{width: '100%'}}>
              <CustomText style={styles.dateTitle} text={date} font='bold'/>
              {
                // map through the event data
                categorizedEvents[date].map((item, index) => {
                  const onPress = () => {
                    // Navigate to the event screen
                    navigation.navigate("EventScreen", {
                      key: index,
                      event: item,
                    });
                  }
                  return (
                    <View style={{width: '100%'}} key={index}>
                      <View style={styles.separator} />
                      <EventCard 
                        key={index}
                        onPress={onPress} 
                        name={item.name}
                        description={item.description} 
                        date={item.date}
                        time={item.time}
                        clubId={item.clubId}
                      />
                    </View>
                  )
                })
              }
            </View>
          )
        })
      }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventsContent: {
    flex: 1,
    alignItems: 'flex-start',
    width: '100%',
  },
  separator: {
    height: 1,
    width: '120%',
    marginLeft: -20,
    backgroundColor: Colors.lightGray,
  },
  title: title,
  textNormal: textNormal,
  dateTitle: {
      ...title,
      fontSize: 20,
      color: Colors.darkGray,
      marginLeft: 0,
    },
});

=======
import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet } from 'react-native';
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// my components
import EventCard from './EventCard';
import CustomText from '../CustomText';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

const UpcomingEvents = ({ filter, navigation }) => {

  // state for event data
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
      <CustomText style={[styles.title, {textAlign: 'center'}]} text='Upcoming Events' font='bold'/>
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

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default UpcomingEvents;