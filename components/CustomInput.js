import React from "react";
// react native components
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const CustomInput = ({ width, value, setValue, placeholder, keyboardType, secureTextEntry, onEyeIconPress, maxLength, multiline }) => {
  const isPasswordInput = placeholder.toLowerCase().includes("password");
  return (
    <View style={width ? [styles.container, {width: width}] : [styles.container, {width: '80%'}]}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        maxLength={maxLength}
        multiline={multiline}
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
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontFamily: 'Nunito_400Regular',
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 10,
  },
});

export default CustomInput;