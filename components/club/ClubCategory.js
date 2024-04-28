import React from 'react';
// react-native components
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
// my components
import ClubCard from './ClubCard';
import CustomText from '../display/CustomText';
// colors
import { Colors } from '../../styles/Colors';
// functions
import { goToClubScreen } from '../../functions/navigationFunctions';

const ClubCategory = ({name, data, navigation}) => {
    return (
        <View style={styles.clubCategory}>
            <CustomText style={styles.title} font="bold" text={name} />
            <FlatList
                data={data}
                renderItem={({item}) => (
                    <ClubCard  
                        onPress={() => goToClubScreen(item, navigation)} 
                        name={item.clubName} 
                        description={item.clubDescription} 
                        img={item.clubImg} 
                    />
                )}
                ItemSeparatorComponent={() => <View style={{width: 12}} />}
                keyExtractor={item => item.clubId}
                horizontal={true}
            />
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
    title: {
        fontSize: 20,
        marginBottom: 10,
    }
});

export default ClubCategory;