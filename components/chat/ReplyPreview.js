import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// my components
import ProfileImg from '../display/ProfileImg';
import CustomText from '../display/CustomText';
// icons
import { Ionicons } from '@expo/vector-icons';
// styles
import { Colors } from '../../styles/Colors';

const ReplyPreview = ({ replyingToMessage, setReplyingToMessage }) => {
    const maxReplyToTextLength = 20; // Maximum length of the reply to text

    // close preview
    closeMessage = () => {
      setReplyingToMessage(null);
    }

    // reply to text
    const replyToText = replyingToMessage.text.length > maxReplyToTextLength ? `${replyingToMessage.text.substring(0, 20)}...` : replyingToMessage.text

    return (
        <View style={replyPreview}>
              
              <ProfileImg profileImg={replyingToMessage.user.avatar} width={40} />

              <View style={{marginLeft: 10}}>
                <CustomText style={styles.replyText} text={`${replyingToMessage.user.first} ${replyingToMessage.user.last}`} font='bold' />
                {(replyingToMessage.image || replyingToMessage.gifUrl) && (
                  <View style={styles.replyImageGifView}>
                    <Image
                      source={{ uri: replyingToMessage.image ? replyingToMessage.image : replyingToMessage.gifUrl}}
                      style={styles.replyImagePreview}
                    />
                    {replyingToMessage.text && (
                      <CustomText style={styles.replyImageText} text={replyToText} />
                    )}
                  </View>
                )}
                {!replyingToMessage.image && !replyingToMessage.gifUrl && (
                  <CustomText style={styles.replyText} text={replyToText} />
                )}
              </View>

              <TouchableOpacity onPress={closeMessage} style={styles.closeMessage}>
                <Ionicons name="close-circle" size={20} color={Colors.gray} />
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
    bottom: 80,
    padding: 15,
    borderRadius: 20,
    margin: 10,
    position: 'absolute',
    zIndex: 1,
  },
  replyImageGifView: {
    flexDirection: 'row', 
    gap: 10
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
  closeMessage: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: 10,
  },
});

export default ReplyPreview;