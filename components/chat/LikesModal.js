import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
// my components
import CustomText from "../display/CustomText";
import ProfileImg from "../display/ProfileImg";
// icons
import { Ionicons } from "@expo/vector-icons";
// colors
import { useTheme } from "@react-navigation/native";

const LikesModal = ({ isVisible, onClose, profiles }) => {
  const { colors } = useTheme();

  // convert set of profile images to array
  const profilesArray = Array.from(profiles);

  console.log(profilesArray);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <FlatList
            data={profilesArray}
            renderItem={({ item, index }) => (
              <View style={{ alignItems: "center" }}>
                <View style={styles.userDetails}>
                  <ProfileImg profileImg={item.profileImg} width={50} />
                  <Ionicons
                    name="heart"
                    size={20}
                    color={colors.red}
                    style={styles.heartIcon}
                  />
                </View>
                <CustomText
                  text={item.firstName + " " + item.lastName[0]}
                  style={{ marginTop: 8, fontSize: 16, color: colors.text }}
                />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            horizontal={true}
          />
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.lightGray }]}
          >
            <CustomText text="Close" font="bold" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    alignItems: "center",
    width: "90%", // Adjust
    margin: 20,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userNameText: {
    fontSize: 18,
  },
  userDetails: {
    padding: 5,
  },
  closeButton: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  heartIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});

export default LikesModal;
