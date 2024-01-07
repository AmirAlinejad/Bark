import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const CustomInput = ({ value, setValue, placeholder, keyboardType, secureTextEntry, icon, onEyeIconPress, passwordVisible }) => {
  const isPasswordInput = placeholder.toLowerCase().includes("password");
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
      {isPasswordInput  && (
        <TouchableOpacity onPress={onEyeIconPress} style={styles.eyeIcon}>
          <Feather name={secureTextEntry ? 'eye' : 'eye-off'} size={24} color="#333" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderBottomWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    width: '60%'
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 10,
  },
});

export default CustomInput;



