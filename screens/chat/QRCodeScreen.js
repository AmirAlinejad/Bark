// QRCodeScreen.js

import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { IconButton } from 'react-native-paper';

const QRCodeScreen = ({ route, navigation }) => {
  const { clubName } = route.params;
  const [qrCodeData, setQRCodeData] = useState('');

  useEffect(() => {
    if (clubName) {
      setQRCodeData(clubName);
    }
  }, [clubName]);

  if (!qrCodeData) {
    // Handle the case where qrCodeData is not available yet
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="close"
          color="black"
          size={30}
          onPress={() => navigation.goBack()}
        />
      </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 40, // Adjust the top position here
    left: 5, // Adjust the left position here
    padding: 10,
    zIndex: 1,
  },
});

export default QRCodeScreen;
