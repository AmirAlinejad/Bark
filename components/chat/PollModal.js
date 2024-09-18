import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
// my components
import CustomText from "../display/CustomText";
import ProfileImg from "../display/ProfileImg";
// icons
import { Ionicons } from "@expo/vector-icons";
// colors
import { useTheme } from "@react-navigation/native";

const PollModal = ({ isVisible, onClose, profiles }) => {
  const { colors } = useTheme();

  // convert set of profile images to array
  const profilesArray = Array.from(profiles);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <FlatList
            data={profilesArray}
            renderItem={({ item, index }) => (
              <View style={{ alignItems: "center" }}>
                <View style={styles.userDetails}>
                  <ProfileImg profileImg={item.profileImg} width={50} />
                  <Ionicons
                    name="ticket"
                    size={20}
                    color={colors.button}
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
            showsHorizontalScrollIndicator={false}
            style={{ width: "100%" }}
            contentContainerStyle={{
              minWidth: "100%",
              justifyContent: "center",
            }}
          />
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.lightGray }]}
          >
            <CustomText text="Close" font="bold" />
          </TouchableOpacity>
        </View>
      </View>
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
    width: "80%", // Adjust
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

export default PollModal;
