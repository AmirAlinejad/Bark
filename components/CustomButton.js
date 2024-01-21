import React from 'react';
// react native components
import { StyleSheet, Pressable } from 'react-native';
// my components
import CustomText from './CustomText';

const CustomButton = ({ onPress, text, type, bgColor, fgColor }) => {
  const containerStyle = [
    styles.container,
    type && styles[`container_${type}`], 
    bgColor && { backgroundColor: bgColor }, 
  ];

  const textStyle = [
    styles.text,
    type && styles[`text_${type}`], 
    fgColor && { color: fgColor }, 
  ];

  return (
    <Pressable onPress={onPress} style={containerStyle}>
      <CustomText style={textStyle} text={text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3B71F3',
    width: '33%',
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
    borderRadius: 5,
  },
  container_PRIMARY: {
    backgroundColor: '#3B71F3',
  },
  container_TERTIARY: {
    backgroundColor: 'white', 
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
  },
  text_TERTIARY: {
    color: 'gray',
  },
});

export default CustomButton;