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

export default ClubCategory;