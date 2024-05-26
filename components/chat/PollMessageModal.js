// vote and show results of poll
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
// components
import CustomInput from '../input/CustomInput';
import CustomText from '../display/CustomText';
// backend
import { auth, firebase } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
// swipe up down modal
import SwipeUpDownModal from 'react-native-swipe-modal-up-down';
// colors
import { Colors } from '../../styles/Colors';

const PollMessageModal = ({ isVisible, onClose, schoolKey, clubId, chatName, message, messageRef }) => {
    const [voted, setVoted] = useState(false);

    // update voted
    useEffect(() => {
        
        // async function to update voted
        const updateVoted = async () => {
            // Get the user's ID
            const userId = auth.currentUser.uid;

            // Check if the user has voted
            const userVoted = message.voters.includes(userId);
            setVoted(userVoted);
        }

        // Call the async function
        updateVoted();
    }, [message]);

    // vote on an option
    const vote = async (option) => {
        // Get the user's ID
        const userId = auth.currentUser.uid;

        // add vote and voters to the message
        await updateDoc(messageRef, {
            votes: [...message.votes, option.id],
            voters: [...message.voters, userId],
        });
    }


    // Render result item (show percentage of votes for each option)
    const renderResultItem = ({ item }) => {
        return (
            <View style={styles.option}>
                <CustomText style={styles.optionText} text={item.text} />
            </View>
        );
    }

    // render vote item (show options to vote on)
    const renderVoteItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.option}>
                <CustomText style={styles.optionText} text={item.text} />
            </TouchableOpacity>
        );
    }
    
    return (
        <SwipeUpDownModal
        modalVisible={isVisible} 
        pressToanimate={isVisible}
        onClose={onClose}
        ContentModal={
        <TouchableWithoutFeedback style={styles.overlay} onPress={onClose}>
            <View style={styles.modal}>
                <View style={styles.bar} />
                {/* Title */}
                <CustomText style={styles.optionText} text={message.question} />

                {/* List of results */}
                <FlatList
                    data={message.options}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />

                {/* if not voted, show vote options */}
                {!voted &&
                <FlatList
                    data={message.options}
                    renderItem={renderVoteItem}
                    keyExtractor={(item) => item.id}
                />
                }
                    
                {/* if voted, show results */}
                {voted &&
                <FlatList
                    data={options}
                    renderItem={renderResultItem}
                    keyExtractor={(item) => item.id}
                />
                }

                
            </View>
        </TouchableWithoutFeedback>
        }
        />
    );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.white,
    width: '100%',
    marginTop: '135%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  bar: {
    width: 50,
    height: 5,
    backgroundColor: Colors.lightGray,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  optionText: {
    fontSize: 18,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 15,
  },
  cancelButtonText: {
    fontSize: 18,
    color: Colors.red,
  },
});

export default PollMessageModal;