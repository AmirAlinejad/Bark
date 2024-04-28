import React from 'react';
// react native components
import { TouchableOpacity, StyleSheet } from 'react-native';
// icons
import Icon from 'react-native-vector-icons/Ionicons';
// colors
import { Colors } from '../../styles/Colors';

const CircleButton = ({ icon, onPress, position, size, color }) => {
  // create button with given position and icon
  const buttonStyle = {
    ...styles.circleButton,
    ...position,
    backgroundColor: color ? color : Colors.red,
    height: 60,
    width: 60,
    borderRadius: 60 / 2,
  };

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
        <Icon name={icon} size={60/2} color="#FFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 25,
    padding: 10,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});

export default CircleButton;