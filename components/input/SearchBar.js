import React from "react";
// react native components
import { View, TextInput, StyleSheet } from "react-native";
// icons
import { Ionicons } from "react-native-vector-icons";
// styles
import { useTheme } from "@react-navigation/native";

const SearchBar = ({ value, setValue, placeholder }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.gray }]}>
      <Ionicons
        name="search"
        size={20}
        color={colors.textLight}
        style={styles.iconStyle}
      />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        style={[styles.input, { color: colors.text }]}
        placeholderTextColor={colors.textLight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    width: "80%",
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: "transparent",
  },
  iconStyle: {
    marginLeft: 10,
  },
});

export default SearchBar;
