import React from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// my components
import CustomText from '../display/CustomText';
import ClubImg from './ClubImg';

// club card displayed on the club list screen
const ClubCard = ({ onPress, name, description, img }) => {
  
  return (
    <TouchableOpacity style={styles.clubCard} onPress={onPress} >   
      <ClubImg clubImg={img} width={100}/>
      <CustomText text={name} numberOfLines={1} font='bold'/>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clubCard: {
    borderRadius: 10,
    width: 100,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 5,
    marginBottom: 10,
  },
});

export default ClubCard;