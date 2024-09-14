// QRCodeScreen.js
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
// qr code
import QRCode from "react-native-qrcode-svg";
// components
import CustomButton from "../components/buttons/CustomButton";
import CustomText from "../components/display/CustomText";
// clipboard
import * as Clipboard from "expo-clipboard";
// colors
import { useTheme } from "@react-navigation/native";
// logo
import logo from "../assets/brand/QRCodeLogo.png";

const QRCodeScreen = ({ route, navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({ headerLargeTitle: false, title: "" });
  }, [navigation]);

  const { name, qrCodeData } = route.params;

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

  // state
  const [copied, setCopied] = useState(false);

  // colors
  const { colors } = useTheme();

  // generate link by adding qr code data to the base url
  const link = "myapp://" + qrCodeData;

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
    flex: 1,
  },

  text: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default QRCodeScreen;
