import React from "react";
import { View, StyleSheet } from "react-native";
// image
import { Image } from "expo-image";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// colors
import { useTheme } from "@react-navigation/native";

const ProfileImg = ({ profileImg, width, editable }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.imgContainer,
        {
          backgroundColor: colors.gray,
          width: width,
          height: width,
          borderRadius: width / 2,
        },
      ]}
    >
      {profileImg && (
        <Image
          source={{ uri: profileImg }}
          style={[
            styles.imgContainer,
            { width: width, height: width, borderRadius: width / 2 },
          ]}
        />
      )}

      {/* if there is no profile image, display a person icon */}
      {!profileImg && !editable && (
        <View style={{ position: "absolute", backgroundColor: colors.gray }}>
          <Ionicons
            name="person"
            size={(width * 1) / 2}
            color="rgba(0,0,0,0.5)"
          />
        </View>
      )}
      {/* if the image is editable, display a camera icon */}
      {editable && (
        <View style={{ position: "absolute" }}>
          <Ionicons name="camera" size={60} color="rgba(0,0,0,0.5)" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imgContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default ProfileImg;
