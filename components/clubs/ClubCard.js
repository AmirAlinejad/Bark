import React from 'react';
// react native components
import { View, StyleSheet} from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
// fonts
import { textNormal, title} from '../../styles/fontstyles';

// club card displayed on the club list screen
const ClubCard = ({ onPress, name, description, img }) => {
  
  return (
    <Card style={styles.clubCard} onPress={onPress}>   
      <View style={styles.container}>
        <View style={{flex: 1}}> 
          <Avatar.Image source={{uri: img}} />
        </View>
        
        <View style={{flex: 2}}> 
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.textNormal} numberOfLines={2}>{description}</Text>
        </View>
      </View>   
    </Card>
  );
}

const styles = StyleSheet.create({
  clubCard: {
    margin: 10,
    padding: 20,
    backgroundColor: '#ECF0F1',
    borderRadius: 10,
    shadowColor: '#0010',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    width: 300,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: title,
  textNormal: textNormal,
});

export default ClubCard;