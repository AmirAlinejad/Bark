import React from 'react';
// react native components
<<<<<<< HEAD
import { StyleSheet, TouchableOpacity } from 'react-native';
=======
import { StyleSheet, Pressable } from 'react-native';
>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
// my components
import CustomText from './CustomText';

const CustomButton = ({ onPress, text, type, bgColor, fgColor }) => {
  // bg color is bg color of button
  const containerStyle = [
    styles.container,
    type && styles[`container_${type}`], 
    bgColor && { backgroundColor: bgColor }, 
  ];

  // fg color is text color of button
  const textStyle = [
    styles.text,
    type && styles[`text_${type}`], 
    fgColor && { color: fgColor }, 
  ];

  return (
<<<<<<< HEAD
    <TouchableOpacity onPress={onPress} style={containerStyle}>
      <CustomText style={textStyle} text={text} font="bold" />
    </TouchableOpacity>
=======
    <Pressable onPress={onPress} style={containerStyle}>
      <CustomText style={textStyle} text={text} />
    </Pressable>
>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3B71F3',
    width: '33%',
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
    borderRadius: 25,
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