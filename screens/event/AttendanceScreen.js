// AttendanceScreen.js
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  Easing,
  ScrollView,
} from "react-native";
// qr code
import QRCode from "react-native-qrcode-svg";
// my components
import CustomButton from "../../components/buttons/CustomButton";
import CustomText from "../../components/display/CustomText";
import ProfileImg from "../../components/display/ProfileImg";
// clipboard
import * as Clipboard from "expo-clipboard";
// colors
import { useTheme } from "@react-navigation/native";
// functions
import {
  getSetEventAttendance,
  getAttendeesData,
} from "../../functions/eventFunctions";
// logo
import logo from "../../assets/brand/QRCodeLogo.png";

const AttendanceScreen = ({ route, navigation }) => {
  const { name, eventId } = route.params;
  useLayoutEffect(() => {
    navigation.setOptions({ title: "Attendance" });
  }, [navigation]);

  // animate size of send button
  const textSize = useRef(new Animated.Value(0)).current;

  // style
  const buttonSize = textSize.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const textSizeStyle = {
    transform: [{ scale: buttonSize }],
  };

  // generate link by adding qr code data to the base url
  const link = "myapp://" + "?screen=attendance&eventId=" + eventId;

  // state
  const [copied, setCopied] = useState(false);
  const [attendees, setAttendees] = useState([
    {
      id: "1",
      name: "John Doe",
      image: "https://randomuser.me/api/portraits",
    },
  ]);
  const [attendeesData, setAttendeesData] = useState([
    {
      id: "1",
      name: "John Doe",
      image: "https://randomuser.me/api/portraits",
    },
  ]);

  // colors
  const { colors } = useTheme();

  // copy qr code data to clipboard
  // clipboard
  const copyURLToClipboard = async () => {
    Clipboard.setStringAsync(link);
    setCopied(true);
    // reset animation
    textSize.setValue(0);
    Animated.timing(textSize, {
      toValue: 1,
      duration: 600,
      easing: Easing.bounce,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ height: 80 }} />
        <View style={styles.container}>
          <View style={styles.qrCodeView}>
            <TouchableOpacity onLongPress={copyURLToClipboard}>
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
                  logoMargin={0} // Optional logo margin
                  logo={logo}
                  logoSize={96}
                />
              </View>
            </TouchableOpacity>

            {/* share button, export button, etc. */}

            <CustomText
              text="Hold the QR Code to copy the link"
              style={[styles.text, { color: colors.textLight }]}
            />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              height: 100,
            }}
          >
            {copied && (
              <Animated.View
                style={{
                  ...textSizeStyle,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CustomText
                  text="Link copied to clipboard!"
                  font="bold"
                  style={[styles.text, { fontSize: 24, color: colors.text }]}
                />
              </Animated.View>
            )}
          </View>
          <FlatList
            data={attendeesData}
            renderItem={({ item }) => (
              <View
                style={{
                  margin: 5,
                  width: "100%",
                  height: 100,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: 20,
                }}
              >
                <CustomText
                  text={item.name}
                  style={{
                    fontSize: 18,
                    textAlign: "center",
                    color: colors.text,
                  }}
                  font="bold"
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            numColumns={3}
            style={{ flex: 1 }}
            contentContainerStyle={{ justifyContent: "center" }}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeView: {
    flex: 2,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 40,
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
    flex: 1,
  },

  text: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default AttendanceScreen;
