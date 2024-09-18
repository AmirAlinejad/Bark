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
// icons
import { Ionicons } from "react-native-vector-icons";

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
  const [attendees, setAttendees] = useState([]);
  const [attendeesData, setAttendeesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await getSetEventAttendance(eventId, setAttendees);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await getAttendeesData(attendees, setAttendeesData);
    };

    fetchData();
  }, [attendees]);

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

  const renderMember = ({ item }) => {
    return (
      <View style={styles.memberContainer}>
        <ProfileImg profileImg={item.profileImg} width={50} />

        <CustomText
          style={[styles.memberName, { color: colors.text }]}
          text={`${item.firstName} ${item.lastName}`}
          font="bold"
        />
      </View>
    );
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
              justifyContent: "center",

              height: 180,
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
                <Ionicons
                  name="checkmark-circle"
                  size={50}
                  color={colors.textLight}
                />
                <CustomText
                  text="Link copied to clipboard!"
                  font="bold"
                  style={[
                    styles.text,
                    { fontSize: 24, color: colors.textLight },
                  ]}
                />
              </Animated.View>
            )}
          </View>
        </View>
        {attendeesData.length > 0 && (
          <View style={{ flex: 1 }}>
            <CustomText
              text="Who made it?"
              font="bold"
              style={[
                styles.text,
                {
                  textAlign: "center",
                  color: colors.text,
                  fontSize: 24,
                  marginBottom: 20,
                },
              ]}
            />
            <FlatList
              data={attendeesData}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
            />
          </View>
        )}
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

  memberContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AttendanceScreen;
