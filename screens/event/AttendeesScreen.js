import React, { useState, useEffect } from "react";
// react native components
import { View, StyleSheet } from "react-native";
// my components
import CustomButton from "../../components/buttons/CustomButton";
import CustomText from "../../components/display/CustomText";
import IconOverlay from "../../components/overlays/IconOverlay";
import CustomInput from "../../components/input/CustomInput";
// functions
import { attendEvent } from "../../functions/eventFunctions";
// styles
import { useTheme } from "@react-navigation/native";

const AttendeesScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [message, setMessage] = useState("");
  const { eventId } = route.params;

  return (
    <View style={styles.container}>
      <CustomText
        text="Thanks for attending!"
        font="bold"
        style={{
          marginBottom: 20,
          textAlign: "center",
          fontSize: 24,
          color: colors.text,
        }}
      />
      <CustomText
        text="Write a short message to say you were here."
        style={{
          marginBottom: 20,
          textAlign: "center",
          fontSize: 16,
          color: colors.text,
        }}
      />
      <CustomInput
        placeholder="Message (15 characters)"
        value={message}
        setValue={(text) => setMessage(text)}
        multiline={false}
        maxLength={15}
      />
      {!loading && (
        <CustomButton
          text="Confirm Attendance"
          onPress={() => {
            const async = async () => {
              setLoading(true);

              // add attendee to event
              await attendEvent(eventId, message);

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
