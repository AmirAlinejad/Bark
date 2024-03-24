import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
// styles
import { Colors } from "../../styles/Colors";
import { textNormal, title } from "../../styles/FontStyles";
// modal
import SwipeUpDownModal from "react-native-swipe-modal-up-down";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// my components
import CustomText from "../CustomText";
import ProfileImg from "../display/ProfileImg";

const ProfileOverlay = ({ visible, setVisible, userData }) => {
    const [animateModal, setAnimateModal] = useState(false);

    console.log("OVERLAY USER DATA");
    console.log(userData);

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
                        {/* if user data is not loaded, show loading */}
                        {!userData && <CustomText style={styles.userName} text={'Loading...'} />}
                        {/* if user data is loaded, show user data */}
                        {userData && 
                            <View style={styles.profileContainer}>
                                <View style={styles.bar} />
                                <ProfileImg
                                    profileImg={userData.profileImg}
                                    width={80}
                                />
                                <CustomText style={styles.name} text={userData?.firstName + " " + userData?.lastName} font='bold'/>
                                <CustomText style={styles.userName} text={'@'+userData?.userName} font='bold'/>
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 20}}>
                                    <CustomText text={'🎓' + userData?.graduationYear} style={{color: Colors.darkGray, fontSize: 16}} font='bold'/>
                                    <View style={{width: 10}}/>
                                    <CustomText text={userData?.major} style={{color: Colors.darkGray, fontSize: 16}} font='bold'/>
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
  });

export default ProfileOverlay;