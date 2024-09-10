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
import { useTheme } from "@react-navigation/native";

// club card displayed on the club list screen
const EventCard = ({
  id,
  name,
  date,
  showDate,
  icon,
  iconColor,
  screenName,
  navigation,
}) => {
  const { colors } = useTheme();
  // description and time are not used yet

  const onPress = () => {
    // Navigate to the event screen
    navigation.navigate("EventScreen", {
      eventId: id,
      fromScreen: screenName ? screenName : null,
      showDate: showDate,
    });
  };

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={{ flexDirection: "row", gap: 15 }}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
          <Ionicons name={icon} size={24} color={colors.white} />
        </View>

        <View style={styles.cardText}>
          <CustomText
            style={[styles.textNormal, { color: colors.text }]}
            text={name}
            font="bold"
            numberOfLines={1}
          />
          <View stlye={{ alignItems: "flex-end" }}>
            <CustomText
              style={[styles.timeText, { color: colors.textLight }]}
              text={timeToString(date)}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
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
    marginLeft: -8,
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
  },
});

export default EventCard;
