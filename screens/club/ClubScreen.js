import React from 'react';
// react native components
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, IconButton, Chip } from 'react-native-paper';
// my components
import EventCard from '../../components/events/EventCard';
// fonts
import { textNormal, title} from '../../styles/fontstyles';

const ClubScreen = ({ route, navigation }) => {

  const { name, description, categories, img, events } = route.params;

  // go back to club list screen
  const onBackPress = () => {
    navigation.goBack();
  }

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

  return ( 
    <View style={styles.container}>
      <View style={{marginTop: 30}}>
        <IconButton
          onPress={onBackPress}
          icon="arrow-left"
          size={30}
        />
      </View>

      {/* Club content */}
      <View style={styles.clubContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}> 
          <Avatar.Image source={{uri: img}} size={120}></Avatar.Image>
        </View>
        {/* Basic info */}
        <View style={styles.basicInfo}> 
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
        {/* Events */}
        <View style={{flex: 2}}>
          <Text style={[styles.title, {textAlign: 'center'}]}>Upcoming Events</Text>
          {
            // map through the club data and display each club
            eventsArray.map((item, index) => {

              const onPress = () => {
              // Navigate to the event screen
              navigation.navigate("EventScreen", {
                key: index,
                name: item.eventName,
                description: item.eventDescription,
                datetime: item.eventDateTime,
                location: item.eventLocation,
              });
            }

            return (
              <View key={index}>
                <EventCard 
                  onPress={onPress} 
                  name={item.eventName} 
                  description={item.eventDescription} 
                  date={item.eventDateTime.substring(0, item.eventDateTime.indexOf(','))} // just gives date
                  />
              </View>
            )
            })
          }
        </View>
      </View>

      {/* Add event button */}
      <View style={styles.addEventButton}>
        <IconButton
          onPress={onAddEventPress}
          icon="plus-circle"
          size={30}
        />
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
  basicInfo: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  eventsContent: {
    alignItems: 'center',
  },
  addEventButton: {
    alignItems: 'flex-end', 
    padding: 20
  },
  title: title,
  textNoraml: textNormal,
});

export default ClubScreen;