import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Logo from '../assets/logo.png';

const InitialPage = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const delay = 1500;

    const navigateToSignInScreen = () => {
      navigation.navigate('SignIn');
    };

    const timeoutId = setTimeout(navigateToSignInScreen, delay);

    return () => clearTimeout(timeoutId);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} resizeMode="contain" />
      <Text style={{ fontWeight: 'bold', fontSize: 50 }}>BARK!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
});

export default InitialPage;

