import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// my components
import ProfileImg from '../display/ProfileImg';
import CustomText from '../display/CustomText';
// icons
import { Ionicons } from '@expo/vector-icons';
// styles
import { Colors } from '../../styles/Colors';

const ReplyPreview = ({ replyingToMessage, setReplyingToMessage }) => {
    return (
        <View style={[styles.replyPreview, {bottom: 80 }]}>
              
              <ProfileImg profileImg={replyingToMessage.user.avatar} width={40} />

              <View style={{marginLeft: 10}}>
                <CustomText style={styles.replyText} text={`${replyingToMessage.user.first} ${replyingToMessage.user.last}`} font='bold' />
                {replyingToMessage.image && (
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <Image
                      source={{ uri: replyingToMessage.image }}
                      style={styles.replyImagePreview}
                    />
                    {replyingToMessage.text && (
                      <CustomText style={styles.replyImageText} text={
                        replyingToMessage.text.length > 20 ? `${replyingToMessage.text.substring(0, 17)}...` : replyingToMessage.text
                      } />
                    )}
                  </View>
                )}
                {replyingToMessage.gifUrl && (
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <Image
                      source={{ uri: replyingToMessage.gifUrl }}
                      style={styles.replyImagePreview}
                    />
                    {replyingToMessage.text && (
                      <CustomText style={styles.replyImageText} text={
                        replyingToMessage.text.length > 20 ? `${replyingToMessage.text.substring(0, 17)}...` : replyingToMessage.text
                      } />
                    )}
                  </View>
                )}
                {!replyingToMessage.image && !replyingToMessage.gifUrl && (
                  <CustomText style={styles.replyText} text={
                    replyingToMessage.text.length > 20 ? `${replyingToMessage.text.substring(0, 17)}...` : replyingToMessage.text
                  } />
                )}
              </View>

              <TouchableOpacity onPress={() => setReplyingToMessage(null)} style={{position: 'absolute', top: 0, right: 0, margin: 10}}>
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            </View>
    );
}

const styles = StyleSheet.create({
    // reply
  replyPreview: {
    backgroundColor: Colors.white,
    width: '75%',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 20,
    margin: 10,
    position: 'absolute',
    zIndex: 1,
  },
  replyImagePreview: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginTop: 5,
  },
  replyImageText: {
    color: Colors.black,
    marginBottom: 0,
  },
});

export default ReplyPreview;