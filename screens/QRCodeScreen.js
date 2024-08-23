// QRCodeScreen.js
import React, { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
// qr code
import QRCode from "react-native-qrcode-svg";
// components
import Header from "../components/display/Header";
import CustomButton from "../components/buttons/CustomButton";
// clipboard
import * as Clipboard from "expo-clipboard";
// colors
import { useTheme } from "@react-navigation/native";

const QRCodeScreen = ({ route, navigation }) => {
  const { name, qrCodeData } = route.params;

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
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header navigation={navigation} text={name} back />
      <View style={styles.qrCodeView}>
        <View style={[styles.qrCodeBox, { backgroundColor: colors.card, borderColor: colors.text }]}>
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

export default QRCodeScreen;
