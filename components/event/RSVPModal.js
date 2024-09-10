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
import CustomButton from "../buttons/CustomButton";
// icons
import { Ionicons } from "@expo/vector-icons";
// colors
import { useTheme } from "@react-navigation/native";

const RSVPModal = ({ isVisible, setVisible, rsvpProfileData }) => {
  const { colors } = useTheme();
  // change to make users contain usernames and profile pictures
  console.log("RSVP Profile Data: ", rsvpProfileData);

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <FlatList
            data={rsvpProfileData}
            keyExtractor={(item) => item.id}
            style={{ width: "100%", maxHeight: 300 }}
            renderItem={({ item }) => (
              <View style={styles.userDetails}>
                <ProfileImg
                  profileImg={item.profileImg}
                  width={50}
                  editable={false}
                />
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <CustomText
                    style={styles.userNameText}
                    font={"bold"}
                    text={item.first + " " + item.last}
                  />
                  {/* checkmark icon */}
                  <Ionicons
                    name="checkmark-circle"
                    size={28}
                    color={colors.green}
                  />
                </View>
              </View>
            )}
          />
          <CustomButton
            text="Close"
            onPress={() => setVisible(false)}
            color={colors.gray}
            textColor={colors.text}
          />
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
    padding: 8,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

export default RSVPModal;
