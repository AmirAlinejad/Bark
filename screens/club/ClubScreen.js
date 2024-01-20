import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import { Text, Avatar, IconButton, Chip } from 'react-native-paper';
import { getAuth } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import Header from '../../components/Header';
import UpcomingEvents from '../../components/events/UpcomingEvents';
import { db } from '../../backend/FirebaseConfig';

const ClubScreen = ({ route, navigation }) => {
  const { name, description, categories, img, events } = route.params;

  const filterByThisClub = (event) => {
    return event.clubName === name;
  }

  const onAddEventPress = () => {
    navigation.navigate("NewEvent", {
      clubName: name,
    });
  }

  const onButtonPress = () => {
    navigation.navigate('Chat');
  };

  const onButtonPressRequest = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user) {
        const userId = user.uid;
        const userRef = ref(db, `users/${userId}`);
        const userSnapshot = await get(userRef);
  
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          const updatedClubsJoined = [...(userData.clubsJoined || []), name];
  
          // Update the user's information in the database
          await set(userRef, {
            ...userData,
            clubsJoined: updatedClubsJoined,
          });
  
          alert(`Request sent to join ${name}`);
        } else {
          console.error('User data not found.');
        }
      } else {
        console.error('User not authenticated.');
      }
    } catch (error) {
      console.error('Error processing request:', error);
    }
  };
  

  return ( 
    <View style={styles.container}>
      <Header text={name} back navigation={navigation}></Header>
      <ScrollView>
        <View style={styles.clubContent}>
          <View style={styles.avatarContainer}> 
            <Avatar.Image source={{uri: img}} size={150}></Avatar.Image>
          </View>
          <View style={styles.basicInfo}> 
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
          <UpcomingEvents filter={filterByThisClub} navigation={navigation}/>
        </View>
      </ScrollView>
      <View style={styles.addEventButton}>
        <IconButton
          onPress={onAddEventPress}
          icon="plus-circle"
          size={30}
        />
      </View>
      <TouchableOpacity
        style={styles.rightButton}
        onPress={onButtonPress}
      >
        <Text style={styles.buttonText}>Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.leftButton}
        onPress={onButtonPressRequest}
      >
        <Text style={styles.buttonText}>Request</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  clubContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicInfo: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContent: {
    marginBottom: 20,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  avatarContainer: {
    marginTop: 50,
  },
  eventsContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  addEventButton: {
    bottom: 0,
    right: 0,
    padding: 20,
    position: 'absolute',
  },
  leftButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#F5F5DC',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButton: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    bottom: 20,
    backgroundColor: '#F5F5DC',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default ClubScreen;