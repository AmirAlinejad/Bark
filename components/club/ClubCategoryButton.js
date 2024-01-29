import React, { useState } from 'react';
// react native components
import { StyleSheet, Pressable } from 'react-native';
// my components
import CustomText from '../CustomText';
// styles
import { Colors } from '../../styles/Colors';

const clubCategoryButton = ({ text, onPress, toggled }) => {
  const containerStyle = [
    styles.container,
    // set color to red if toggled, light red if not
    toggled ? { backgroundColor: Colors.red } : { backgroundColor: Colors.lightRed }, 
  ];

  const textStyle = [
    styles.text,
    toggled ? { color: 'white' } : { color: 'black' }, 
  ];

  return (
    <Pressable style={containerStyle} onPress={onPress} >
      <CustomText style={textStyle} text={text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginHorizontal: 5,
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

export default clubCategoryButton;