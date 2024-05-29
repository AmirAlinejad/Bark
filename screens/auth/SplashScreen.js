// get auth and deep linking params and navigate to the appropriate screen
import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
// storage
import AsyncStorage from '@react-native-async-storage/async-storage';
// logo
import Logo from '../../assets/logo.png';
// linking
import * as Linking from 'expo-linking';
import { Link } from '@react-navigation/native';
import { goToAdminChatScreen } from '../../functions/navigationFunctions';

// screen
const SplashScreen = ({navigation}) => {

    // navigate to the appropriate screen after 3 seconds
    useEffect(() => {
        setTimeout(() => {

            const asyncFunction = async () => {
                let URL = '';

                // deep linking (get the screen to go to)
                Linking.getInitialURL().then((url) => {
                    if (url) {
                        console.log(`Initial url is: ${url}`);

                        // parse url to get the params
                        const { queryParams } = Linking.parse(url);
                        URL = url;
                        screenName = queryParams.screen;
                    }
                }).catch((err) => console.error('An error occurred', err));

                // see if user is logged in
                const user = await AsyncStorage.getItem('user');

                // if user is signed in, navigate to the home screen, otherwise navigate to the onboarding screens
                if (user) {
                    // does not need auth right now but eventually will save email and password in async storage (update permissions in firebase)
                    // const response = await signInWithEmailAndPassword(auth, email, password);

                    // different cases for different screens
                    if (screenName == 'club') {
                        const { queryParams } = Linking.parse(URL);
                        const clubId = queryParams.clubId;

                        // navigate to the club screen
                        navigation.navigate('Main', { screen: 'HomeScreen' });
                        navigation.navigate('Main', { screen: 'ClubScreen', params: { clubId: clubId, goToHomeScreen: true} });
                    } else if (screenName == 'event') {
                        const { queryParams } = Linking.parse(URL);
                        const eventId = queryParams.eventId;

                        // navigate to the event screen
                        navigation.navigate('Main', { screen: 'HomeScreen' });
                        navigation.navigate('Main', { screen: 'EventScreen', params: { eventId: eventId, goToHomeScreen: true } });
                    } else if (screenName == 'chat') {
                        const { queryParams } = Linking.parse(URL);
                        const chatId = queryParams.chatId;

                        // navigate to the chat screen
                        navigation.navigate('Main', { screen: 'HomeScreen' });
                        navigation.navigate('Main', { screen: 'Chat', params: { chatId: chatId } });
                    } else if (screenName == 'chat') {
                        const { queryParams } = Linking.parse(URL);
                        const chatId = queryParams.chatId;

                        // navigate to the chat screen
                        navigation.navigate('Main', { screen: 'HomeScreen' });
                        navigation.navigate('Main', { screen: 'Chat', params: { chatId: chatId } });
                    } else if (screenName == 'attendance') {
                        const { queryParams } = Linking.parse(URL);
                        const eventId = queryParams.eventId;

                        // navigate to the chat screen
                        navigation.navigate('Main', { screen: 'HomeScreen' });
                        navigation.navigate('Main', { screen: 'EventAttendance', params: { eventId: eventId } });
                    } else {
                        navigation.navigate('Main');
                    }
                } else {
                    navigation.navigate('Onboarding');
                }
            };

            asyncFunction();
           
        }, 1000);
    }, []);
    
    return (
        <View style={styles.screenStyle}>
            <Image source={Logo} style={{width: 200, height: 200}} />
        </View>
    );
}

// styles
const styles = StyleSheet.create({
    screenStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SplashScreen;