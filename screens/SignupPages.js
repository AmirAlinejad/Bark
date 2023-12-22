
//Experiment

import React from 'react';
import { View, ScrollView, Dimensions, StyleSheet, Text } from 'react-native';
import CustomInput from '../components/CustomInput'; // Import your CustomInput component here

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

const SwipablePages = ({ email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, userName, setUserName, passwordVisible, togglePasswordVisibility }) => {
  const pages = [
    <CustomInput placeholder="School Email" value={email} setValue={setEmail} />,
    <CustomInput placeholder="Password" value={password} setValue={setPassword} secureTextEntry={!passwordVisible} onEyeIconPress={togglePasswordVisibility} />,
    <CustomInput placeholder="Confirm Password" value={confirmPassword} setValue={setConfirmPassword} secureTextEntry={!passwordVisible} onEyeIconPress={togglePasswordVisibility} />,
    <CustomInput placeholder="Username" value={userName} setValue={setUserName} />,
    // Add more pages as needed
  ];

  const renderPages = () => {
    return pages.map((page, index) => (
      <View key={index} style={[styles.page]}>
        {page}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: width * pages.length }}
      >
        {renderPages()}
      </ScrollView>
    </View>
  );
};

export default SwipablePages;
