import React from "react";
import { View, StyleSheet } from "react-native";
// image
import { Image } from "expo-image";
// styles
import { useTheme } from "@react-navigation/native";
// icons
import { Ionicons } from "@expo/vector-icons";

const ClubImg = ({ clubImg, width, editable }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.imgContainer,
        {
          backgroundColor: colors.gray,
          width: width,
          height: width,
          borderRadius: width / 6,
        },
      ]}
    >
      {clubImg && (
        <Image
          source={{ uri: clubImg }}
          style={[
            styles.imgContainer,
            { width: width, height: width, borderRadius: width / 6 },
          ]}
        />
      )}
      {/* if there is no club image, display a default icon */}
      {!clubImg && !editable && (
        <View style={{ position: "absolute" }}>
          <Ionicons
            name="people"
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
  },
});

export default ClubImg;
