import React, { useState, useEffect } from "react";
// react native components
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
// my components
import UpcomingEvents from "../../components/event/UpcomingEvents";
import ToggleButton from "../../components/buttons/ToggleButton";
import CustomText from "../../components/display/CustomText";
import FilterList from "../../components/input/FilterList";
import CustomSlider from "../../components/input/CustomSlider";
import IconButton from "../../components/buttons/IconButton";
// calendar
import { LocaleConfig, Calendar } from "react-native-calendars";
// functions
import { showToastIfNewUser } from "../../functions/backendFunctions";
import { getSetMyClubsData } from "../../functions/clubFunctions";
import { getSetUserData } from "../../functions/profileFunctions";
import { getSetCalendarData } from "../../functions/eventFunctions";
import { formatDate, formatStartEndTime } from "../../functions/timeFunctions";
// modal
import SwipeUpDownModal from "react-native-swipe-modal-up-down";
// macros
import { CLUBCATEGORIES, DAYSOFTHEWEEK } from "../../macros/macros";
// styles
import { useTheme } from "@react-navigation/native";
// scroll viewr
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// stack navigator
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// calendar config
LocaleConfig.locales["eng"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  dayNamesShort: ["S", "M", "T", "W", "T", "F", "S"],
  today: "Today",
};
LocaleConfig.defaultLocale = "eng";

// stack navigator
const Stack = createNativeStackNavigator();

