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
      <View style={styles.container}>
        <ClubImg clubImg={img} width={100}/>
        
        <View> 
          <CustomText style={styles.textName} text={name} numberOfLines={1} font='bold'/>
          <CustomText style={styles.textNormal} text={description} numberOfLines={3} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clubCard: {
    padding: 0,
    borderRadius: 10,
    shadowColor: '#0010',
    width: '100%',
    marginBottom: 15,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 15,
  },
  title: title,
  textName: {
    ...textNormal,
    fontSize: 20,
    marginBottom: 0,
  },
  textNormal: {
    ...textNormal,
    fontSize: 15,
  },
});

export default ClubCard;