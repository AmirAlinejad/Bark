import React from 'react';
// react native components
import { View, StyleSheet, Button } from 'react-native';
import { Text} from 'react-native-paper';
// fonts
import { textNormal, title, back} from '../styles/FontStyles';

const Header = ({ navigation, text, back }) => {

  // go back to the previous screen
  const onBackPress = () => {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
        <View style={styles.leftBox}>
        {back && ( // if back is true, show the back button
          <View style={styles.back}>
            <Button
                onPress={onBackPress}
                title="Back"
                color='#FF5028'
            />
          </View>
        )}
        </View>
        <View style={styles.middleBox}>
            <Text style={[styles.title, {textAlign: 'center'}]}>{text}</Text>
        </View>
        <View style={styles.rightBox} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
  },
  title: title,
  textNormal: {
    ...textNormal,
    marginTop: 20,
  },
  leftBox: {
    flex: 1,
    marginTop: 60,
    alignItems: 'flex-start',
  },
  back: {
    marginLeft: 20,
  },
  middleBox: {
    flex: 2,
    marginTop: 50,
  },
  rightBox: {
    flex: 1,
  },
});

export default Header;