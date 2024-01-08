import React from 'react';
// react native components
import { View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import { Text, Avatar, IconButton, Chip } from 'react-native-paper';
// my components
import EventCard from '../../components/events/EventCard';
import Header from '../../components/Header';
import UpcomingEvents from '../../components/events/UpcomingEvents';
// fonts
import { textNormal, title} from '../../styles/fontstyles';

const ClubScreen = ({ route, navigation }) => {

  const { name, description, categories, img, events } = route.params;

  // go to add event screen for this club
  const onAddEventPress = () => {
    navigation.navigate("NewEvent", {
      clubName: name,
    });
  }

  // create events array and populate it with the events
  eventsArray = [];
  if (events !== undefined) {
   eventsArray = Object.values(events);
  }

  // filter function for upcoming events
  const filterByThisClub = (event) => {
    return event.clubName === name;
  }

  const onButtonPress = () => {
    // Define the action you want to perform here
    navigation.navigate('Chat');
  };
  const onButtonPressRequest = () => {
    //request
  };


  return ( 
    <View style={styles.container}>
      <Header text={name} back navigation={navigation}></Header>
      <ScrollView>
        {/* Club content */}
        <View style={styles.clubContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}> 
            <Avatar.Image source={{uri: img}} size={150}></Avatar.Image>
          </View>
          {/* Basic info */}
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
          {/* Events */}
          <UpcomingEvents filter={filterByThisClub} navigation={navigation}/>
        </View>
      </ScrollView>
      {/* Add event button */}
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
    left: 20, // Changed to left
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
  title: title,
  textNoraml: textNormal,
});

export default ClubScreen;