// calendar screen
const CalendarScreen = ({ navigation }) => {
  // state for events data
  const [eventData, setEventData] = useState([]);
  // state for user data
  const [userData, setUserData] = useState(null);
  // my clubs data
  const [myClubsData, setMyClubsData] = useState([]);
  // state for loading
  const [loading, setLoading] = useState(true);

  // state for calendar
  const [filteredEvents, setFilteredEvents] = useState([]); // filtered events
  const [markedDates, setMarkedDates] = useState({}); // marked dates on calendar
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  ); // selected date, default today
  const [specificDateSelected, setSpecificDateSelected] = useState(false); // whether a specific date is selected or not
  const [currenMonth, setCurrentMonth] = useState(new Date().getMonth());
  // overlay
  let [showFilter, setShowFilter] = useState(false);
  let [animateModal, setanimateModal] = useState(false);
  // overlay filters
  const [calendarSetting, setCalendarSetting] = useState("myClubs"); // either 'myClubs' or 'newClubs'
  const [daySelected, setSelectedDay] = React.useState([1, 2, 3, 4, 5, 6, 7]); // days of the week selected
  const [myClubsSelected, setMySelectedClubs] = React.useState([]); // clubs selected if calendar setting is 'myClubs'
  const [clubCategoriesSelected, setClubCategoriesSelected] = React.useState(
    []
  ); // club categories selected if calendar setting is 'newClubs'
  const [upcomingOnly, setUpcomingOnly] = React.useState(true); // filter by upcoming events only
  const [startEndTime, setStartEndTime] = React.useState([0, 24]); // filter by time of day
  const [clubList, setClubList] = useState([]);

  const { colors } = useTheme();

  const getDataAsync = async () => {
    setLoading(true);

    await getSetUserData(setUserData);
    await getSetCalendarData(setEventData);
    await getSetMyClubsData(
      setMyClubsData,
      () => {},
      () => {}
    );

    setLoading(false);
  };

  // get data from firebase
  useFocusEffect(
    React.useCallback(() => {
      getDataAsync();

      // set selected date to null
      setSpecificDateSelected(false);
    }, [])
  );

  // set club list (names of clubs) after clubs data is loaded
  useEffect(() => {
    if (myClubsData) {
      // get names of all clubs
      const clubList = myClubsData.map((club) => {
        return {
          key: club.clubId,
          value: club.clubName,
        };
      });
      setClubList(clubList);
    }
  }, [myClubsData]);

  // toggle overlay
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // select a specific date
  const selectSpecificDate = (date) => {
    if (date.dateString == selectedDate) {
      setSpecificDateSelected(false);
      setSelectedDate(new Date().toISOString().slice(0, 10));
      return;
    }
    setSelectedDate(date.dateString);
    setSpecificDateSelected(true);
  };

  // filter for events
  const filterFunct = (event) => {
    // filter by specific date
    if (specificDateSelected) {
      if (formatDate(event.date) != selectedDate) {
        return false;
      }
    }
    // if not same month as calendar
    if (new Date(event.date).getMonth() != currenMonth) {
      return false;
    }

    // if date is in the past
    if (new Date(event.date) < new Date() && upcomingOnly) {
      return false;
    }

    // filter by calendar setting
    if (calendarSetting == "newClubs") {
      // if already in my clubs
      if (
        !userData ||
        userData.clubs == null ||
        userData.clubs.includes(event.clubId)
      ) {
        return false;
      }

      // if not public event
      if (!event.public) {
        return false;
      }
    }

    // filter by day of the week
    if (daySelected.length > 0) {
      // get day of the week from date
      const filteredDays = daySelected.map((day) => {
        return day - 1;
      });

      // reformat date to form 'YYYY-MM-DD'
      const eventDate = new Date(formatDate(event.date));
      if (!filteredDays.includes(eventDate.getUTCDay())) {
        return false;
      }
    }

    // filter by time of day
    const formattedStartTime = startEndTime[0];
    const formattedEndTime = startEndTime[1];
    // get hour from event date
    const hour = new Date(event.date).getHours();
    // if hour outside of bounds
    if (hour < formattedStartTime || hour > formattedEndTime) {
      return false;
    }

    // filter by my clubs if setting is 'myClubs'
    if (calendarSetting == "myClubs" && userData != null) {
      // if not in my clubs
      if (userData.clubs != null) {
        if (!userData.clubs.includes(event.clubId)) {
          return false;
        }
      }
    }

    // filter by my clubs if setting is 'myClubs' OLD VERSION (MORE COMPLEX)
    // if (calendarSetting == "myClubs" && myClubsSelected.length > 0) {
    //   const clubIds = myClubsSelected.map(
    //     (club) => clubList.find((item) => item.value == club).key
    //   );
    //   console.log("club ids: ", clubIds);
    //   if (!clubIds.includes(event.clubId)) {
    //     return false;
    //   }
    // }

    // filter by club categories if setting is 'newClubs'
    if (calendarSetting == "newClubs" && clubCategoriesSelected.length > 0) {
      // get club categories from event's club
      const clubCategories = event.clubCategories;

      // if event's club's category is not in the selected categories
      if (
        !clubCategories.some((category) =>
          clubCategoriesSelected.includes(category)
        )
      ) {
        return false;
      }
    }

    // if all filters pass
    return true;
  };

  useEffect(() => {
    showToastIfNewUser(
      "success",
      "Find events that interest you! 📅",
      "Use the filter to find new events and manage your clubs."
    );
  }, []);

  // filtered events (filter when data changes)
  useEffect(() => {
    if (eventData) {
      let repeatedEvents = [];
      eventData.forEach((event) => {
        if (event.repeats == "Weekly") {
          let date = new Date(event.date);
          let endDate = new Date(event.date);

          // set end date to 6 months from now
          endDate.setMonth(endDate.getMonth() + 6);

          // add event to repeatedEvents for each day
          while (date <= endDate) {
            repeatedEvents = [
              ...repeatedEvents,
              {
                ...event,
                date: date.toString(),
              },
            ];

            // increment date by 7 days
            date.setDate(date.getDate() + 7);
          }
        } else if (event.repeats == "Monthly") {
          let date = new Date(event.date);
          let endDate = new Date(event.date);

          // set end date to 6 months from now
          endDate.setMonth(endDate.getMonth() + 6);

          // add event to repeatedEvents for each day
          while (date <= endDate) {
            repeatedEvents = [
              ...repeatedEvents,
              {
                ...event,
                date: date.toString(),
              },
            ];

            // increment date by 1 month
            date.setMonth(date.getMonth() + 1);
          }
        } else if (event.repeats == "Daily") {
          let date = new Date(event.date);
          let endDate = new Date(event.date);

          // set end date to 1 month from now
          endDate.setMonth(endDate.getMonth() + 1);

          // add event to repeatedEvents for each day
          while (date <= endDate) {
            repeatedEvents = [
              ...repeatedEvents,
              {
                ...event,
                date: date.toString(),
              },
            ];

            // increment date by 1 day
            date.setDate(date.getDate() + 1);
          }
        } else {
          repeatedEvents = [...repeatedEvents, event];
        }
      });

      const filteredEvents = repeatedEvents.filter(filterFunct);
      setFilteredEvents(filteredEvents);

      // mark dates on calendar (try to make this more efficient)
      let markedDates = { ...markedDates };
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

        const thisEventClubCategories = event.categories;
        dotColors = thisEventClubCategories.map((category) => {
          return {
            key: category,
            color: CLUBCATEGORIES.find((item) => item.value == category).color,
          };
        });

        // remove duplicate dot colors
        dotColors = dotColors.filter(
          (v, i, a) => a.findIndex((t) => t.color === v.color) === i
        );

        // add dots with dot color to marked dates if not already there
        if (markedDates[formattedDate].dots == null) {
          // add all dot colors
          markedDates[formattedDate].dots = dotColors.map((dotColor) => {
            return {
              key: dotColor.key,
              color: dotColor.color,
              selectedDotColor: dotColor.color,
            };
          });
        } else {
          // if dots already there
          dotColors.forEach((dotColor) => {
            // if dot color not already there
            if (
              !markedDates[formattedDate].dots.some(
                (item) => item.color == dotColor.color
              )
            ) {
              // add dot color
              markedDates[formattedDate].dots.push({
                key: dotColor.key,
                color: dotColor.color,
                selectedDotColor: dotColor.color,
              });
            }
          });
        }
      });

      // add specific date if selected
      if (specificDateSelected) {
        markedDates = {
          [selectedDate]: {
            selected: true,
            selectedColor: colors.bark,
            dotColor: colors.bark,
          },
        };
      }

      setMarkedDates(markedDates);
    }
  }, [
    eventData,
    calendarSetting,
    daySelected,
    startEndTime,
    myClubsSelected,
    clubCategoriesSelected,
    specificDateSelected,
    selectedDate,
    currenMonth,
    upcomingOnly,
  ]);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="🗓️ Calendar"
        options={{
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerRight: () => (
            <IconButton
              icon={showFilter ? "options" : "options-outline"}
              text=""
              onPress={toggleFilter}
              style={styles.filterButtonView}
              color={colors.button}
            />
          ),
          headerLargeTitleStyle: {
            fontWeight: "bold",
            fontFamily: "Nunito",
            fontSize: 32,
          },
          headerStyle: {
            backgroundColor: colors.background,
            shadowColor: "transparent",
            elevation: 0,
          },
        }}
      >
        {() => (
          <View style={{ flex: 1 }}>
            <ScrollView
              style={styles.container}
              contentContainerStyle={{ justifyContent: "flex-start", gap: 10 }}
              contentInsetAdjustmentBehavior="automatic"
            >
              <View style={{ flex: 1 }} keyboardShouldPersistTaps="always">
                <View
                  style={styles.calendarContainer}
                  keyboardShouldPersistTaps="always"
                >
                  <Calendar
                    keyboardShouldPersistTaps="always"
                    current={selectedDate}
                    markingType="multi-dot"
                    markedDates={markedDates}
                    theme={{
                      calendarBackground: "transparent",
                      textSectionTitleColor: colors.bark,
                      todayTextColor: colors.bark,
                      dayTextColor: "gray",
                      textDisabledColor: colors.textLight,
                      arrowColor: colors.bark,
                      monthTextColor: colors.bark,
                    }}
                    onDayPress={(day) => selectSpecificDate(day)}
                    onMonthChange={(month) => setCurrentMonth(month.month - 1)}
                  />
                </View>

                <View style={styles.eventsContainer}>
                  <UpcomingEvents
                    filteredEvents={filteredEvents}
                    navigation={navigation}
                    calendar={true}
                  />
                </View>
              </View>
            </ScrollView>

            {/* filter overlay */}
            <SwipeUpDownModal
              modalVisible={showFilter}
              PressToanimate={animateModal}
              //if you don't pass HeaderContent you should pass marginTop in view of ContentModel to Make modal swipeable
              ContentModal={
                <View style={styles.modal}>
                  <View
                    style={[styles.filter, { backgroundColor: colors.card }]}
                  >
                    <TouchableWithoutFeedback>
                      <View style={{ alignItems: "center", width: "100%" }}>
                        <View
                          style={[styles.bar, { backgroundColor: colors.gray }]}
                        />
                      </View>
                    </TouchableWithoutFeedback>

                    <KeyboardAwareScrollView
                      contentContainerStyle={{
                        marginHorizontal: 20,
                        paddingBottom: 20,
                      }}
                      extraHeight={400}
                    >
                      <CustomText
                        style={[
                          styles.filterSectionTitle,
                          { color: colors.text },
                        ]}
                        font="bold"
                        text={`Calendar Settings`}
                      />
                      <View style={styles.toggleButtonRow}>
                        <View>
                          <ToggleButton
                            text="My Clubs"
                            onPress={() => setCalendarSetting("myClubs")}
                            toggled={calendarSetting == "myClubs"}
                            toggledCol={colors.bark}
                            untoggledCol={colors.gray}
                            icon="person"
                          />
                        </View>
                        <View>
                          <ToggleButton
                            text="New Clubs"
                            onPress={() => setCalendarSetting("newClubs")}
                            toggled={calendarSetting == "newClubs"}
                            toggledCol={colors.bark}
                            untoggledCol={colors.gray}
                            icon="search"
                          />
                        </View>
                      </View>

                      <View style={[ styles.toggleButtonRow, { alignItems: 'center' } ]}>
                        <CustomText
                          style={[
                            styles.filterSectionTitle,
                            { color: colors.text },
                          ]}
                          font="bold"
                          text={`Upcoming Only`}
                        />
                        <Switch
                          value={upcomingOnly}
                          onValueChange={() => setUpcomingOnly(!upcomingOnly)}
                          trackColor={{ false: colors.gray, true: colors.button }}
                        />
                      </View>

                      <CustomText
                        style={[
                          styles.filterSectionTitle,
                          { color: colors.text },
                        ]}
                        font="bold"
                        text={`Day of the week`}
                      />
                      <View
                        style={[
                          styles.toggleButtonRow,
                          { gap: 12, marginLeft: 5 },
                        ]}
                      >
                        {
                          // create a toggle component for each category
                          DAYSOFTHEWEEK.map((day) => {
                            // toggle button to update categories selected
                            const toggleButton = () => {
                              if (daySelected.includes(day.key)) {
                                setSelectedDay(
                                  daySelected.filter((item) => item !== day.key)
                                );
                              } else {
                                setSelectedDay([...daySelected, day.key]);
                              }
                              setSpecificDateSelected(false);
                            };

                            return (
                              <TouchableOpacity
                                style={[
                                  styles.toggleButtonView,
                                  {
                                    backgroundColor: daySelected.includes(
                                      day.key
                                    )
                                      ? colors.button
                                      : colors.gray,
                                  },
                                ]}
                                onPress={toggleButton}
                              >
                                <CustomText
                                  font="black"
                                  style={{
                                    fontSize: 16,
                                    color: daySelected.includes(day.key)
                                      ? colors.white
                                      : colors.white,
                                  }}
                                  text={day.value}
                                />
                              </TouchableOpacity>
                            );
                          })
                        }
                      </View>

                      <View style={styles.sliderAndTitle}>
                        <CustomText
                          style={[
                            styles.filterSectionTitle,
                            { color: colors.text },
                          ]}
                          font="bold"
                          text={`Time`}
                        />
                        <View style={styles.sliderView}>
                          <CustomText
                            style={{
                              fontSize: 15,
                              marginTop: 5,
                              marginLeft: startEndTime[0] * 9.75,
                              color: colors.text,
                            }}
                            text={formatStartEndTime(startEndTime[0])}
                          />
                          <CustomSlider
                            values={startEndTime}
                            onValuesChange={(values) => setStartEndTime(values)}
                          />
                          <CustomText
                            style={{
                              fontSize: 15,
                              marginLeft: startEndTime[1] * 9.75,
                              color: colors.text,
                            }}
                            text={formatStartEndTime(startEndTime[1])}
                          />
                        </View>
                      </View>

                      {calendarSetting == "newClubs" && (
                        <View>
                          <CustomText
                            style={[
                              styles.filterSectionTitle,
                              { color: colors.text },
                            ]}
                            font="bold"
                            text={`Club Categories`}
                          />
                          <View style={styles.toggleButtonRow}>
                            {
                              // create a toggle component for each category
                              CLUBCATEGORIES.map((category) => {
                                // toggle button to update categories selected
                                const toggleButton = () => {
                                  if (
                                    clubCategoriesSelected.includes(
                                      category.value
                                    )
                                  ) {
                                    setClubCategoriesSelected(
                                      clubCategoriesSelected.filter(
                                        (item) => item !== category.value
                                      )
                                    );
                                  } else {
                                    setClubCategoriesSelected([
                                      ...clubCategoriesSelected,
                                      category.value,
                                    ]);
                                  }
                                };

                                return (
                                  <View>
                                    <ToggleButton
                                      text={`${category.emoji} ${category.value}`}
                                      onPress={toggleButton}
                                      toggled={clubCategoriesSelected.includes(
                                        category.value
                                      )}
                                      toggledCol={category.color}
                                      untoggledCol={colors.gray}
                                    />
                                  </View>
                                );
                              })
                            }
                          </View>
                        </View>
                      )}

                      {/* {calendarSetting == "myClubs" && (
                        <View>
                          <CustomText
                            style={[
                              styles.filterSectionTitle,
                              { marginBottom: 10, color: colors.text },
                            ]}
                            font="bold"
                            text={`My Clubs:`}
                          />
                          <FilterList
                            items={clubList}
                            setter={setMySelectedClubs}
                            selected={myClubsSelected}
                            text="My Clubs"
                          />
                        </View>
                      )} */}
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
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  calendarContainer: {
    flex: 1,
    width: "100%",
  },
  eventsContainer: {
    flex: 1,
    width: "100%",
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  // filter overlay
  modal: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  filter: {
    flex: 1,
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bar: {
    width: 80,
    height: 5,

    borderRadius: 5,
    marginTop: 20,
    marginBottom: 10,
  },
  toggleButtonRow: {
    flexDirection: "row",
    marginTop: 10,
    width: 300,
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 10,
  },
  toggleButtonView: {
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderAndTitle: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 20,
  },
  sliderView: {
    height: 30,
    width: 250,
    margin: 10,
    marginBottom: 20,
    width: "100%",
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

export default CalendarScreen;
