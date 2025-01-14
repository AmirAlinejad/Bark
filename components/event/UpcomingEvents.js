import React, { useEffect, useState } from "react";
// react native components
import { View, StyleSheet } from "react-native";
// my components
import EventCard from "./EventCard";
import CustomText from "../display/CustomText";
// icons
import Ionicon from "react-native-vector-icons/Ionicons";
// macros
import { CLUBCATEGORIES } from "../../macros/macros";
// colors
import { useTheme } from "@react-navigation/native";

const UpcomingEvents = ({
  filteredEvents,
  screenName,
  navigation,
  calendar,
}) => {
  const { colors } = useTheme();
  const [categorizedEvents, setCategorizedEvents] = useState({});

  useEffect(() => {
    let repeatedEvents = [];
    if (!calendar) {
      // duplicate repeated events
      filteredEvents.forEach((event) => {
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
          console.log("daily event");
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
    } else {
      repeatedEvents = filteredEvents;
    }

    // sort events by time
    let sortedEvents = [];
    if (repeatedEvents != []) {
      sortedEvents = repeatedEvents.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
    }

    // categorize events by date
    let categorizedEvents = {};
    sortedEvents.forEach((event) => {
      // change date to format 'Jan 01, 2022'
      let date = new Date(event.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      // add event to the date
      if (!categorizedEvents[date]) {
        categorizedEvents[date] = [];
      }
      categorizedEvents[date].push(event);
    });

    setCategorizedEvents(categorizedEvents);
  }, [filteredEvents]);

  return (
    <View style={styles.eventsContent}>
      <View style={{ width: "100%" }}>
        {categorizedEvents &&
          // map through the dates
          categorizedEvents &&
          Object.keys(categorizedEvents).map((date, index) => {
            return (
              <View key={index} style={{ width: "100%" }}>
                <CustomText
                  style={[styles.dateTitle, { color: colors.textLight }]}
                  text={date}
                />
                {
                  // map through the event data for each date
                  categorizedEvents[date].map((item, index) => {
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
                      <View
                        style={{ width: "100%", marginBottom: 12 }}
                        key={index}
                      >
                        <EventCard
                          key={index}
                          id={item.id}
                          name={item.name}
                          date={item.date}
                          showDate={date}
                          icon={icon}
                          iconColor={iconColor}
                          screenName={screenName}
                          navigation={navigation}
                        />
                      </View>
                    );
                  })
                }
              </View>
            );
          })}
        {filteredEvents.length == 0 && (
          <View style={styles.message}>
            <Ionicon name="calendar" size={100} color={colors.gray} />
            <CustomText
              text="No upcoming events."
              font="bold"
              style={[styles.messageText, { color: colors.textLight }]}
            />
            <CustomText
              text="Check back later for more events!"
              style={{ fontSize: 16, color: colors.textLight }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eventsContent: {
    flex: 1,
    alignItems: "flex-start",
    width: "100%",
    backgroundColor: "transparent",
  },
  dateTitle: {
    fontSize: 20,
    marginBottom: 10,
    marginLeft: 8,
  },
  message: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 8,
  },
});

export default UpcomingEvents;
