import React from "react";
// react native components
import { View, StyleSheet, TouchableOpacity } from "react-native";
// my components
import CustomText from "../display/CustomText";
// time functions
import { timeToString } from "../../functions/timeFunctions";
// icons
import { Ionicons } from "@expo/vector-icons";
// style
import { Colors } from "../../styles/Colors";

// club card displayed on the club list screen
const EventCard = ({
  id,
  name,
  time,
  icon,
  iconColor,
  screenName,
  navigation,
}) => {
  // description and time are not used yet

  const onPress = () => {
    // Navigate to the event screen
    navigation.navigate("EventScreen", {
      eventId: id,
      fromScreen: screenName ? screenName : null,
    });
  };

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={{ flexDirection: "row", gap: 15 }}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
          <Ionicons name={icon} size={24} color={Colors.white} />
        </View>

        <View style={styles.cardText}>
          <CustomText
            style={[styles.textNormal]}
            text={name}
            font="bold"
            numberOfLines={1}
          />
          <View stlye={{ alignItems: 'flex-end' }}>
            <CustomText style={styles.timeText} text={timeToString(time)} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    // shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
  },
  cardText: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 0,
  },
  iconCircle: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: Colors.lightGray,
    marginBottom: 10,
  },
  textNormal: {
    textAlignVertical: "center",
    fontSize: 18,
    marginTop: 5,
  },
  timeText: {
    textAlign: "",
    marginTop: 5,
    fontSize: 16,
    color: Colors.darkGray,
  },
});

export default EventCard;
