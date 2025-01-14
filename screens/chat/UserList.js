import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
// modal
import Modal from "react-native-modal";
// my components
import ProfileImg from "../../components/display/ProfileImg";
import CustomText from "../../components/display/CustomText";
import ToggleButton from "../../components/buttons/ToggleButton";
import ProfileOverlay from "../../components/overlays/ProfileOverlay";
import CustomButton from "../../components/buttons/CustomButton";
// Firebase
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig";
// icons
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Ensure react-native-vector-icons is installed
// functions
import {
  fetchClubMembers,
  checkMembership,
  leaveClubConfirmed,
} from "../../functions/clubFunctions";
import { emailSplit } from "../../functions/backendFunctions";
// styles
import { useTheme } from "@react-navigation/native";
// auth
import { auth } from "../../backend/FirebaseConfig";

const UserList = ({ route, navigation }) => {
  const { clubId } = route.params;
  // states
  const [clubMembers, setClubMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrivilege, setSelectedPrivilege] = useState("all");
  const [currentUserId, setCurrentUserId] = useState("none");
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  // overlay
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayUserData, setOverlayUserData] = useState({});
  const [removeMember, setRemoveMember] = useState(null);
  // loading
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Members",
      headerSearchBarOptions: {
        placeholder: "Search Members",
        onChangeText: (event) => {
          setSearchQuery(event.nativeEvent.text);
        },
        hideWhenScrolling: false,
        textColor: colors.text,
      },
    });
  }, [navigation]);

  useEffect(() => {
    fetchClubMembers(clubId, setClubMembers);

    const asyncFunc = async () => {
      // get current user id from async storage
      checkMembership(clubId, setCurrentUserPrivilege);
      setLoading(false);
    };

    asyncFunc();
  }, []);

  const filterMembers = (member) => {
    // filter members by privilege
    if (selectedPrivilege !== "all" && member.privilege !== selectedPrivilege) {
      return false;
    }

    const fullName = `${member.firstName} ${member.lastName}`;
    // filter members by search query
    if (
      !member.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !fullName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // true otherwise
    return true;
  };

  // update filtered members when club members change
  useEffect(() => {
    setFilteredMembers(clubMembers.filter(filterMembers));
  }, [clubMembers, searchQuery, selectedPrivilege]);

  // sets buttons for editing members
  const actionButtonPressed = (member) => {
    const user = auth.currentUser;
    const id = user.uid;
    const buttons = [];
    // Ensure actions cannot be performed on the owner or the current user
    if (member.privilege !== "owner" && member.id !== id) {
      if (
        currentUserPrivilege === "owner" ||
        currentUserPrivilege === "admin"
      ) {
        buttons.push({
          text: "Promote",
          onPress: () => promoteMember(member.id, member.privilege),
        });
      }
      if (currentUserPrivilege === "owner" && member.privilege === "admin") {
        buttons.push({
          text: "Demote",
          onPress: () => demoteMember(member.id, member.privilege),
        });
      }
      if (
        currentUserPrivilege === "owner" ||
        (currentUserPrivilege === "admin" && member.privilege !== "owner")
      ) {
        buttons.push({
          text: "Remove",
          onPress: () => setRemoveMember(member.id),
          style: "destructive",
        });
      }
    }
    // Always allow cancel
    buttons.push({ text: "Cancel", style: "cancel" });

    // Only show alert if there are actions available (more than just the Cancel button)
    if (buttons.length > 1) {
      Alert.alert("Manage Member", member.userName, buttons, {
        cancelable: true,
      });
    }
  };

  const promoteMember = async (memberId, memberPrivilege) => {
    // Assuming memberId is the ID of the member being promoted.
    if (memberPrivilege !== "owner") {
      let newPrivilege = memberPrivilege === "member" ? "admin" : "owner";

      const schoolKey = await emailSplit();

      // Update the member's privilege in the clubMemberData collection
      const memberDocRef = doc(
        firestore,
        "schools",
        schoolKey,
        "clubMemberData",
        "clubs",
        clubId,
        memberId
      );
      await updateDoc(memberDocRef, { privilege: newPrivilege });

      // If promoting to owner, demote the current owner to admin
      if (newPrivilege === "owner") {
        const currentMemberDocRef = doc(
          firestore,
          "schools",
          schoolKey,
          "clubMemberData",
          "clubs",
          clubId,
          currentUserId
        );
        await updateDoc(currentMemberDocRef, { privilege: "admin" });
        setCurrentUserPrivilege("admin");
        Alert.alert(
          "Ownership Transferred",
          `You are now an admin. ${member.userName} is the new owner.`
        );
      } else {
        Alert.alert(
          "Promotion Success",
          `Member has been promoted to ${newPrivilege}.`
        );
      }

      fetchClubMembers(clubId, setClubMembers);
    } else {
      Alert.alert("Error", "This member is already an owner.");
    }
  };

  const demoteMember = async (memberId, memberPrivilege) => {
    let newPrivilege = memberPrivilege === "admin" ? "member" : "admin"; // Simplify for this context

    const schoolKey = await emailSplit();
    const memberDocRef = doc(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      clubId,
      memberId
    );
    await updateDoc(memberDocRef, { privilege: newPrivilege });

    fetchClubMembers(clubId, setClubMembers);
    Alert.alert(
      "Demotion Success",
      `Member has been demoted to ${newPrivilege}.`
    );
  };

  const removeMemberConfirmed = async (memberId) => {
    // Assuming memberId is the ID of the member being removed.
    leaveClubConfirmed(clubId, memberId);

    setTimeout(() => {
      fetchClubMembers(clubId, setClubMembers);
    }, 2000);
    Alert.alert(
      "Removal Success",
      "Member has been successfully removed from the club."
    );
  };

  const renderMember = ({ item }) => {
    return (
      <View style={styles.memberContainer}>
        <View style={styles.memberInfo}>
          <TouchableOpacity
            onPress={() => {
              setOverlayVisible(true);
              setOverlayUserData(item);
            }}
            style={styles.avatarContainer}
          >
            <ProfileImg profileImg={item.profileImg} width={50} />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "75%",
            }}
          >
            <View style={{ flex: 1 }}>
              <CustomText
                style={[styles.memberName, { color: colors.text }]}
                text={`${item.firstName} ${item.lastName}`}
                font="bold"
              />
              <CustomText
                style={[styles.memberPrivilege, { color: colors.textLight }]}
                text={`@${item.userName}`}
              />
            </View>

            <CustomText
              style={[
                styles.memberPrivilege,
                { marginTop: 12, color: colors.textLight },
              ]}
              text={item.privilege}
            />
          </View>
        </View>

        {/* {item.name !== currentUserId && ( */}
        <TouchableOpacity
          onPress={() => actionButtonPressed(item)}
          style={{ marginRight: 5 }}
        >
          <Icon name="dots-vertical" size={24} color={colors.textLight} />
        </TouchableOpacity>
        {/* )} */}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.upperContent}>
          <View style={styles.filterContainer}>
            {["all", "member", "admin", "owner"].map((privilege) => (
              <ToggleButton
                key={privilege}
                text={privilege.charAt(0).toUpperCase() + privilege.slice(1)}
                toggled={selectedPrivilege === privilege}
                onPress={() => setSelectedPrivilege(privilege)}
                toggledCol={colors.bark}
                untoggledCol={colors.gray}
              />
            ))}
          </View>
        </View>

        <View style={styles.separator} />

        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Overlay */}
      <ProfileOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        userData={overlayUserData}
      />

      <Modal isVisible={removeMember !== null}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <CustomText
            style={{ ...styles.modalText, color: colors.text }}
            text="Are you sure you want to remove this user from the club?"
          />
          <View style={styles.modalButtons}>
            <CustomButton
              text="Yes"
              onPress={() => {
                removeMemberConfirmed(removeMember);
                setRemoveMember(null);
              }}
              color={colors.bark}
            />
            <CustomButton
              text="No"
              onPress={() => setRemoveMember(null)}
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
    flex: 1,
  },
  searchBarView: {
    margin: 15,
    marginTop: 5,
    marginBottom: 15,
  },
  upperContent: {
    justifyContent: "flex-start",
    paddingTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingBottom: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  filterText: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    width: "95%",
    marginRight: 20,
  },
  memberContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  memberInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  memberPrivilege: {
    fontSize: 16,
    marginRight: -5,
    textTransform: "capitalize",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },

  // Swipeable
  rightAction: {
    backgroundColor: "red",
    justifyContent: "center",
    paddingHorizontal: 20,
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

export default UserList;
