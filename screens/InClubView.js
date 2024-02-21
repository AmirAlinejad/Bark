import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const InClubView = ({navigation,route}) => {
  
  const clubName = route?.params?.clubName;
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('UserList', {
            clubName: clubName,
          })}>
        <Text style={styles.buttonText}>Search Members</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MessageSearchScreen' , {clubName})}>
        <Text style={styles.buttonText}>Search Messages</Text>
      </TouchableOpacity>

      {/* Add more buttons for additional screens here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#007bff',
    padding: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default InClubView;
