import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import { Overlay } from 'react-native-elements';
// my components
import Header from '../../components/Header';
import UpcomingEvents from '../../components/event/UpcomingEvents';
// calendar
import { Calendar } from 'react-native-calendars';
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// fonts
import { title } from '../../styles/FontStyles';
import FilterList from '../../components/FilterList';

// list data for days of the week filter
const daysOfTheWeek = [{
    key: 1, value: 'Sunday'
  }, {
    key: 2, value: 'Monday'
  }, {
    key: 3, value: 'Tuesday'
  }, {
    key: 4, value: 'Wednesday'
  }, {
    key: 5, value: 'Thursday'
  }, {
    key: 6, value: 'Friday',
  }, {
    key: 7, value: 'Saturday'
  }
];

// club list screen
const CalendarScreen = ({ navigation }) => {

  // state for event data
  const [eventData, setEventData] = useState([]);
  // state for club data
  const [clubData, setClubData] = useState([]);

  // get data from firebase
  useEffect (() => {
    // get event data
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

    // get club data
    const starCountRef2 = ref(db, 'clubs/');
    onValue(starCountRef2, (snapshot) => {
      const data = snapshot.val();
      const newClubs = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      console.log(newClubs);
      setClubData(newClubs);
    })
  }, [])

  // create list of clubNames based on clubData
  const clubList = [];
  clubData.forEach((club, index) => {clubList.push({
    key: index + 1,
    value: club.clubName
  })});

  // state for selected date
  const [selected, setSelected] = useState(new Date().toISOString().slice(0,10));
  // state for overlay
  const [visible, setVisible] = useState(false);
  // overlay filters
  const [daySelected, setSelectedDay] = React.useState([1,2,3,4,5,6,7]);
  const [clubSelected, setSelectedClub] = React.useState([]);

  // toggle overlay
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  // filter for events
  const filterFunct = (event) => {
    
    // filter by day of the week
    if (daySelected.length > 0) {
      const filteredDays = daySelected.map((day) => { return day - 1; });
      // may have to add code back in for filter to work
      const eventDate = new Date(event.eventDateTime);
      if (!filteredDays.includes(eventDate.getUTCDay())) {
        return false;
      }
    }

    // filter by clubs
    if (clubSelected.length > 0) {
      const clubNames = [];
      // add clubSelected with matching keys to clubNames
      clubSelected.forEach((clubNum) => { 
        clubNames.push(clubList[clubList.findIndex((clubObj) => clubObj.key == clubNum)].name);
      });
      if (!clubNames.includes(event.clubName)) {
        return false;
      }
    }

    return true;
  }

  // filtered events
  const filteredEvents = eventData.filter(filterFunct);

  // add filtered events to marked dates
  const markedDates = {};
  filteredEvents.forEach((event) => {
    // reformat date to form 'YYYY-MM-DD'
    const formattedYear = event.eventDateTime.substring(event.eventDateTime.indexOf(',') - 4, event.eventDateTime.indexOf(','));
    let formattedMonth = event.eventDateTime.substring(0, event.eventDateTime.indexOf('/'));
    if (formattedMonth.length == 1) {
      formattedMonth = '0' + formattedMonth;
    }
    let formattedDay = event.eventDateTime.substring(event.eventDateTime.indexOf('/') + 1, 10).substring(0, event.eventDateTime.indexOf('/'));
    if (formattedDay.length == 1) {
      formattedDay = '0' + formattedDay;
    }
    const formattedDate = formattedYear + '-' + formattedMonth + '-' + formattedDay;

    // add dates to marked dates
    if (markedDates[formattedDate] == null) {
      markedDates[formattedDate] = {
        selected: true, 
        marked: true, 
        selectedColor: '#319e8e',
      };
    }
  });

  return (
    <View style={styles.container}>
      <Header text='Calendar'></Header>
      <Button title="Filter" onPress={toggleOverlay} />
      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        <View style={styles.filterPopUp}>

          <FilterList items={daysOfTheWeek} setter={setSelectedDay} selected={daySelected} text='Days of the Week' />
          <FilterList items={clubList} etter={setSelectedClub} selected={clubSelected} text='Clubs'  />
        </View>
      </Overlay>
      <Calendar
          current={selected}
          markingType='multi-dot'
          markedDates={markedDates}
          theme={{
            textInactiveColor: '#a68a9f',
            textSectionTitleDisabledColor: 'grey',
            textSectionTitleColor: '#319e8e',
            arrowColor: '#319e8e'
          }}
          onDayPress={(day) => console.warn(`${day.dateString} pressed`)}
        />
      <ScrollView style={styles.clubCategories}>
        <UpcomingEvents filter={filterFunct} navigation={navigation} />
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
  filterPopUp: {
    width: 300,
    height: 400,
    padding: 20,
  },
  title: title,
});

export default CalendarScreen;