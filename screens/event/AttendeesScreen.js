import React, { useState, useEffect } from "react";
// react native components
import { View, StyleSheet } from "react-native";
// my components
import CustomButton from "../../components/buttons/CustomButton";
import CustomText from "../../components/display/CustomText";
import IconOverlay from "../../components/overlays/IconOverlay";
import CustomInput from "../../components/input/CustomInput";
// functions
import { addAttendee } from "../../functions/eventFunctions";
// styles
import { useTheme } from "@react-navigation/native";

const AttendeesScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState;
  const [showOverlay, setShowOverlay] = useState(false);
  const [message, setMessage] = useState("");
  const { eventId } = route.params;

  return (
    <View style={styles.container}>
      <CustomText text="Write a short message to confirm your attendance" />
      <CustomInput
        placeholder="Message"
        value={message}
        onChangeText={(text) => setMessage(text)}
      />
      {!loading && (
        <CustomButton
          title="Confirm Attendance"
          onPress={() => {
            const async = async () => {
              setLoading(true);

              // add attendee to event
              await addAttendee(eventId);

              setLoading(false);
              setShowOverlay(true);
            };

            async();
          }}
        />
      )}
      <IconOverlay
        visible={showOverlay}
        setVisible={setShowOverlay}
        icon="checkmark-circle"
        iconColor={colors.green}
        text="Attendance Confirmed!"
        closeCondition={() => {
          navigation.navigate("Home Screen");
        }}
      />
    </View>
  );
};

export default AttendeesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
