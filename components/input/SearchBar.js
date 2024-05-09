import React from "react";
// react native components
import { View, TextInput, StyleSheet } from 'react-native';
// icons
import { Ionicons } from 'react-native-vector-icons';
// styles
import { Colors } from '../../styles/Colors';

const SearchBar = ({ value, setValue, placeholder }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={Colors.darkGray} style={styles.iconStyle}/>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
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
  iconStyle: {
    marginLeft: 10,
  }
});

export default SearchBar;