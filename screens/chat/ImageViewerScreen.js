import React, { useState } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity } from 'react-native';
// navigation
import { useNavigation } from '@react-navigation/native'; // Make sure to import useNavigation
// icons
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons
// styles
import { useTheme } from '@react-navigation/native';

export default function ImageViewerScreen({ route }) {
  const { imageUri } = route.params;
  const navigation = useNavigation(); // Use useNavigation to access navigation
  const [modalVisible, setModalVisible] = useState(true);

  // Function to handle modal close and navigate back
  const closeModalAndGoBack = () => {
    setModalVisible(false);
    navigation.goBack(); // Navigate back to the previous screen in the stack
  };

  const { colors } = useTheme();

  return (
    <Modal
      animationType="fade" // Smooth transition
      transparent={true} // Transparent background
      visible={modalVisible}
      onRequestClose={closeModalAndGoBack} // Handle Android hardware back button
    >
      <TouchableOpacity style={styles.container} onPress={closeModalAndGoBack}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <TouchableOpacity style={styles.closeButton} onPress={closeModalAndGoBack}>
          <MaterialIcons name="close" size={30} color={colors.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 1)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%', // Adjust
    height: '90%', // Adjust
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
});
