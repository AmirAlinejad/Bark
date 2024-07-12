import React from "react";
// react native components
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
// icons
import { Ionicons } from 'react-native-vector-icons';
// colors
import { Colors } from '../../styles/Colors';

const CustomInput = ({ width, value, setValue, placeholder, keyboardType, secureTextEntry, onEyeIconPress, maxLength, multiline }) => {
  const isPasswordInput = placeholder.toLowerCase().includes("password");
  return (
    <View style={[styles.container, { width: width ? width : "80%" }]}>

      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        placeholderTextColor={Colors.gray}
        maxLength={maxLength}
        multiline={multiline}
      />

      {isPasswordInput  && (
        <TouchableOpacity onPress={onEyeIconPress} style={styles.eyeIcon}>
          <Ionicons name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'} size={24} color={Colors.black} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.black,
    fonyColor: Colors.black,
    fontFamily: 'Nunito_400Regular',
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 10,
  },
});

export default CustomInput;