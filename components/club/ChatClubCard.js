import React from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
// my components
import CustomText from '../display/CustomText';
import ClubImg from './ClubImg';
// icons
import { Ionicons } from '@expo/vector-icons';
// colors
import { Colors } from '../../styles/Colors';

// club card displayed on the club list screen
const ClubCard = ({ onPress, name, description, img, muted, toggleMute, unreadMessages }) => {

  console.log('unreadMessages', unreadMessages)
  
  return (
    <View style={styles.clubCard} >   
      <View style={styles.container}>
        <TouchableOpacity onPress={onPress}>
          <ClubImg clubImg={img} width={100}/>
        </TouchableOpacity>
        
        <View style={styles.cardText}>
          <TouchableOpacity style={styles.nameAndDesc} onPress={onPress}>
            <View >
              {/* club name and description */}
              <CustomText style={styles.textName} text={name} numberOfLines={1} font='bold'/>
              <CustomText style={styles.textNormal} text={description} numberOfLines={3} />
            </View> 
          </TouchableOpacity>

          <View style={styles.cardRight}>
            {/* notification counter */}
            {unreadMessages > 0 &&
              <View style={styles.unreadMessageCircle}>
                <CustomText text={unreadMessages} font='bold' style={{color: Colors.white}} />
              </View>
            }
            {/* mute button */}
            <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
              <Ionicons name={muted ? "notifications-off-outline" : "notifications-outline"} size={25} color={Colors.black} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  clubCard: {
    marginBottom: 15,
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
    flex: 1,
  },
  cardText: {
    flex: 1,
    height: 100,
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  nameAndDesc: {
    flex: 1,
    flexDirection: 'column',
    height: 100,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  unreadMessageCircle: {
    backgroundColor: Colors.red, 
    borderRadius: 15, 
    padding: 5, 
    marginRight: 0, 
    width: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 8,
  },
  muteButton: {
    padding: 0,
  },
  textName: {
    fontSize: 20,
    marginBottom: 0,
  },
  textNormal: {
    fontSize: 15,
  },
});

export default ClubCard;