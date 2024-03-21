import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const LikesBottomModal = ({ isVisible, onClose, userIDs }) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <ScrollView>
            {userIDs.map((userID, index) => (
              <Text key={index} style={styles.userIDText}>{userID}</Text>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  userIDText: {
    fontSize: 18,
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
  },
});

export default LikesBottomModal;
