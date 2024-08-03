import React from "react";
// react native components
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
// icons
import { Ionicons } from "react-native-vector-icons";
// colors
import { useTheme } from "@react-navigation/native";

const CustomInput = ({
  width,
  value,
  setValue,
  placeholder,
  keyboardType,
  secureTextEntry,
  onEyeIconPress,
  maxLength,
  multiline,
}) => {
  const isPasswordInput = placeholder.toLowerCase().includes("password");

  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.inputBorder, width: width ? width : "80%" },
      ]}
    >
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]}
        placeholderTextColor={colors.textLight}
        maxLength={maxLength}
        multiline={multiline}
      />

      {isPasswordInput && (
        <TouchableOpacity onPress={onEyeIconPress} style={styles.eyeIcon}>
          <Ionicons
            name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontFamily: "Nunito_400Regular",
  },
  eyeIcon: {
    padding: 10,
  },
});

export default CustomInput;
