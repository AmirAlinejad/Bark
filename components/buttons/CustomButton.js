import React from 'react';
// react native components
import { StyleSheet, TouchableOpacity } from 'react-native';
// my components
import CustomText from '../display/CustomText';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// colors
import { Colors } from '../../styles/Colors';

const CustomButton = ({ onPress, text, color, icon}) => {

  const backgroundColor = color ? color : Colors.buttonBlue;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, {backgroundColor : backgroundColor}]}>
      {icon && <Ionicons name={icon} size={22} color={Colors.white} style={styles.icon} />}
      <CustomText style={styles.text} text={text} font="bold" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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