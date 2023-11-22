import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, IconButton, Chip } from 'react-native-paper';
import { db } from './backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
import { textNormal, title} from '../styles/fontstyles';

const ClubScreen = ({ route, navigation }) => {

  const { name, description, categories, img } = route.params;

  // go back to the previous screen
  const onBackPress = () => {
    navigation.goBack();
  }

  return ( 
    <View style={styles.container}>
      <View style={{marginTop: 30}}>
        <IconButton
          onPress={onBackPress}
          icon="arrow-left"
          size={30}
        />
      </View>
        <View style={styles.clubContent}>
          <View style={[styles.avatarContainer]}> 
            <Avatar.Image source={{uri: img}} size={120}></Avatar.Image>
          </View>
          <View style={{flex: 3, width: 300}}> 
            <Text style={[styles.title, {textAlign: 'center'}]}>{name}</Text>
            <View style={styles.categoriesContent}>
            {
              categories.length !== 0 && categories.map((item) => {
                return (
                  <Chip style={{margin: 5}}>{item}</Chip>
                )
              })
            }
            </View>
            <Text style={[styles.textNormal, {textAlign: 'center'}]}>{description}</Text>
          </View>
        </View>
      </View>   
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#D3D3D3',
    flex: 1,
  },
  clubContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
    flex: 1,
  },
  categoriesContent: {
    marginBottom: 10,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  avatarContainer: {
    marginTop: 100,
    flex: 1,
  },
  title: title,
  textNoraml: textNormal,
});

export default ClubScreen;