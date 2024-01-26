import React from 'react';
// react-native components
import { View, StyleSheet, ScrollView, TouchableOpacity,Text} from 'react-native';
import { Avatar, IconButton, Chip } from 'react-native-paper';
// backend
import { getAuth } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
// my components
import Header from '../../components/Header';
import UpcomingEvents from '../../components/event/UpcomingEvents';
import CustomText from '../../components/CustomText';
import CircleButton from '../../components/CircleButton';

const ClubScreen = ({ route, navigation }) => {
  // get data from club list/my clubs
  const { name, description, categories, img } = route.params;

  // filter for events
  const filterByThisClub = (event) => {
    return event.clubName === name;
  }

  // go to add event screen
  const onAddEventPress = () => {
    navigation.navigate("NewEvent", {
      clubName: name,
    });
  }

  // go to chat screen
  const onChatButtonPress = () => {
    navigation.navigate('Chat', {
      clubName: name,
    });
  };

  // request to join club
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

          // add user to club's members
          const clubRef = ref(db, 'clubs/' + name);
          const clubSnapshot = await get(clubRef);

          if (clubSnapshot.exists()) {
            const clubData = clubSnapshot.val();
            console.log(clubData);
            console.log(clubData.clubMembers)
            const updatedClubMembers = {...clubData.clubMembers, [userData.userName]: {
              userName: userData.userName,
              privelege: 'member',
            }};

            await set(clubRef, {
              ...clubData,
              clubMembers: updatedClubMembers,
            });
          } else {
            console.error('Club data not found.');
          }
  
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
              // display categories
              categories.length !== 0 && categories.map((item) => {
                return (
                  <Chip style={{margin: 5}}>{item}</Chip>
                )
              })
            }
            
            </View>
            <TouchableOpacity style={styles.requestButton}>
              <Text style={styles.requestButtonText}onPress={onButtonPressRequest}>Join</Text>
            </TouchableOpacity>
            <CustomText style={[styles.textNormal, {textAlign: 'center'}]} name={description}/>
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
      <CircleButton
        icon="comments"
        onPress={onChatButtonPress}
        position={{ position: 'absolute', bottom: 25, left: 40 }}
      />
      
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
  requestButton: {
    backgroundColor: '#FF5028',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  requestButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ClubScreen;
