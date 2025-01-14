import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
// modal
import Modal from "react-native-modal";
// my components
import CustomText from "../../components/display/CustomText";
import CustomButton from "../../components/buttons/CustomButton";
import SettingsSection from "../../components/display/SettingsSection";
// styles
import { useTheme } from "@react-navigation/native";
// functions
import {
  checkMembership,
  getSetRequestsData,
  leaveClubConfirmed,
} from "../../functions/clubFunctions";

const InClubView = ({ navigation, route }) => {
  const { clubData } = route.params;
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState(""); // not used
  const [isLeaveClubModalVisible, setLeaveClubModalVisible] = useState(false);
  const [ requests, setRequests ] = useState(null);

  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Manage Club",
    });
  }, [navigation]);

  // refresh states when you come back to this screen
  useEffect(() => {
    async function fetchData() {
      // get request data
      getSetRequestsData(setRequests, clubData.clubId);
    }

    fetchData();

    // check membership
    checkMembership(clubData.clubId, setCurrentUserPrivilege);
  });

  // go to edit club screen
  const onEditButtonPress = () => {
    navigation.navigate("Edit Club", {
      name: clubData.clubName,
      id: clubData.clubId,
      img: clubData.clubImg,
      publicClub: clubData.publicClub,
      description: clubData.clubDescription,
      categories: clubData.clubCategories,
      publicClub: clubData.publicClub,
    });
  };

  // go to requests screen
  const onRequestsButtonPress = () => {
    navigation.navigate("Requests", {
      clubId: clubData.clubId,
      clubName: clubData.clubName,
    });
  };

  // toggle leave club modal
  const toggleLeaveClubModal = () => {
    setLeaveClubModalVisible(!isLeaveClubModalVisible);
  };

  // get number of requests
  // const getNumRequests = () => {
  //   if (clubData.requests) {
  //     return Object.keys(clubData.requests).length;
  //   } else {
  //     return 0;
  //   }
  // };

  const leaveClub = () => {
    leaveClubConfirmed(clubData.clubId);
    toggleLeaveClubModal();
    navigation.navigate("Home");
  };

  const setttingsData = [
    {
      title: "",
      data: [
        {
          id: 2,
          icon: "person-add-outline",
          text: `Requests (${requests ? requests.length : 0})`,
          onPress: onRequestsButtonPress,
          disabled:
            currentUserPrivilege !== "owner" &&
            currentUserPrivilege !== "admin",
        },
        {
          id: 3,
          icon: "log-out-outline",
          text: "Leave Club",
          color: colors.red,
          onPress: toggleLeaveClubModal,
        },
      ],
    },
  ];

  if (currentUserPrivilege === "owner" || currentUserPrivilege === "admin") {
    setttingsData[0].data.unshift({
      id: 1,
      icon: "create-outline",
      text: "Edit Club",
      onPress: onEditButtonPress,
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.container}
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {clubData === null ? null : <SettingsSection data={setttingsData} />}
      </ScrollView>
      {/* leave club modal */}
      <Modal isVisible={isLeaveClubModalVisible}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <CustomText
            style={[styles.modalText, { color: colors.text }]}
            text="Are you sure you want to leave this club?"
          />
          <View style={styles.modalButtons}>
            <CustomButton text="Yes" onPress={leaveClub} color={colors.bark} />
            <CustomButton
              text="No"
              onPress={toggleLeaveClubModal}
              color={colors.button}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
    flex: 1,
  },
  clubContent: {
    flex: 1,
    marginTop: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    borderWidth: 1,
  },
  clubMembers: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  clubButtons: {
    flex: 1,
    width: "100%",
    marginTop: 0,
    paddingTop: 20,
    gap: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
  },
  separator: {
    height: 1,
    marginVertical: 10,
  },

  // modal styles
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    margin: 20,
    borderRadius: 20,
  },
  modalText: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 80,
    justifyContent: "space-between",
  },
});

export default InClubView;
