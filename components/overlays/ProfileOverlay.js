import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
// functions
import { getSetUserData } from "../../functions/backendFunctions";
// styles
import { Colors } from "../../styles/Colors";
// modal
import SwipeUpDownModal from "react-native-swipe-modal-up-down";
// my components
import CustomText from "../display/CustomText";
import ProfileImg from "../display/ProfileImg";

const ProfileOverlay = ({ visible, setVisible, userData }) => {
  // get current user data
  const [currentUserData, setCurrentUserData] = useState(null);

  // get current user data
  useEffect(() => {
    const asyncFunc = async () => await getSetUserData(setCurrentUserData);
    asyncFunc();
  }, []);

  const graduationYear = () => {
    if (userData.graduationYear) {
      return "🎓" + userData.graduationYear;
    } else {
      return "";
    }
  };

  const major = () => {
    if (userData.major) {
      return userData.major;
    } else {
      return "";
    }
  };

  const closeOverlay = () => {
    setVisible(false);
  };

  const getMutualClubs = () => {
    // get user's clubs
    if (!userData || !currentUserData) {
      return [];
    }
    let userClubs = userData.clubs;
    // get current user's clubs
    let currentUserClubs = currentUserData.clubs;

    if (!userClubs || !currentUserClubs) {
      return [];
    }
    // find mutual clubs
    let mutualClubs = userClubs.filter((value) =>
      currentUserClubs.includes(value)
    );
    return mutualClubs;
  };

  return (
    <SwipeUpDownModal
      modalVisible={visible}
      pressToanimate={visible}
      onClose={closeOverlay}
      ContentModal={
        <TouchableWithoutFeedback>
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              {userData && (
                <View style={styles.profileContainer}>
                  <View style={styles.bar} />
                  <ProfileImg profileImg={userData.profileImg} width={80} />
                  <CustomText
                    style={styles.name}
                    text={userData.firstName + " " + userData.lastName}
                    font="bold"
                  />
                  <CustomText
                    style={styles.userName}
                    text={"@" + userData.userName}
                    font={"bold"}
                  />
                  <View style={styles.info}>
                    {graduationYear() != "" && (
                      <CustomText
                        text={graduationYear()}
                        style={styles.secondaryText}
                      />
                    )}
                    {major() != "" && (
                      <CustomText text={major()} style={styles.secondaryText} />
                    )}
                  </View>
                  <CustomText
                    text={`${getMutualClubs().length} Mutual Club(s)`}
                    style={styles.secondaryText}
                  />
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      }
    />
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    marginTop: 500,
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "flex-start",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    alignItems: "center",
    justifyContent: "flex-start",
  },
  info: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
    marginBottom: 20,
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
  },
});

export default ProfileOverlay;
