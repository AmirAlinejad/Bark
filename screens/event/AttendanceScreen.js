// AttendanceScreen.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
// functions
// import { getSetEventAttendance } from "../../functions/events";
// qr code
import QRCode from "react-native-qrcode-svg";
// components
import CustomButton from "../../components/buttons/CustomButton";
// clipboard
import * as Clipboard from "expo-clipboard";
// colors
import { useTheme } from "@react-navigation/native";
import { getSetEventAttendance } from "../../functions/eventFunctions";

const AttendanceScreen = ({ route, navigation }) => {
  const { name, qrCodeData, eventId } = route.params;

  // state
  const [attendees, setAttendees] = useState([]);
  const [copied, setCopied] = useState(false);

  // colors
  const { colors } = useTheme();

  useEffect(() => {
    getSetEventAttendance(eventId, setAttendees);
  }, []);

  // generate link by adding qr code data to the base url
  const link = "myapp://" + qrCodeData + "/attendance";

  // copy qr code data to clipboard
  // clipboard
  const copyURLToClipboard = async () => {
    Clipboard.setStringAsync(link);
    setCopied(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.qrCodeView}>
        <View
          style={[
            styles.qrCodeBox,
            { backgroundColor: colors.card, borderColor: colors.text },
          ]}
        >
          <QRCode
            value={link}
            size={250}
            color={colors.text}
            backgroundColor={colors.card}
            logoBackgroundColor={colors.card} // Optional logo background color
            logoMargin={17} // Optional logo margin
          />
        </View>

        {/* share button, export button, etc. */}
        <View style={styles.buttons}>
          <CustomButton
            text="Copy Link"
            onPress={copyURLToClipboard}
            color={colors.button}
            icon={copied ? "checkmark" : "copy-outline"}
          />
        </View>

        <FlatList
          data={attendees}
          renderItem={({ item }) => (
            <View>
              <CustomText text={item.name} />
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  qrCodeView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 120,
  },
  qrCodeBox: {
    padding: 20,
    borderRadius: 15,
    width: 290,
    height: 290,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 8,
  },
  buttons: {
    marginTop: 40,
  },
});

export default AttendanceScreen;
