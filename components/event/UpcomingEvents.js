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
import { Colors } from "../../styles/Colors";

const UpcomingEvents = ({ filteredEvents, screenName, navigation }) => {
  const [categorizedEvents, setCategorizedEvents] = useState({});

  useEffect(() => {
    // sort events by time
    let sortedEvents = [];
    if (filteredEvents != []) {
      sortedEvents = filteredEvents.sort((a, b) => {
        return (
          new Date(a.date + "T" + a.time) - new Date(b.date + "T" + b.time)
        );
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
    console.log(categorizedEvents);

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
                <CustomText style={styles.dateTitle} text={date} />
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
                          time={item.time}
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
            <Ionicon name="calendar" size={100} color={Colors.mediumGray} />
            <CustomText
              text="No upcoming events."
              font="bold"
              style={styles.messageText}
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
  },
  separator: {
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  dateTitle: {
    fontSize: 20,
    color: Colors.darkGray,
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
    color: Colors.gray,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 64,
  },
});

export default UpcomingEvents;
