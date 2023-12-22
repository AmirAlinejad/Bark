import React from 'react';
// react-native components
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text} from 'react-native-paper';
// my components
import ClubCard from './ClubCard';
// fonts
import { title } from '../../styles/fontstyles';

const ClubCategory = ({name, data, navigation}) => {
    return (
        <View style={styles.clubCategory}>
            <Text style={[styles.title, {marginLeft: 20}]}>{name}</Text>
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
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#D3D3D3',
    },
    clubCategory: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'left',
    },
    title: title,
});

export default ClubCategory;