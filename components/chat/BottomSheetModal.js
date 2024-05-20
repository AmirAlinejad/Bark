import React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Modal, Text, FlatList } from 'react-native';
// swipe up down modal
import SwipeUpDownModal from 'react-native-swipe-modal-up-down';
// colors
import { Colors } from '../../styles/Colors';

const BottomSheetModal = ({ isVisible, onClose, onUploadImage, onOpenCamera, onUploadGif }) => {

  const renderItem = ({ item }) => {
    return (
      item.cancel ? (
        <TouchableOpacity style={styles.cancelButton} onPress={item.onPress}>
          <Text style={styles.cancelButtonText}>{item.key}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.option} onPress={item.onPress}>
          <Text style={styles.optionText}>{item.key}</Text>
        </TouchableOpacity>
      )
    );
  }

  return (
    <SwipeUpDownModal
      modalVisible={isVisible} 
      pressToanimate={isVisible}
      onClose={onClose}
      ContentModal={
      <TouchableWithoutFeedback style={styles.overlay} onPress={onClose}>
        <View style={styles.modal}>
          <View style={styles.bar} />
          <FlatList
            scrollEnabled={false}
            data={[
              { key: 'Upload Picture', onPress: onUploadImage },
              { key: 'Upload GIF', onPress: onUploadGif },
              { key: 'Use Camera', onPress: onOpenCamera },
              { key: 'Upload a file', onPress: () => {} },
              { key: 'Send a poll', onPress: () => {} },
              { key: 'Cancel', onPress: onClose, cancel: true },
            ]}
            renderItem={renderItem}
          />
        </View>
      </TouchableWithoutFeedback>
    }
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.white,
    width: '100%',
    marginTop: '135%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  bar: {
    width: 50,
    height: 5,
    backgroundColor: Colors.lightGray,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  optionText: {
    fontSize: 18,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 15,
  },
  cancelButtonText: {
    fontSize: 18,
    color: Colors.red,
  },
});

export default BottomSheetModal;
