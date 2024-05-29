import React, { memo } from 'react';
// react native components
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
// my components
import CustomText from '../display/CustomText';
import ClubImg from './ClubImg';
// functions
import { goToChatScreen } from '../../functions/navigationFunctions';
// icons
import { Ionicons } from '@expo/vector-icons';
// colors
import { Colors } from '../../styles/Colors';

// club card displayed on the club list screen
const ChatClubCard = ({ name, description, img, clubId, muted, toggleMute, unreadMessages, lastMessage, lastMessageTime, navigation }) => {
  
  onPress = () => {
    goToChatScreen(name, clubId, img, navigation);
  }

  return (
    <View style={styles.clubCard} >   
      <View style={styles.container}>
        <TouchableOpacity onPress={onPress}>
          <ClubImg clubImg={img} width={100}/>
        </TouchableOpacity>
        
        <View style={styles.cardText}>
          <TouchableOpacity style={styles.nameAndDesc} onPress={onPress}>
              {/* club name and description */}
              <View>
                <CustomText style={styles.textName} text={name} numberOfLines={1} font='bold'/>
                <CustomText style={styles.textNormal} text={lastMessage} numberOfLines={3} />
              </View>
              <CustomText style={styles.timeText} text={lastMessageTime} numberOfLines={1} />
          </TouchableOpacity>

          <View style={styles.cardRight}>
            {/* notification counter */}
            {unreadMessages > 0 &&
              <View style={styles.unreadMessageCircle}>
                <CustomText text={unreadMessages} font='bold' style={styles.notificationCounterText} />
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
    marginVertical: 2, 
    justifyContent: 'space-between',
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
  timeText: {
    fontSize: 15,
    color: Colors.darkGray,
  },
  notificationCounterText: {
    fontSize: 15,
    color: Colors.white,
  }, 
});

export default memo(ChatClubCard);