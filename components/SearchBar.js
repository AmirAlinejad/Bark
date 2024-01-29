import React from "react";
// react native components
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
// icons

// styles
import { Colors } from '../styles/Colors';

const SearchBar = ({ value, setValue, placeholder, keyboardType }) => {
  const isPasswordInput = placeholder.toLowerCase().includes("password");
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 30,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.lightGray,
    width: '60%'
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    height: 50,
    color: '#333',
    backgroundColor: 'transparent',
  },
});

export default SearchBar;