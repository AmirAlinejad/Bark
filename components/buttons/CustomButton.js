import React from 'react';
// react native components
import { StyleSheet, TouchableOpacity } from 'react-native';
// my components
import CustomText from '../display/CustomText';
// colors
import { Colors } from '../../styles/Colors';

const CustomButton = ({ onPress, text, color}) => {

  const backgroundColor = color ? color : Colors.buttonBlue;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, {backgroundColor : backgroundColor}]}>
      <CustomText style={styles.text} text={text} font="bold" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '33%',
    padding: 15,
    marginVertical: 5,
    borderRadius: 25,
  },
  text: {
    color: Colors.white,
  },
});

export default CustomButton;