<<<<<<< HEAD
import React from 'react';
// react native components
import { View, StyleSheet, Button, TouchableOpacity } from 'react-native';
// my components
import CustomText from './CustomText';
// fonts
import { textNormal, title} from '../styles/FontStyles';
// icon
import Ionicons from 'react-native-vector-icons/Ionicons';

const Header = ({ navigation, text, back, numberOfLines }) => {

  // go back to the previous screen
  const onBackPress = () => {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      {back && ( // if back is true, show the back button
        <TouchableOpacity style={styles.back} onPress={onBackPress}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
      )}
      <CustomText style={styles.title} font='black' numberOfLines={1} text={text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginLeft: 20,
    justifyContent: 'left',
    flexDirection: 'row',
  },
  title: {
    ...title,
    textAlign: 'center',
    fontSize: 30,
  },
  textNormal: {
    ...textNormal,
    marginTop: 20,
  },
  back: {
    marginRight: 10,
    marginTop: 13,
  },
});

=======
import React from 'react';
// react native components
import { View, StyleSheet, Button } from 'react-native';
// my components
import CustomText from './CustomText';
// fonts
import { textNormal, title} from '../styles/FontStyles';

const Header = ({ navigation, text, back, numberOfLines }) => {

  // go back to the previous screen
  const onBackPress = () => {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      {back && ( // if back is true, show the back button
        <View style={styles.back}>
          <Button
              onPress={onBackPress}
              title="Back"
              color='#FF5028'
          />
        </View>
      )}
      <CustomText style={styles.title} font='black' numberOfLines={numberOfLines} text={text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginLeft: 30,
    justifyContent: 'left',
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
  },
  title: {
    ...title,
    textAlign: 'center',
  },
  textNormal: {
    ...textNormal,
    marginTop: 20,
  },
});

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default Header;