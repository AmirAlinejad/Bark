<<<<<<< HEAD
import React from 'react';
// react-native components
import { View, StyleSheet, ScrollView } from 'react-native';
// my components
import ClubCard from './ClubCard';
import CustomText from '../CustomText';
// fonts
import { title } from '../../styles/FontStyles';

const ClubCategory = ({name, data, navigation}) => {
    return (
        <View style={styles.clubCategory}>
            <CustomText style={[styles.title, {marginLeft: 1}]} font="bold" text={name} />
            <ScrollView contentContainerStyle={{ gap: 10, width: '100%' }} horizontal>
            {
                // map through the club data and display each club
                data.map((item, index) => {
                    const onPress = () => {
                        // Navigate to the sign-up screen
                        navigation.navigate("ClubScreen", {
                            name: item.clubName,
                            id: item.clubId,
                            description: item.clubDescription,
                            categories: item.clubCategories,
                            img: item.clubImg,
                            events: item.events,
                            members: item.clubMembers,
                        });
                    }

                    return (
                        <ClubCard key={index} onPress={onPress} name={item.clubName} description={item.clubDescription} img={item.clubImg} />
                    )
                })
            }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    clubCategory: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    rightButtonView: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: 30,
      },
    title: title,
});

=======
import React from 'react';
// react-native components
import { View, StyleSheet, ScrollView } from 'react-native';
// my components
import ClubCard from './ClubCard';
import CustomText from '../CustomText';
// fonts
import { title } from '../../styles/FontStyles';

const ClubCategory = ({name, data, navigation}) => {
    return (
        <View style={styles.clubCategory}>
            <CustomText style={[styles.title, {marginLeft: 20}]} text={name} />
            <ScrollView horizontal={true}>
            {
                // map through the club data and display each club
                data.map((item, index) => {
                const onPress = () => {
                    // Navigate to the sign-up screen
                    navigation.navigate("ClubScreen", {
                        name: item.clubName,
                        description: item.clubDescription,
                        categories: item.clubCategories,
                        img: item.clubImg,
                        events: item.events,
                    });
                }

                return (
                    <View key={index}>
                        <ClubCard onPress={onPress} name={item.clubName} description={item.clubDescription} img={item.clubImg} />
                    </View>
                )   
                })
            }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    clubCategory: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'left',
    },
    title: title,
});

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default ClubCategory;