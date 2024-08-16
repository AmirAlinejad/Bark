import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// backend
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig";
import { emailSplit } from "../../functions/backendFunctions";
// my components
import Header from "../../components/display/Header";
import CustomButton from "../../components/buttons/CustomButton";
import CustomText from "../../components/display/CustomText";
// styles
import { useTheme } from "@react-navigation/native";

const FeedbackScreen = ({ route, navigation }) => {
  const { userData } = route.params;

  const { colors } = useTheme();

  // state for feedback
  const [feedback, setFeedback] = useState("");

  const submitFeedback = async () => {
    if (feedback === "") {
      alert("Please enter feedback before submitting.");
      return;
    }

    const schoolKey = await emailSplit();
    // get feedback collection
    const feedbackRef = doc(
      firestore,
      "schools",
      schoolKey,
      "feedback",
      userData.id
    );

    // get feedback document
    const feedbackDoc = await getDoc(feedbackRef);

    // if feedback document exists, update it
    if (feedbackDoc.exists()) {
      await updateDoc(feedbackRef, {
        feedback: [...feedbackDoc.data().feedback, feedback],
      });
    } else {
      // if feedback document does not exist, create it
      await setDoc(feedbackRef, {
        feedback: [feedback],
      });
    }

    setFeedback("");

    // navigate back
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ marginHorizontal: 20 }}
      >
        <CustomText
          text="Please provide feedback on your experience with Bark!"
          style={[styles.textStyle, { color: colors.text }]}
        />

        <View
          style={[styles.inputContainer, { borderColor: colors.inputBorder }]}
        >
          <TextInput
            placeholder="Please tell us your feedback! (200 characters)"
            value={feedback}
            onChangeText={setFeedback}
            keyboardType="default"
            maxLength={200}
            numberOfLines={5}
            style={[{ color: colors.text }]}
            multiline={true}
            textAlignVertical="top"
            placeholderTextColor={colors.textLight}
          />
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton text="Submit" onPress={submitFeedback} width={90} />
        </View>
        <CustomText text="Your feedback is important to us!" font="light" />
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  largeInputContainer: {
    borderWidth: 1,
    borderRadius: 20,
    height: 200,
    padding: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    width: "90%",
    marginBottom: 15,
  },
  textStyle: {
    fontSize: 18,
    marginBottom: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    height: 100,
    width: "90%",
    padding: 15,
    marginBottom: 20,
  },
});

export default FeedbackScreen;
