import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CircleButton = ({ icon, onPress, position }) => {
  const buttonStyle = {
    ...styles.circleButton,
    ...position,
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={buttonStyle}>
        <Icon name={icon} size={30} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleButton: {
    backgroundColor: '#FF5028',
    padding: 10,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
});

export default CircleButton;