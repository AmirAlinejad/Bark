import React, { useState } from 'react';
import { View, Image, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Make sure to import useNavigation
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons

export default function ImageViewerScreen({ route }) {
  const { imageUri } = route.params;
  const navigation = useNavigation(); // Use useNavigation to access navigation
  const [modalVisible, setModalVisible] = useState(true);

  // Function to handle modal close and navigate back
  const closeModalAndGoBack = () => {
    setModalVisible(false);
    navigation.goBack(); // Navigate back to the previous screen in the stack
  };

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
          <MaterialIcons name="close" size={30} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%', // Adjust based on preference
    height: '80%', // Adjust based on preference
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
});
