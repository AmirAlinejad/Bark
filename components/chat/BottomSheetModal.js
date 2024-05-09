import React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Modal, Text } from 'react-native';

const BottomSheetModal = ({ isVisible, onClose, onUploadImage, onOpenCamera, onUploadGif }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback style={styles.overlay} onPress={onClose}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.option} onPress={onUploadImage}>
            <Text style={styles.optionText}>Upload Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onUploadGif}>
            <Text style={styles.optionText}>Upload GIF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onOpenCamera}>
            <Text style={styles.optionText}>Use Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    width: '100%',
    marginTop: '152%'
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  optionText: {
    fontSize: 18,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    color: 'red',
  },
});

export default BottomSheetModal;