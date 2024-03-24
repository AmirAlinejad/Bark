<<<<<<< HEAD
import React from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
// my components
import CustomText from '../CustomText';
import ClubImg from './ClubImg';

// fonts
import { textNormal, title} from '../../styles/FontStyles';

// club card displayed on the club list screen
const ClubCard = ({ onPress, name, description, img }) => {
  
  return (
    <TouchableOpacity style={styles.clubCard} onPress={onPress} >   
      <ClubImg clubImg={img} width={100}/>
      
      <View> 
        <CustomText style={styles.textNormal} text={name} numberOfLines={1} font='bold'/>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clubCard: {
    borderRadius: 10,
    width: 100,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: title,
  textNormal: textNormal,
});

=======
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

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default ClubCard;