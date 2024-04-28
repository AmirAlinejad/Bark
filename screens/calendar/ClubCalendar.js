import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
// my components
import Header from '../../components/display/Header';
import UpcomingEvents from '../../components/event/UpcomingEvents';
import CustomText from '../../components/display/CustomText';
import CustomSlider from '../../components/input/CustomSlider';
import IconButton from '../../components/buttons/IconButton';
// calendar
import { LocaleConfig, Calendar } from 'react-native-calendars';
// functions
import { getSetUserData, getSetAllEventsData } from '../../functions/backendFunctions';
import { formatDate, formatStartEndTime } from '../../functions/timeFunctions';
// modal
import SwipeUpDownModal from 'react-native-swipe-modal-up-down';
// macros
import { CLUBCATEGORIES, DAYSOFTHEWEEK } from '../../macros/macros';
// styles
import { Colors } from '../../styles/Colors';
// scroll view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// calendar config
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

// calendar screen
const ClubCalendar = ({ route, navigation }) => {

  // state for calendar setting
  const { club } = route.params;
  // state for user data
  const [userData, setUserData] = useState(null);
  // state for events data
  const [eventData, setEventData] = useState([]);
  // state for loading
  const [loading, setLoading] = useState(true);

  // state for calendar
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10)); // selected date, default today
  const [specificDateSelected, setSpecificDateSelected] = useState(false); // whether a specific date is selected or not
  // overlay
  let [showFilter, setShowFilter] = useState(false);
  let [animateModal, setanimateModal] = useState(false);
  // overlay filters
  const [daySelected, setSelectedDay] = React.useState([1,2,3,4,5,6,7]); // days of the week selected
  const [startEndTime, setStartEndTime] = React.useState([0, 24]); // filter by time of day

  // get data from firebase
  useEffect (() => {
    const getDataAsync = async () => {
      setLoading(true);

      await getSetUserData(setUserData);
      await getSetAllEventsData(setEventData);

      setLoading(false);
    }
    getDataAsync();
  }, []);

  // toggle overlay
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // select a specific date
  const selectSpecificDate = (date) => {
    setSelectedDate(date.dateString);
    setSpecificDateSelected(true);
  }

  // filter for events
  const filterFunct = (event) => {
    // filter events not in the club
    if (event.clubId != club.clubId) {
      return false;
    }

    // filter by specific date
    if (specificDateSelected) {
      if (formatDate(event.date) != selectedDate) {
        return false;
      }
    }
    
    // filter by day of the week
    if (daySelected.length > 0) {
      // get day of the week from date
      const filteredDays = daySelected.map((day) => { return day - 1; });
      
      // reformat date to form 'YYYY-MM-DD'
      const eventDate = new Date(formatDate(event.date));
      if (!filteredDays.includes(eventDate.getUTCDay())) {
        return false;
      }
    }

    // filter by time of day
    const formattedStartTime = startEndTime[0];
    const formattedEndTime = startEndTime[1];
    // get hour from event time
    const hour = parseInt(event.time.substring(0, event.time.indexOf(':')));
    // if hour outside of bounds
    if (hour < formattedStartTime || hour > formattedEndTime) {
      return false;
    }

    // filter by public club if you are in the club
    if (!event.public && userData && !Object.keys(userData.clubs).includes(event.clubId)) {
      return false;
    }

    // if all filters pass
    return true;
  }

  // filtered events
  const filteredEvents = eventData.filter(filterFunct);

  // add filtered events to marked dates
  let markedDates = {};
  filteredEvents?.forEach((event) => {
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
    dotColors = club.clubCategories.map((category) => {
      return {
        key: category,
        color: CLUBCATEGORIES.find((item) => item.value == category).color,
      }
    });
  
    // add dots with dot color to marked dates
    if (markedDates[formattedDate].dots == null) {
      // add all dot colors
      markedDates[formattedDate].dots = dotColors.map((dotColor) => {
        return {
          key: dotColor.key,
          color: dotColor.color,
          selectedDotColor: dotColor.color,
        }
      });
    }
  });
  // add specific date if selected
  if (specificDateSelected) {
    markedDates = {[selectedDate]: {selected: true, selectedColor: Colors.red, dotColor: Colors.red}};
  }

  return (
    <View style={styles.container}>
      <Header text='Club Calendar' back onBack={() => navigation.goBack()}/>

      <IconButton icon={showFilter ? 'options' : 'options-outline'} text='' onPress={toggleFilter} style={styles.filterButtonView} color={Colors.buttonBlue} />

      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps='always'>
        <View style={styles.calendarContainer} keyboardShouldPersistTaps='always'>
          <Calendar
            keyboardShouldPersistTaps='always'
            current={selectedDate}
            markingType='multi-dot'
            markedDates={markedDates}
            theme={styles.calendarTheme}
            onDayPress={(day) => selectSpecificDate(day)}
          />
        </View>

        <View style={styles.eventsContainer} >
          <UpcomingEvents filteredEvents={filteredEvents ? filteredEvents : []} navigation={navigation} />
        </View>

        <View style={{position: "absolute", bottom: -600, left: 0, right: 0, backgroundColor: Colors.white, height: 600}}/>
      </ScrollView>

      {/* filter overlay */}
      <SwipeUpDownModal
        modalVisible={showFilter}
        PressToanimate={animateModal}
        //if you don't pass HeaderContent you should pass marginTop in view of ContentModel to Make modal swipeable
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

              <CustomText style={styles.filterSectionTitle} font="bold" text={`Day of the week:`} />
              <View style={[styles.toggleButtonRow, {gap: 15, marginLeft: 5}]}>
              { 
                // create a toggle component for each category
                DAYSOFTHEWEEK.map((day) => {

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
                    <TouchableOpacity style={styles.toggleButtonView} onPress={toggleButton}>
                      <CustomText font="black" style={{ fontSize: 18, marginTop: 5, marginLeft: 5, color: daySelected.includes(day.key) ? Colors.black : Colors.gray}} text={day.value} />
                    </TouchableOpacity>
                  )
                })
              }
              </View>
              
              <View style={styles.sliderAndTitle}>
                <CustomText style={styles.filterSectionTitle} font="bold" text={`Time:`} />
                <View style={styles.sliderView}>
                  <CustomText style={{fontSize: 15, marginTop: 5, marginLeft: startEndTime[0] * 9.75 }} text={formatStartEndTime(startEndTime[0])} />
                  <CustomSlider values={startEndTime} onValuesChange={(values) => setStartEndTime(values)} />
                  <CustomText style={{fontSize: 15, marginLeft: startEndTime[1] * 9.75 }} text={formatStartEndTime(startEndTime[1])} />
                </View>
              </View>

            </KeyboardAwareScrollView>
          </View>
        </View>
        }
        onClose={() => {
          setShowFilter(false);
          setanimateModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 390,
    backgroundColor: Colors.lightGray,
    justifyContent: 'flex-start',
    gap: 10,
  },
  calendarContainer: {
    flex: 1,
    width: 390,
  },
  calendarTheme: {
    calendarBackground: 'transparent',
    textSectionTitleColor: Colors.red,
    todayTextColor: Colors.red,
    dayTextColor: Colors.black,
    textDisabledColor: Colors.gray,
    arrowColor: Colors.red,
    fontFamily: 'nunito-regular',
  },
  filterButtonView: {
    position: 'absolute',
    top: 65,
    right: 20,
    color: Colors.buttonBlue,
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
    marginBottom: 10,
  },
  toggleButtonRow: {
    flexDirection: 'row',
    marginTop: 10,
    width: 360,
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
    margin: 10,
    marginTop: 20,
    width: '100%',
  },

  // fonts
  text: {
    fontSize: 20,
  },
  filterSectionTitle: {
    fontSize: 20,
    marginTop: 10,
    marginLeft: 10,
  },
});

export default ClubCalendar;