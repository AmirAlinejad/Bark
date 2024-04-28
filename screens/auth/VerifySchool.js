import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
// my components
import CustomText from '../../components/display/CustomText';
import CustomButton from '../../components/buttons/CustomButton';
import Header from '../../components/display/Header';
// functions
import { getSetSchoolData } from '../../functions/backendFunctions';
// colors
import { Colors } from '../../styles/Colors';
// linking
import * as Linking from 'expo-linking';

const VerifySchool = ({ navigation }) => {
    const [schoolData, setSchoolData] = useState(null);
    // loading and error handling
    const [loading, setLoading] = useState(false);

    const confirmSchool = () => {
        navigation.navigate("VerifyEmail");
    };

    useEffect(() => {
        // set school data
        getSetSchoolData(setSchoolData, setLoading);
    }, []);

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Verify School" back />
      
      <View style={styles.elements}>
        {loading && <ActivityIndicator size="large" color={Colors.primary} />}
        {!loading &&
        (schoolData ? (
          <View style={styles.content}>

              <CustomText style={styles.text} text={"It looks like you attend " + schoolData.name + "."} />
              <CustomText style={[styles.text, {fontSize: 30}]} font='bold'text={"Go " + schoolData.mascot + schoolData.emoji + "!"} />
              <CustomText style={styles.text} text={"Is this correct? "} />
              <CustomButton text="Confirm" onPress={confirmSchool} />

          </View>
        ) : (
          <View style={styles.content}>

              <CustomText style={styles.text} text="We couldn't verify your school. Please check your email and try again." />
              <CustomText style={styles.text} text="If your school is new to Bark!, please email us and we'd be happy to add it!" />
              <CustomButton text="Email Us" onPress={() => {
                  Linking.openURL('mailto:help.bark.mobile@gmail.com?subject=New%20School%20in%20Bark!&body=Please%20provide%20your%20school%20name%20and%20any%20other%20relevant%20details.');
              }} />
              <CustomButton text="Continue" onPress={confirmSchool} />

          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  elements: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
    marginBottom: 50,
  },
  text: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
});

export default VerifySchool;
