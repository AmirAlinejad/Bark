import React from "react";
// react native components
import { Text } from "react-native";
// fonts
import {
  useFonts,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
// theme
import { useTheme } from "@react-navigation/native";

const CustomText = ({ text, style, font, onPress, numberOfLines }) => {
  const { colors } = useTheme();

  // load fonts
  let [fontsLoaded, fontError] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // change font type based on prop
  const fontType = () => {
    switch (font) {
      case "light" || "Light":
        return "Nunito_300Light";
      case "regular" || "Regular":
        return "Nunito_400Regular";
      case "bold" || "Bold":
        return "Nunito_800ExtraBold";
      case "black" || "Black":
        return "Nunito_900Black";
      default:
        return "Nunito_400Regular";
    }
  };

  const newStyle = () => {
    if (style) {
      return [
        style,
        {
          fontFamily: fontType(),
        },
      ];
    } else {
      return { fontFamily: fontType(), color: colors.text };
    }
  };

  return (
    <Text numberOfLines={numberOfLines} style={newStyle()} onPress={onPress}>
      {text}
    </Text>
  );
};

export default CustomText;
