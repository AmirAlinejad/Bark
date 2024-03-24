import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, Button, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import SwipeUpDownModal from 'react-native-swipe-modal-up-down';
// my components
import Header from '../../components/Header';
import UpcomingEvents from '../../components/event/UpcomingEvents';
import ToggleButton from '../../components/buttons/ToggleButton';
import CustomText from '../../components/CustomText';
import FilterList from '../../components/input/FilterList';
// calendar
import { LocaleConfig, Calendar } from 'react-native-calendars';
// multi slider
import MultiSlider from '@ptomasroos/react-native-multi-slider';
// functions
import { getSetAllEventsData, getSetUserData, getSetAllClubsData } from '../../functions/backendFunctions';
import { formatDate, formatTime } from '../../functions/timeFunctions';
// macros
import { clubCategories } from '../../macros/macros';
// fonts
import { title, textNormal } from '../../styles/FontStyles';
// icons
import { Ionicons } from '@expo/vector-icons';
// styles
import { Colors } from '../../styles/Colors';
// scroll view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// list data for days of the week filter
const daysOfTheWeek = [{
    key: 1, value: 'Sun',
  }, {
    key: 2, value: 'Mon',
  }, {
    key: 3, value: 'Tue',
  }, {
    key: 4, value: 'Wed',
  }, {
    key: 5, value: 'Thu',
  }, {
    key: 6, value: 'Fri',
  }, {
    key: 7, value: 'Sat',
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
const CalendarScreen = ({ route, navigation }) => {
  // get props
  const calendarSettingProp = 'myClubs';
  const clubsProp = [];
  if (route) {
    calendarSettingProp = route.params.calendarSettingProp;
    clubsProp = route.params.clubsProp;
  }

  // state for loading
  const [loading, setLoading] = useState(true);
  // state for events data
  const [eventData, setEventData] = useState([]);
  // state for user data
  const [userData, setUserData] = useState(null);
  // state for clubs data
  const [clubsData, setClubsData] = useState([]);

  // state for calendar
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [specificDateSelected, setSpecificDateSelected] = useState(false); // whether a specific date is selected or not
  // state for filter overlay
  const [visible, setVisible] = useState(false);
  let [animateModal, setanimateModal] = useState(false);
  // overlay filters
  const [calendarSetting, setCalendarSetting] = useState('myClubs');
  const [daySelected, setSelectedDay] = React.useState([1,2,3,4,5,6,7]);
  const [myClubsSelected, setMySelectedClubs] = React.useState([]);
  const [clubCategoriesSelected, setClubCategoriesSelected] = React.useState([]);
  const [startEndTime, setStartEndTime] = React.useState([0, 24]);

  // get data from firebase
  useEffect (() => {
    getSetUserData(setUserData, setLoading);

    getSetAllEventsData(setEventData, setLoading);

    getSetAllClubsData(setClubsData, setLoading);

    // set calendar setting
    if (calendarSettingProp) {
      setCalendarSetting(calendarSettingProp);

      // set clubs if right setting
      if (clubsProp) {
        setMySelectedClubs(clubsProp);
      }
    }
  }, []);

  // club list
  let clubList = [];
  if (userData) {
    clubList = Object.keys(userData.clubs).map((id) => {
      return {
        key: id,
        value: userData.clubs[id].clubName,
      }
    });
  }

  // toggle overlay
  const toggleFilter = () => {
    setVisible(!visible);
  };

  // select a specific date
  const selectSpecificDate = (date) => {
    setSelectedDate(date.dateString);
    setSpecificDateSelected(true);
  }

  // filter for events
  const filterFunct = (event) => {
    
    // filter by specific date
    if (specificDateSelected) {
      if (formatDate(event.date) != selectedDate) {
        return false;
      }
    }

    // filter by calendar setting
    if (userData) console.log(userData.clubs);
    console.log(event.clubId);
    console.log(calendarSetting);
    if (calendarSetting == 'newClubs' && userData != null) {
      if (userData.clubs[event.clubId] != null) {
        return false;
      }

      // if not public event
      if (!event.public) {
        return false;
      }
    }
    if (calendarSetting == 'myClubs' && userData != null) {
      if (userData.clubs[event.clubId] == null) {
        return false;
      }
    }
    
    // filter by day of the week
    if (daySelected.length > 0) {
      const filteredDays = daySelected.map((day) => { return day - 1; });
      
      // reformat date to form 'YYYY-MM-DD'
      const eventDate = new Date(formatDate(event.date));
      console.log(formatDate(event.date));
      console.log(eventDate);
      console.log(eventDate.getUTCDay());
      if (!filteredDays.includes(eventDate.getUTCDay())) {
        return false;
      }
    }

    // filter by time of day
    // reformate time to form 'HH:MM:SS'
    const formattedStartTime = startEndTime[0];
    const formattedEndTime = startEndTime[1];
    // don't know if right yet (not sure on format of above)
    console.log(formattedStartTime);
    console.log(formattedEndTime);

    const hour = parseInt(event.time.substring(0, event.time.indexOf(':')));
    console.log(hour);
    if (hour < formattedStartTime || hour > formattedEndTime) {
      return false;
    }

    // filter by my clubs if right setting
    if (calendarSetting == 'myClubs' && myClubsSelected.length > 0 && userData != null) {
      // get clubName from clubID
      const clubName = userData.clubs[event.clubId].clubName;
      console.log(clubName);
      
      // create list of club names from myClubsSelected
      const clubNames = myClubsSelected.map((club) => userData.clubs[club].clubName);

      if (!clubNames.includes(clubName)) {
        return false;
      }
    }

    // filter by club categories if right setting
    if (calendarSetting == 'newClubs' && clubCategoriesSelected.length > 0) {
      // get club categories from clubID
      const clubCategories = clubsData.find((club) => club.id == event.clubId).clubCategories;

      // if event's club's category is not in the selected categories
      if (!clubCategories.some((category) => clubCategoriesSelected.includes(category))) {
        return false;
      }
    }

    // if all filters pass
    return true;
  }

  // filtered events
  const filteredEvents = eventData.filter((event) => filterFunct(event));

  // add filtered events to marked dates
  let markedDates = {};
  filteredEvents.forEach((event) => {
    // reformat date to form 'YYYY-MM-DD'
    const formattedDate = formatDate(event.date);

    // add dates to marked dates (calendar)
    if (markedDates[formattedDate] == null) {
      markedDates[formattedDate] = {
        marked: true, 
      };
    }

    // get dot colors for this event from club categories
    let dotColors = [];
    if (clubsData.length > 0) {
      const thisEventClubCategories = clubsData.find((club) => club.id == event.clubId).clubCategories;
      dotColors = thisEventClubCategories.map((category) => {
        return {
          key: category,
          color: clubCategories.find((item) => item.value == category).color,
        }
      });
    }
    console.log(dotColors);
  
    // add dots with dot color to marked dates if not already there
    if (markedDates[formattedDate].dots == null) {
      // add all dot colors
      markedDates[formattedDate].dots = dotColors.map((dotColor) => {
        return {
          key: dotColor.key,
          color: dotColor.color,
          selectedDotColor: dotColor.color,
        }
      });
    } else {
      // check if dot color is already there
      dotColors.forEach((dotColor) => {
        if (!markedDates[formattedDate].dots.some((item) => item.color == dotColor.color)) {
          markedDates[formattedDate].dots.push({
            key: dotColor.key,
            color: dotColor.color,
            selectedDotColor: dotColor.color,
          })
        }
      });
    }
  });
  // add specific date if selected
  if (specificDateSelected) {
    markedDates = {[selectedDate]: {selected: true, selectedColor: Colors.red, dotColor: Colors.red}};
  }
  console.log(markedDates);
  console.log(selectedDate);

  // format start and end time for slider
  const formatStartEndTime = (time) => {
    let formattedTime = time > 12 ? time - 12 : time;
    formattedTime = time >= 12 ? `${formattedTime} PM` : `${formattedTime} AM`;
    if (time == 0 || time == 24) { 
      formattedTime = '12 AM';
    }

    return formattedTime;
  }

  return (
    <View style={styles.container}>
      <Header text='Calendar'></Header>
      <TouchableOpacity style={styles.filterButtonView} onPress={toggleFilter}>
        <CustomText style={[styles.text, {marginTop: 12, color: Colors.buttonBlue}]} text='Filter' />
        <Ionicons name={visible ? "funnel" : "funnel-outline"} size={30} color={Colors.buttonBlue} />
      </TouchableOpacity>

      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps='always'>
        <View style={styles.calendarContainer} keyboardShouldPersistTaps='always'>
          <Calendar
            keyboardShouldPersistTaps='always'
            current={selectedDate}
            markingType='multi-dot'
            markedDates={markedDates}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: Colors.red,
              todayTextColor: Colors.red,
              dayTextColor: Colors.black,
              textDisabledColor: Colors.gray,
              arrowColor: Colors.red,
              fontFamily: 'nunito-regular',
            }}
            onDayPress={(day) => selectSpecificDate(day)}
          />
        </View>

        <View style={styles.eventsContainer} >
          <UpcomingEvents filteredEvents={filteredEvents} navigation={navigation} />
        </View>
        <View style={{position: "absolute", bottom: -600, left: 0, right: 0, backgroundColor: Colors.white, height: 600}}/>
      </ScrollView>

      {/* filter overlay */}
      <SwipeUpDownModal
        modalVisible={visible} 
        pressToanimate={animateModal}
        onClose={() => {
          setVisible(false);
          setanimateModal(false);
        }}
        ContentModal={
          <View style={styles.modal}>
            <View style={styles.filter}>
              <TouchableWithoutFeedback>
                <View style={{ alignItems: 'center', width: '100%'}}>
                  <View style={styles.bar} />
                </View>
              </TouchableWithoutFeedback>
              
              <KeyboardAwareScrollView 
                contentContainerStyle={{ marginHorizontal: 20, paddingBottom: 20 }}
                extraHeight={400}
              >

                <CustomText style={styles.filterSectionTitle} font="bold" text={`Calendar Settings:`} />
                <View style={styles.toggleButtonRow}>
                  <View style={styles.toggleButtonView} >
                    <ToggleButton
                      text='My Clubs'
                      onPress={() => setCalendarSetting('myClubs')}
                      toggled={calendarSetting == 'myClubs'}
                      toggledCol={Colors.purple}
                      untoggledCol={Colors.gray}
                      icon='people'
                    />
                  </View>
                  <View style={styles.toggleButtonView} >
                    <ToggleButton
                      text='New Clubs'
                      onPress={() => setCalendarSetting('newClubs')}
                      toggled={calendarSetting == 'newClubs'}
                      toggledCol={Colors.blue}
                      untoggledCol={Colors.gray}
                      icon='search'
                    />
                  </View>
                </View>

                <CustomText style={styles.filterSectionTitle} font="bold" text={`Day of the week:`} />
                <View style={styles.toggleButtonRow}>
                { 
                  // create a toggle component for each category
                  daysOfTheWeek.map((day) => {

                    // toggle button to update categories selected
                    const toggleButton = () => {
                      if (daySelected.includes(day.key)) {
                        setSelectedDay(daySelected.filter((item) => item !== day.key));
                      } else {
                        setSelectedDay([...daySelected, day.key]);
                      }
                      setSpecificDateSelected(false);
                      console.log("daySelected: ", daySelected)
                    }

                    return (
                      <View style={styles.toggleButtonView} >
                        <ToggleButton 
                          text={day.value} 
                          onPress={toggleButton} 
                          toggled={daySelected.includes(day.key)}
                          toggledCol={Colors.black}
                          untoggledCol={Colors.gray}
                        />
                      </View>
                    )
                  })
                }
                </View>
                
                <View style={styles.sliderAndTitle}>
                  <CustomText style={styles.filterSectionTitle} font="bold" text={`Time:`} />
                  <View style={styles.sliderView}>
                    <CustomText style={{fontSize: 15, marginTop: 5, marginLeft: startEndTime[0] * 9.75 }} text={formatStartEndTime(startEndTime[0])} />
                    <CustomText style={{fontSize: 15, marginTop: -21, marginLeft: startEndTime[1] * 9.75 }} text={formatStartEndTime(startEndTime[1])} />
                    <MultiSlider
                      values={startEndTime}
                      sliderLength={250}
                      onValuesChange={(values) => setStartEndTime(values)}
                      touchDimensions={{
                        height: 50,
                        width: 50,
                        borderRadius: 15,
                        slipDisplacement: 200,
                      }}
                      selectedStyle={{backgroundColor: Colors.black, height: 4}}
                      unselectedStyle={{backgroundColor: Colors.gray, height: 4}}
                      markerContainerStyle={{marginTop: 2}}
                      customMarker={() => {
                        return (
                          <View style={{height: 20, width: 20, borderRadius: 10, backgroundColor: Colors.black}} />
                        )
                      }}
                      containerStyle={{height: 30}}
                      min={0}
                      max={24}
                      step={1}
                      allowOverlap
                      snapped         
                    />
                  </View>
                </View>

                {calendarSetting == 'newClubs' && 
                <View>
                  <CustomText style={styles.filterSectionTitle} font="bold" text={`Club Categories:`} />
                  <View style={styles.toggleButtonRow}>
                  { 
                    // create a toggle component for each category
                    clubCategories.map((category) => {

                      // toggle button to update categories selected
                      const toggleButton = () => {
                        if (clubCategoriesSelected.includes(category.value)) {
                          setClubCategoriesSelected(clubCategoriesSelected.filter((item) => item !== category.value));
                        } else {
                          setClubCategoriesSelected([...clubCategoriesSelected, category.value]);
                        }
                      }

                      return (
                        <View style={styles.toggleButtonView} >
                          <ToggleButton 
                            text={category.value} 
                            onPress={toggleButton} 
                            toggled={clubCategoriesSelected.includes(category.value)}
                            toggledCol={category.color}
                            untoggledCol={Colors.gray}
                            icon={category.icon}
                          />
                        </View>
                      )
                    })
                  }
                  </View>
                </View>}

                {calendarSetting == 'myClubs' &&
                  <View>
                    <CustomText style={[styles.filterSectionTitle, { marginBottom: 10 }]} font="bold" text={`My Clubs:`} />
                    <FilterList items={clubList} setter={setMySelectedClubs} selected={myClubsSelected} text='My Clubs'  />
                  </View>
                }
              </KeyboardAwareScrollView>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  calendarContainer: {
    flex: 1,
    width: '100%',
  },
  filterButtonView: {
    position: 'absolute',
    top: 15,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    margin: 40,
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  // filter overlay
  modal: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  filter: {
    width: '100%',
    height: '92%',
    backgroundColor: 'white',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderRadius: 30,
  },
  bar: {
    width: 80,
    height: 5,
    backgroundColor: Colors.lightGray,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 30,
},
  filterSectionTitle: {
    fontSize: 20,
    marginTop: 10,
    marginLeft: 10,
  },
  toggleButtonRow: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 10,
  },
  toggleButtonView: {
    
  },
  sliderAndTitle: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 20,
  },
  sliderView: {
    height: 30,
    width: 250,
    margin: 20,
    marginTop: 10,
    width: '100%',
  },

  // fonts
  text: {
    ...textNormal,
    fontSize: 20,
  },
  title: title,
});

export default CalendarScreen;