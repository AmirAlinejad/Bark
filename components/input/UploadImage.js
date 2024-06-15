import React, { useState, useEffect } from 'react';
// react native components
import { Image, View, TouchableOpacity, StyleSheet } from 'react-native';
// my components
import CustomText from './CustomText';
// icons
import { AntDesign } from '@expo/vector-icons';
// image picker
import * as ImagePicker from 'expo-image-picker';

/////////////////////////////// MAKE LOOK BETTER OR USE DIFFERENT COMPONENT ///////////////////////////////

export default function UploadImage({parentCallback}) {
  // state for image
  const [image, setImage] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);

  // get image from camera roll
  const addImage = async () => {
    let _image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 0,
    });
    console.log(JSON.stringify(_image));
    if (!_image.canceled) {
      setImage(_image.assets[0].uri);
      parentCallback(_image.assets[0].uri);
    }
    console.log(JSON.stringify(image));
  };

  // check to see if we have permission to access the camera roll
  const  checkForCameraRollPermission=async()=>{
        const imagePermission = await ImagePicker.getMediaLibraryPermissionsAsync();
        console.log(imagePermission.status);

        setGalleryPermission(imagePermission.status === 'granted');

        if (imagePermission.status !== 'granted') {
        alert('Permission for media access needed.');
        }
    };

    // run at start
    useEffect(() => {
        checkForCameraRollPermission()
    }, []);

  return (
    <View style={imageUploaderStyles.container}>
        {
            image  && <Image source={{ uri: image }} style={imageUploaderStyles.imageStyle} />
        }
            <View style={imageUploaderStyles.uploadBtnContainer}>
                <TouchableOpacity onPress={addImage} style={imageUploaderStyles.uploadBtn} >
                    <CustomText text={image ? 'Edit' : 'Upload' + ' Image'} />
                    <AntDesign name="camera" size={20} color="black" />
                </TouchableOpacity>
            </View>
    </View>
  );
}
const imageUploaderStyles=StyleSheet.create({
  container:{
      elevation:2,
      height:200,
      width:200,
      backgroundColor:'#efefef',
      position:'relative',
      borderRadius:999,
      overflow:'hidden',
  },
  imageStyle:{
      width:200,
      height:200,
  },
  uploadBtnContainer:{
      opacity:0.7,
      position:'absolute',
      right:0,
      bottom:0,
      backgroundColor:'lightgrey',
      width:'100%',
      height:'25%',
  },
  uploadBtn:{
      display:'flex',
      alignItems:"center",
      justifyContent:'center'
  }
})