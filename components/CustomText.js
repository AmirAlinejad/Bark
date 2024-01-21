import React from 'react';
// react native components
import { Text } from 'react-native';
// fonts
import { textNormal, title} from '../styles/FontStyles';
import { useFonts, Nunito_300Light, Nunito_400Regular, Nunito_800ExtraBold, Nunito_900Black } from '@expo-google-fonts/nunito';

const CustomText = ({ text, style, font }) => {
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

  const fontType = () => {
    switch (font) {
      case 'light' || 'Light':
        return 'Nunito_300Light';
      case 'regular' || 'Regular':
        return 'Nunito_400Regular';
      case 'bold' || 'Bold':
        return 'Nunito_800ExtraBold';
      case 'black'|| 'Black':
        return 'Nunito_900Black';
      default:
        return 'Nunito_400Regular';
    }
  }

  return (
    <Text style={[style, {fontFamily: fontType()}]}>{text}</Text>
  );
}

export default CustomText;