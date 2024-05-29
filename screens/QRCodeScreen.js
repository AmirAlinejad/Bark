// QRCodeScreen.js
import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
// qr code
import QRCode from 'react-native-qrcode-svg';
// components
import Header from '../components/display/Header';
import CustomButton from '../components/buttons/CustomButton';
// clipboard
import * as Clipboard from 'expo-clipboard';
// colors
import { Colors } from '../styles/Colors';

const QRCodeScreen = ({ route, navigation }) => {
  const { name, qrCodeData} = route.params;

  // state
  const [copied, setCopied] = useState(false);

  // generate link by adding qr code data to the base url
  const link = 'exp://10.0.0.25:8081' + qrCodeData;

  // copy qr code data to clipboard
  // clipboard
  const copyURLToClipboard = async () => {
    Clipboard.setStringAsync(link);
    setCopied(true);
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text={name} back />
      <View style={styles.qrCodeView}>
      <View style={styles.qrCodeBox}>
        <QRCode
            value={link}
            size={250}
            color={Colors.black}
            backgroundColor={Colors.white}
            logo={require('../assets/logo.png')} // Optional logo image
            logoSize={80} // Optional logo size
            logoBackgroundColor={Colors.white} // Optional logo background color
            logoMargin={17} // Optional logo margin
          />
        </View>

        {/* share button, export button, etc. */}
        <View style={styles.buttons}>
          <CustomButton
            text='Copy Link'
            onPress={copyURLToClipboard}
            color={Colors.buttonBlue}
            icon={copied ? 'checkmark' : 'copy-outline'}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  qrCodeView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 120
  },
  qrCodeBox: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 15,
    width: 290,
    height: 290,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttons: {
    marginTop: 40,
  }
});

export default QRCodeScreen;
