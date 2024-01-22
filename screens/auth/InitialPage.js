import React, { useEffect } from 'react';
// react native components
import { View, Image, StyleSheet } from 'react-native';
// my components
import CustomText from '../../components/CustomText';
// navigation
import { useNavigation } from '@react-navigation/native';
// assets
import Logo from '../../assets/logo.png';

const InitialPage = () => {
  const navigation = useNavigation();

  // navigate to sign-in screen after 1.5 seconds
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
      <CustomText style={{ fontWeight: 'bold', fontSize: 50 }} text='BARK!'/>
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

