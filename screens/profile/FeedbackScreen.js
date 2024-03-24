import React from "react";
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
// backend
import { ref, get } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
import { getAuth } from 'firebase/auth';
// my components
import Header from '../../components/Header';
import CustomButton from '../../components/CustomButton';
// styles
import { Colors } from '../../styles/Colors';

const FeedbackScreen = ({ route, navigation }) => {
    const [feedback, setFeedback] = useState('');
    
    const submitFeedback = async () => {
        const user = getAuth().currentUser;
        const userId = user.uid;
        const userRef = ref(db, `users/${userId}`);
        const userSnap = await get(userRef);
        const userData = userSnap.val();
        const feedbackRef = ref(db, `feedback/${userId}`);
        const feedbackSnap = await get(feedbackRef);
        const feedbackData = feedbackSnap.val();
        set(ref(db, `feedback/${userId}`), [
            ...feedbackData,
            {
                feedback: feedback,
                name: userData.name,
                email: userData.email,
            }
        ]);
        navigation.navigate('Profile');
    }

    return (
        <View style={styles.container}>
            <Header title='Feedback' navigation={navigation} />
            <View>
                <CustomText style={styles.textNormal} font="bold" text="Details" />
                <View style={styles.largeInputContainer}>
                <TextInput
                    placeholder="Please tell us your feedback!"
                    value={feedback}
                    onChangeText={setFeedback}
                    keyboardType="default"
                    maxLength={500}
                    numberOfLines={5}
                    multiline={true}
                    textAlignVertical='top'
                />
                </View>
                <CustomButton
                    title='Submit Feedback'
                    onPress={submitFeedback}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    largeInputContainer: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        height: 100,
        width: '90%',
        padding: 15,
        marginBottom: 20,
    },
});

export default FeedbackScreen;