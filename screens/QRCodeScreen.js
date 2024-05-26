// QRCodeScreen.js

import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
// qr code
import QRCode from 'react-native-qrcode-svg';
// components
import Header from '../components/display/Header';
import { IconButton } from '../components/buttons/IconButton';
// clipboard
import * as Clipboard from 'expo-clipboard';

const QRCodeScreen = ({ route, navigation }) => {
  const { clubName } = route.params;
  const [qrCodeData, setQRCodeData] = useState('');

  useEffect(() => {
    if (clubName) {
      setQRCodeData(clubName);
    }
  }, [clubName]);

  // copy qr code data to clipboard
  // clipboard
  const copyURLToClipboard = async () => {
    Clipboard.setStringAsync(qrCodeData);
    setAddressCopied(true);
  }

  if (!qrCodeData) {
    // Handle the case where qrCodeData is not available yet
    return null;
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="QR Code" back />
      <QRCode
        value={qrCodeData}
        size={200}
        color="black"
        backgroundColor="white"
        logo={require('../../assets/logo.png')} // Optional logo image
        logoSize={80} // Optional logo size
        logoBackgroundColor="transparent" // Optional logo background color
        logoMargin={2} // Optional logo margin
      />

      {/* share button, export button, etc. */}
      <View style={styles.buttons}>
        <IconButton
          name="content-copy"
          size={40}
          onPress={copyURLToClipboard}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {

  }
});

export default QRCodeScreen;
