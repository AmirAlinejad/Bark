import React from 'react';
// react native components
import { View, StyleSheet } from 'react-native';
// my components
import EventCard from './EventCard';
import CustomText from '../display/CustomText';
// icons
import Ionicon from 'react-native-vector-icons/Ionicons';
// macros
import { CLUBCATEGORIES } from '../../macros/macros';
// colors
import { Colors } from '../../styles/Colors';

const UpcomingEvents = ({ filteredEvents, screenName, navigation }) => {

  // sort events by time
  let sortedEvents = [];
  if (filteredEvents != []) {
    sortedEvents = filteredEvents.sort((a, b) => {
      return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
    });
  }
  console.log(sortedEvents);

  // categorize events by date
  let categorizedEvents = {};
  sortedEvents.forEach((event) => {
    // change date to format 'Jan 01, 2022'
    let date = new Date(event.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // add event to the date
    if (!categorizedEvents[date]) {
      categorizedEvents[date] = [];
    }
    categorizedEvents[date].push(event);
  });
  console.log(categorizedEvents);

  return ( 
    <View style={styles.eventsContent}>
      <View style={{width: '100%'}}>
      {categorizedEvents && 
        // map through the dates
        categorizedEvents && Object.keys(categorizedEvents).map((date, index) => {
          return (
            <View key={index} style={{width: '100%'}}>
              <CustomText style={styles.dateTitle} text={date} font='bold'/>
              {
                // map through the event data for each date
                categorizedEvents[date].map((item, index) => {

                  const onPress = () => {
                    // Navigate to the event screen
                    navigation.navigate("EventScreen", {
                      event: item,
                      fromScreen: screenName? screenName : null,
                    });
                  }

                  // get colors and icon based on first club category
                  let icon = null;
                  let iconColor = null;
                  CLUBCATEGORIES.forEach((category) => {
                    if (category.value == item.categories[0]) {
                      icon = category.icon;
                      iconColor = category.color;
                    }
                  });

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
                        icon={icon}
                        iconColor={iconColor}
                      />
                    </View>
                  )
                })
              }
            </View>
          )
        })
      } 
      {sortedEvents.length == 0 &&
        <View style ={styles.message} >
          <Ionicon name="calendar" size={100} color={Colors.lightGray} />
          <CustomText text="No upcoming events." font='bold' style={styles.messageText}/>
        </View>
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
    backgroundColor: Colors.lightGray,
  },
  dateTitle: {
    fontSize: 20,
    color: Colors.darkGray,
    marginBottom: 10,
  },
  message: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 20,
    color: Colors.darkGray,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default UpcomingEvents;