import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Overlay } from 'react-native-elements';
// calendar
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
// multiple select list
import { MultipleSelectList } from 'react-native-dropdown-select-list'
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// my components
import ClubCategory from '../../components/clubs/ClubCategory';
import Header from '../../components/Header';
import UpcomingEvents from '../../components/events/UpcomingEvents';
// macros
import { clubCategories } from '../../macros/macros';
// fonts
import { title } from '../../styles/FontStyles';

// club list screen
const CalendarScreen = ({ navigation }) => {
  // state for club data
  const [eventData, setEventData] = useState([]);
  // state for selected date
  const [selected, setSelected] = useState(new Date().toISOString().slice(0,10));
  // state for overlay
  const [visible, setVisible] = useState(false);

  const toggleOverlay = () => {
    setVisible(!visible);
  };

  const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  const filterFunct = (event) => {
    // maybe change
    const formattedDate = event.eventDateTime.substring(event.eventDateTime.indexOf(',') - 4, event.eventDateTime.indexOf(',')) + '-' + event.eventDateTime.substring(0, event.eventDateTime.indexOf('/')) + '-' + event.eventDateTime.substring(event.eventDateTime.indexOf('/') + 1, 10).substring(0, event.eventDateTime.indexOf('/')); // add year, month, day
    return formattedDate == selected;
  }

  return (
    <View style={styles.container}>
      <Header back></Header>
      <Button title="Filter" onPress={toggleOverlay} />
      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        <View>
          <MultipleSelectList
            items={daysOfTheWeek}
            selectedItems={daysOfTheWeek}
          />
        </View>
      </Overlay>
      <Calendar
        onDayPress={day => {
            setSelected(day.dateString);
        }}
        markedDates={{
            [selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
        }}
      />
      <ScrollView style={styles.clubCategories}>
      { 
        <UpcomingEvents filter={filterFunct} navigation={navigation} />
      }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  clubCategories: {
    marginLeft: 20,
  },
  addClubButton: {
    bottom: 0,
    right: 0,
    padding: 20,
    position: 'absolute',
  },
  title: title,
});

export default CalendarScreen;