import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// backend
import { ref, get } from "firebase/database";
import { db } from "../../backend/FirebaseConfig";
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
    const emailSplit = userData.email.split("@")[1].split(".")[0];

    const feedbackRef = ref(db, `${emailSplit}feedback/${userData.userId}`);
    const feedbackSnap = await get(feedbackRef);
    const feedbackData = feedbackSnap.val();
    set(feedbackRef, [
      ...feedbackData,
      {
        feedback: feedback,
        name: userData.name,
        email: userData.email,
      },
    ]);
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
            style={styles.input}
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
