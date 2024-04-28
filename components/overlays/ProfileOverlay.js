import React from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
// styles
import { Colors } from "../../styles/Colors";
// modal
import SwipeUpDownModal from 'react-native-swipe-modal-up-down';
// my components
import CustomText from "../display/CustomText";
import ProfileImg from "../display/ProfileImg";

const ProfileOverlay = ({ visible, setVisible, userData }) => {

    const graduationYear = () => {
        if (userData.graduationYear) {
            return '🎓' + userData.graduationYear;
        } else {
            return '';
        }
    }

    const major = () => {
        if (userData.major) {
            return userData.major;
        } else {
            return '';
        }
    }

    
    return (
        <SwipeUpDownModal
            modalVisible={visible} 
            pressToanimate={visible}
            onClose={() => {
                setVisible(false);
            }}
            ContentModal={
                <TouchableWithoutFeedback>
                    <View style={styles.modal}>
                        <View style={styles.modalContent}>
                            {userData && 
                                <View style={styles.profileContainer}>
                                    <View style={styles.bar} />
                                    <ProfileImg
                                        profileImg={userData.profileImg}
                                        width={80}
                                    />
                                    <CustomText style={styles.name} text={userData.firstName + " " + userData.lastName} font='bold'/>
                                    <CustomText style={styles.userName} text={'@'+userData.userName} font='bold'/>
                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 80, marginTop: 20}}>
                                        {graduationYear() != '' && <CustomText text={graduationYear()} style={styles.secondaryText} font='bold'/>}
                                        {major() != '' && <CustomText text={major()} style={styles.secondaryText} font='bold'/>}
                                    </View>
                            </View>}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            }
        />
    );
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        marginTop: 500,
        alignItems: 'center',
    },
    modalContent: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: 30,
    },
    bar: {
        width: 80,
        height: 5,
        backgroundColor: Colors.lightGray,
        borderRadius: 5,
        marginTop: 20,
        marginBottom: 30,
    },
    profileContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    name: {
        fontSize: 24,
        color: Colors.black,
    },
    userName: {
        fontSize: 16,
        color: Colors.darkGray,
    },
    secondaryText: {
        fontSize: 16,
        color: Colors.darkGray,
    }
  });

export default ProfileOverlay;