import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import { Overlay } from 'react-native-elements';
// my components
import Header from '../../components/Header';
import UpcomingEvents from '../../components/event/UpcomingEvents';
// calendar
import { LocaleConfig, Calendar } from 'react-native-calendars';
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// fonts
import { title } from '../../styles/FontStyles';
import FilterList from '../../components/FilterList';
// styles
import { Colors } from '../../styles/Colors';

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

LocaleConfig.locales['eng'] = {
  monthNames: [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  today: "Today",
};

LocaleConfig.defaultLocale = 'eng';

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

  const formatDate = (dateTime) => {
    // reformat date to form 'YYYY-MM-DD'
    const formattedYear = dateTime.substring(dateTime.indexOf(',') - 4, dateTime.indexOf(','));
    let formattedMonth = dateTime.substring(0, dateTime.indexOf('/'));
    if (formattedMonth.length == 1) {
      formattedMonth = '0' + formattedMonth;
    }
    let formattedDay = dateTime.substring(dateTime.indexOf('/') + 1, 10).substring(0, dateTime.indexOf('/'));
    if (formattedDay.length == 1) {
      formattedDay = '0' + formattedDay;
    }
    return formattedYear + '-' + formattedMonth + '-' + formattedDay;
  }

  // filter for events
  const filterFunct = (event) => {
    
    // filter by day of the week
    if (daySelected.length > 0) {
      const filteredDays = daySelected.map((day) => { return day - 1; });
      
      // reformat date to form 'YYYY-MM-DD'
      const eventDate = new Date(formatDate(event.eventDateTime));
      if (!filteredDays.includes(eventDate.getUTCDay())) {
        return false;
      }
    }

    // filter by clubs
    if (clubSelected.length > 0) {
      const clubNames = [];
      // add clubSelected with matching keys to clubNames
      clubSelected.forEach((clubNum) => { 
        clubNames.push(clubList[clubList.findIndex((clubObj) => clubObj.key == clubNum)].value);
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
    
    // add dates to marked dates
    if (markedDates[formatDate(event.eventDateTime)] == null) {
      markedDates[formatDate(event.eventDateTime)] = {
        selected: true, 
        marked: true, 
        selectedColor: Colors.red,
      };
    }
  });

  return (
    <View style={styles.container}>
      <Header text='Calendar'></Header>
      <View style={styles.filterButtonView}>
        <Button title="Filter" onPress={toggleOverlay} />
      </View>
      <View style={styles.calendarContainer}>
        <Calendar
          current={selected}
          markingType='multi-dot'
          markedDates={markedDates}
          theme={{
            calendarBackground: Colors.white,
            textSectionTitleColor: Colors.red,
            todayTextColor: Colors.red,
            dayTextColor: Colors.black,
            textDisabledColor: Colors.gray,
            arrowColor: Colors.red,
            fontFamily: 'nunito-regular',
          }}
          onDayPress={(day) => console.warn(`${day.dateString} pressed`)}
        />
      </View>
      <ScrollView style={styles.clubCategories}>
        <UpcomingEvents filter={filterFunct} navigation={navigation} />
      </ScrollView>
      <Overlay overlayStyle={styles.filterPopUp} isVisible={visible} onBackdropPress={toggleOverlay}>

          <FilterList items={daysOfTheWeek} setter={setSelectedDay} selected={daySelected} text='Days of the Week' />
          <FilterList items={clubList} setter={setSelectedClub} selected={clubSelected} text='Clubs'  />

      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  clubCategories: {

  },
  addClubButton: {
    bottom: 0,
    right: 0,
    padding: 20,
    position: 'absolute',
  },
  filterPopUp: {
    width: '80%',
    padding: 30,
    borderRadius: 20,
  },
  filterButtonView: {
    position: 'absolute',
    top: 60,
    right: 30,
  },
  calendarContainer: {
    paddingHorizontal: 0,
  },
  title: title,
});

export default CalendarScreen;