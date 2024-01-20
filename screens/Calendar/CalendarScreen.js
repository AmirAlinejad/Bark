import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import { Overlay } from 'react-native-elements';
// calendar
import {Calendar} from 'react-native-calendars';
// multiple select list
import MultiSelect from 'react-native-multiple-select';
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// my components
import Header from '../../components/Header';
import UpcomingEvents from '../../components/events/UpcomingEvents';
// macros
import { clubCategories } from '../../macros/macros';
// fonts
import { title } from '../../styles/fontstyles';

const daysOfTheWeek = [{
    id: 1, name: 'Sunday'
  }, {
    id: 2, name: 'Monday'
  }, {
    id: 3, name: 'Tuesday'
  }, {
    id: 4, name: 'Wednesday'
  }, {
    id: 5, name: 'Thursday'
  }, {
    id: 6, name: 'Friday',
  }, {
    id: 7, name: 'Saturday'
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

  // create sectioned list of clubNames based on clubs
  console.log(clubData);
  clubList = [];
  clubData.forEach((club, index) => {clubList.push({
    key: index + 1,
    name: club.clubName
  })});
  console.log(clubList);

  // state for selected date
  const [selected, setSelected] = useState(new Date().toISOString().slice(0,10));
  // state for overlay
  const [visible, setVisible] = useState(false);
  // overlay filters
  const [daySelected, setSelectedDay] = React.useState([1,2,3,4,5,6,7]);
  const [clubSelected, setSelectedClub] = React.useState([]);
  const [categoriesSelected, setCategories] = React.useState([]);

  // toggle overlay
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  // filter for events
  const filterFunct = (event) => {
    
    // filter by day of the week
    if (daySelected.length > 0) {
      const filteredDays = daySelected.map((day) => { return day - 1; });
      const filteredDateTime = event.eventDateTime.substring(event.eventDateTime.indexOf(',') - 4, event.eventDateTime.indexOf(',')) + '-' + event.eventDateTime.substring(0, event.eventDateTime.indexOf('/')) + '-' + event.eventDateTime.substring(event.eventDateTime.indexOf('/') + 1, 10).substring(0, event.eventDateTime.indexOf('/')); // add year, month, day
      const eventDate = new Date(filteredDateTime);
      if (!filteredDays.includes(eventDate.getUTCDay())) {
        return false;
      }
    }

    // filter by clubs
    console.log(clubSelected);
    if (clubSelected.length > 0) {
      // reformat clubSelected to clubNames
      const clubNames = [];
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
    console.log(event.eventDateTime);
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
    
    console.log(formattedDate);

    // add dates to marked dates
    if (markedDates[formattedDate] == null) {
      markedDates[formattedDate] = {selected: true, marked: true, selectedColor: '#319e8e'};
    }
  });
  console.log(markedDates);

  return (
    <View style={styles.container}>
      <Header text='Calendar'></Header>
      <Button title="Filter" onPress={toggleOverlay} />
      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        <View style={styles.filterPopUp}>
          <MultiSelect
            hideTags
            items={daysOfTheWeek}
            uniqueKey="id"
            ref={(component) => { this.multiSelect = component }}
            onSelectedItemsChange={setSelectedDay}
            selectedItems={daySelected}
            selectText="Pick Items"
            searchInputPlaceholderText="Search Items..."
            onChangeInput={ (text)=> console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor="#CCC"
            submitButtonText="Submit"
          />

          <MultiSelect
            hideTags
            items={clubList}
            uniqueKey="key"
            ref={(component) => { this.multiSelect = component }}
            onSelectedItemsChange={setSelectedClub}
            selectedItems={clubSelected}
            selectText="Pick Items"
            searchInputPlaceholderText="Search Items..."
            onChangeInput={ (text)=> console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor="#CCC"
            submitButtonText="Submit"
          />
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
  filterPopUp: {
    width: 300,
    height: 400,
    padding: 20,
  },
  title: title,
});

export default CalendarScreen;