import React from 'react';
// react native components
import { TouchableOpacity, StyleSheet } from 'react-native';
// icons
import Icon from 'react-native-vector-icons/Ionicons';
// colors
import { Colors } from '../../styles/Colors';

const CircleButton = ({ icon, onPress, position, size }) => {
  // create button with given position and icon
  const buttonStyle = {
    ...styles.circleButton,
    ...position,
    height: size,
    width: size,
    borderRadius: size / 2,
  };

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
        <Icon name={icon} size={size/2} color="#FFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleButton: {
    backgroundColor: Colors.red,
    position: 'absolute',
    margin: 25,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
});

export default CircleButton;