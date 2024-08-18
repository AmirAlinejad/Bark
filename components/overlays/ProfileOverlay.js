import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
// functions
import { getSetUserData } from "../../functions/backendFunctions";
// styles
import { useTheme } from "@react-navigation/native";
// modal
import SwipeUpDownModal from "react-native-swipe-modal-up-down";
// my components
import CustomText from "../display/CustomText";
import ProfileImg from "../display/ProfileImg";

const ProfileOverlay = ({ visible, setVisible, userData }) => {
  const { colors } = useTheme();
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
            <View
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              {userData && (
                <View style={styles.profileContainer}>
                  <View
                    style={[styles.bar, { backgroundColor: colors.gray }]}
                  />
                  <ProfileImg profileImg={userData.profileImg} width={80} />
                  <View style={{ height: 8 }} />
                  <CustomText
                    style={[styles.name, { color: colors.text }]}
                    text={userData.firstName + " " + userData.lastName}
                    font="bold"
                  />
                  <CustomText
                    style={[styles.userName, { color: colors.textLight }]}
                    text={"@" + userData.userName}
                    font={"bold"}
                  />
                  <View style={[styles.info, { color: colors.textLight }]}>
                    {graduationYear() !== "" && (
                      <CustomText
                        text={graduationYear()}
                        style={[
                          styles.secondaryText,
                          { color: colors.textLight },
                        ]}
                      />
                    )}
                    {major() !== "" && (
                      <CustomText
                        text={major()}
                        style={[
                          styles.secondaryText,
                          { color: colors.textLight },
                        ]}
                      />
                    )}
                  </View>
                  <CustomText
                    text={`${getMutualClubs().length} Mutual Club(s)`}
                    style={[styles.secondaryText, { color: colors.textLight }]}
                  />
                  <View style={{ height: 16 }} />
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
    alignItems: "center",
    justifyContent: "flex-start",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bar: {
    width: 80,
    height: 5,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 30,
  },
  profileContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  info: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
    marginVertical: 12,
  },
  name: {
    fontSize: 24,
  },
  userName: {
    fontSize: 16,
  },
  secondaryText: {
    fontSize: 16,
  },
});

export default ProfileOverlay;
