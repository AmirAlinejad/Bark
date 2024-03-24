import * as ImagePicker from "expo-image-picker";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

// image upload function
const handleImageUpload = async (image_type, setter) => {
    auth = getAuth();
    storage = getStorage();

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const selectedImageUri = pickerResult.assets[0].uri;
        const fileName = `${image_type}_${Date.now()}`; // unique filename
        const imageRef = storageRef(storage, `${image_type}_images/${fileName}`);
        try {
          const response = await fetch(selectedImageUri);
          const blob = await response.blob();
          await uploadBytes(imageRef, blob);
          const downloadURL = await getDownloadURL(imageRef);
          setter(downloadURL);
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Error uploading image.");
        }
    }
  };

  export default handleImageUpload;