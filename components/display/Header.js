import React from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// my components
import CustomText from './CustomText';
import ClubImg from '../club/ClubImg';
// icon
import Ionicons from 'react-native-vector-icons/Ionicons';

const Header = ({ navigation, text, back, onBack, useClubImg, clubImg, onTextPress, goToHomeScreen }) => {

  // go back to the previous screen
  const onBackPress = () => {
    if (onBack) {
      onBack();
    } else if (goToHomeScreen) {
      navigation.navigate('HomeScreen');
    } else {
      navigation.goBack();
    }
  }

  const fontSize = useClubImg ? 24 : 28;

  return (
    <View style={styles.container}>

      {// if back is true, show the back button
        back && (
        <TouchableOpacity style={styles.back} onPress={onBackPress}>
          <Ionicons name="chevron-back" size={32} color="black" />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity onPress={onTextPress ? onTextPress : () => {}} style={{flexDirection: 'row'}}>
        {useClubImg && 
        <View style={{marginTop: 10, marginRight: 10, marginLeft: 10}} >
          <ClubImg clubImg={clubImg} width={40} />
        </View>
        }

        <CustomText style={[styles.title, { fontSize: fontSize }]} font='black' numberOfLines={1} text={text} />
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginLeft: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  back: {
    marginRight: 10,
    marginTop: 13,
  },
  title: {
    textAlign: 'left',
    textAlignVertical: 'center',
    paddingTop: 12,
    width: 210,
  },
});

export default Header;