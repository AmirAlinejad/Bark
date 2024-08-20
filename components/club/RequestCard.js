// card for accepting or rejecting club requests
import React from "react";
// react-native components
import { View, StyleSheet, TouchableOpacity } from "react-native";
// my components
import CustomText from "../display/CustomText";
import ProfileImg from "../display/ProfileImg";
// icons
import Ionicon from "react-native-vector-icons/Ionicons";
// colors
import { useTheme } from "@react-navigation/native";

const RequestCard = ({ item, onPressAccept, onPressDecline }) => {

  const { colors } = useTheme();

  console.log(item);

  return (
    <View style={styles.container}>
      <ProfileImg profileImg={item.profileImg} width={50} />
      <View style={styles.cardContent}>
        <View style={{ flex: 1, marginLeft: 20 }}>
          <CustomText
            style={styles.memberName}
            font="bold"
            text={item.firstName + " " + item.lastName}
          />
          <CustomText
            style={[styles.memberPrivilege, { color: colors.textLight }]}
            font="bold"
            text={`@${item.userName}`}
          />
        </View>

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={onPressAccept}
            style={[styles.greenCircle, { backgroundColor: colors.green }]}
          >
            <Ionicon name="checkmark" size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPressDecline}
            style={[styles.redCircle, { backgroundColor: colors.red }]}
          >
            <Ionicon name="close" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    padding: 20,
    borderRadius: 20,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
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
  greenCircle: {
    borderRadius: 50,
    padding: 10,
    margin: 5,
  },
  redCircle: {
    borderRadius: 50,
    padding: 10,
    margin: 5,
  },
});

export default RequestCard;
