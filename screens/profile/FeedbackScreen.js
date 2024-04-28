import React, {useState} from "react";
import { View, StyleSheet, TextInput } from 'react-native';
// backend
import { ref, get } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
// my components
import Header from '../../components/display/Header';
import CustomButton from '../../components/buttons/CustomButton';
import CustomText from '../../components/display/CustomText';
// styles
import { Colors } from '../../styles/Colors';

const FeedbackScreen = ({ route, navigation }) => {
    const { userData } = route.params;

    // state for feedback
    const [feedback, setFeedback] = useState('');
    
    const submitFeedback = async () => {
        const emailSplit = userData.email.split('@')[1].split('.')[0];

        const feedbackRef = ref(db, `${emailSplit}feedback/${userData.userId}`);
        const feedbackSnap = await get(feedbackRef);
        const feedbackData = feedbackSnap.val();
        set(feedbackRef, [
            ...feedbackData,
            {
                feedback: feedback,
                name: userData.name,
                email: userData.email,
            }
        ]);
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <Header text='Contact Us' navigation={navigation} back />
            <View style={styles.content}>
                <CustomText text='Please provide feedback on your experience with Bark!'  style={styles.textStyle} />
                <View style={styles.largeInputContainer}>
                    <TextInput
                        placeholder="Please tell us your feedback! (500 characters)"
                        value={feedback}
                        onChangeText={setFeedback}
                        keyboardType="default"
                        maxLength={500}
                        numberOfLines={10}
                        multiline={true}
                        textAlignVertical='top'
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <CustomButton
                        text='Submit'
                        onPress={submitFeedback}
                    />
                </View>
                <CustomText text='Your feedback is important to us!' font='light' />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    largeInputContainer: {
        borderColor: Colors.inputBorder,
        borderWidth: 1,
        borderRadius: 20,
        height: 200,
        padding: 20,
        marginBottom: 20,
    },
    buttonContainer: {
        width: '90%',
        marginBottom: 15,
    },
    textStyle: {
        fontSize: 22,
        marginBottom: 20,
    },
});

export default FeedbackScreen;