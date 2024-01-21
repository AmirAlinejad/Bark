import React from 'react';
// react native components
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
// my components
import CustomText from '../CustomText';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

// club card displayed on the club list screen
const ClubCard = ({ onPress, name, description, img }) => {
  
  return (
    <Pressable style={styles.clubCard} mode='elavated' onPress={onPress}>   
      <View style={styles.container}>
        <View> 
          <Avatar.Image size={80} source={{uri: img}} />
        </View>
        
        <View> 
          <CustomText style={[styles.textNormal, {marginBottom: 0}]} text={name} font='bold'/>
          <CustomText style={styles.textNormal} numberOfLines={1} text={description} />
        </View>
      </View>   
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clubCard: {
    padding: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    shadowColor: '#0010',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  title: title,
  textNormal: textNormal,
});

export default ClubCard;