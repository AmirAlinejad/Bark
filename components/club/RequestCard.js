// card for accepting or rejecting club requests
import React from 'react';
// react-native components
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// my components
import CustomText from '../display/CustomText';
import ProfileImg from '../display/ProfileImg';
// icons
import Ionicon from 'react-native-vector-icons/Ionicons';
// colors
import { Colors } from '../../styles/Colors';
import IconButton from '../buttons/IconButton';

const RequestCard = ({ item, onPressAccept, onPressDecline }) => {

    console.log('item', item);

    return (
        <View style={styles.container}>
            <ProfileImg profileImg={item.userPhoto} width={50} />
            <View style={styles.cardContent}>
                <View style={{flex: 1, marginLeft: 20}}>
                    <CustomText style={styles.memberName} font='bold'text={item.userFirstName + ' ' + item.userLastName} />
                    <CustomText style={styles.memberPrivilege} font='bold' text={`@${item.userName}`} />
                </View>

                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={onPressAccept} style={styles.greenCircle}>
                        <Ionicon name="checkmark" size={20} color={Colors.white} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={onPressDecline} style={styles.redCircle}>
                        <Ionicon name="close" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 20,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
    },
    memberName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
      },
      memberPrivilege: {
        fontSize: 16,
        color: Colors.darkGray,
        marginRight: -5,
        textTransform: 'capitalize',
      },
      greenCircle: {
        backgroundColor: Colors.green,
        borderRadius: 50,
        padding: 10,
        margin: 5,
      },
    redCircle: {
        backgroundColor: Colors.red,
        borderRadius: 50,
        padding: 10,
        margin: 5,
    },
});

export default RequestCard;