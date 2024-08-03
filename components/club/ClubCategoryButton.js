import React, { useState } from 'react';
// react native components
import { StyleSheet, Pressable } from 'react-native';
// my components
import CustomText from '../CustomText';
// styles
import { useTheme } from '@react-navigation/native';

/////////////////////////////////////////////   maybe delete this file   /////////////////////////////////////////////////

const clubCategoryButton = ({ text, onPress, toggled }) => { 
  const { colors } = useTheme();
  const containerStyle = [
    styles.container,
    // set color to red if toggled, light red if not
    toggled ? { backgroundColor: colors.bark } : { backgroundColor: colors.lightRed }, 
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