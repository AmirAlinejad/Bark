import React from 'react';
// react native components
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
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
          <Text style={[styles.textNormal, {marginBottom: 0}]} numberOfLines={1}>{name}</Text>
          <Text style={styles.textNormal} numberOfLines={1}>{description}</Text>
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