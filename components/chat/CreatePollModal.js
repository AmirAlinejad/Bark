import React, { useState } from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
// components
import CustomInput from '../input/CustomInput';
import CustomText from '../display/CustomText';
// swipe up down modal
import SwipeUpDownModal from 'react-native-swipe-modal-up-down';
// colors
import { Colors } from '../../styles/Colors';

const CreatePollModal = ({ isVisible, onClose, schoolKey, clubId, chatName }) => {
    const [questionText, setQuestionText] = useState('');
    const [newOptionText, setNewOptionText] = useState('');
    // const [editingOption, setEditingOption] = useState(null);
    // const [editingText, setEditingText] = useState('');
    const [options, setOptions] = useState([]);

    // Add option
    const onAddOption = () => {
        if (newOptionText) {
            setOptions([...options, { id: options.length.toString(), text: newOptionText }]);
            setNewOptionText('');
        }
    };

    // Post
    const onPost = () => {
        // Post question and options
        console.log(questionText);
        console.log(options);
        onClose();
    }

    // send poll message
    const sendPoll = useCallback(async () => {

        // Check if there's a question and at least two options
        if (questionText.trim() !== '' || options.length >= 2) {
            try {
                // Create the sender object
                const sender = {
                _id: auth.currentUser.uid,
                name: userData.userName,
                first:  userData.firstName,
                last: userData.lastName,
                };
                if (userData.profileImg) {
                sender.avatar = userData.profileImg;
                }

                // Create the message object
                const message = {
                    _id: Math.random().toString(36).substring(7),
                    createdAt: new Date().getTime(),
                    sender,
                    question: questionText.trim(),
                    options,
                    votes: [],
                    voters: [],
                };

                // Add the message to Firestore
                await addDoc(collection(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'chats', chatName), message);

                // say "sent an image" if no text
                const notificationText = "sent a poll";

                // do for all members in club (if not muted)
                const clubMembersCollection = collection(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId);
                const clubMembers = await getDocs(clubMembersCollection);
                // loop through all members in the club
                for (const member of clubMembers.docs) {
                    /*if (!member.data().muted && member.id !== auth.currentUser.uid) {
                        // get the member's data
                        const memberData = await getDoc(doc(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'members', member.id));
                        const memberDataVal = memberData.data();
                        // send the push notification
                        sendPushNotification(memberDataVal.expoPushToken, notificationText, userData.firstName, userData.lastName, clubName);
                    }*/

                    // increment unread messages in club member's data
                    const memberRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, member.id);
                    const memberSnapshot = await getDoc(memberRef);
                    const memberData = memberSnapshot.data();
                    const unreadMessages = memberData.unreadMessages + 1;

                    await updateDoc(memberRef, { unreadMessages });
                }

            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }, [messageText, imageUrl, gifUrl]); // Include gifUrl in the dependency array

    // Cancel
    const onCancel = () => {
        onClose();
    }

    // Render item
    const renderItem = ({ item }) => {
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
                <CustomInput
                    placeholder="Ask a question"
                    style={styles.input}
                    onChangeText={setQuestionText}
                    value={questionText}
                />

                {/* List of options */}
                <FlatList
                    data={options}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    // footer - add option
                />

                {/* Create option */}
                <TouchableOpacity style={styles.option} onPress={onAddOption}>
                    <CustomInput
                        placeholder="Add option"
                        style={styles.input}
                        onChangeText={setNewOptionText}
                        value={newOptionText}
                    />
                    <TouchableOpacity style={styles.addOptionButton} onPress={onAddOption}>
                        <CustomText style={styles.addOptionButtonText} text="Add" />
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* Post button */}
                <TouchableOpacity style={styles.option} onPress={onPost}>
                    <CustomText style={styles.optionText} text="Post" />
                </TouchableOpacity>

                {/* Cancel button */}
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <CustomText style={styles.cancelButtonText} text="Cancel" />
                </TouchableOpacity>
                
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

export default CreatePollModal;
