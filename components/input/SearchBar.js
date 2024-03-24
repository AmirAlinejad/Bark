import React from "react";
// react native components
import { View, TextInput, StyleSheet } from 'react-native';
// icons
import Icon from 'react-native-vector-icons/Ionicons';
// styles
import { Colors } from '../../styles/Colors';

const SearchBar = ({ value, setValue, placeholder, keyboardType }) => {
  const isPasswordInput = placeholder.toLowerCase().includes("password");
  return (
    <View style={styles.container}>
      <Icon name={isPasswordInput ? "lock-closed" : "search"} size={20} color={Colors.darkGray} style={{marginLeft: 10}}/>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        style={styles.input}
        placeholderTextColor={Colors.darkGray}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 10,
    backgroundColor: Colors.gray,
    width: '80%'
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    height: 50,
    color: Colors.black,
    backgroundColor: 'transparent',
  },
});

export default SearchBar;