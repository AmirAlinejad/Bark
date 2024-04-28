import * as ImagePicker from "expo-image-picker";
import { set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// image upload function
const handleImageUpload = async (image_type, setter, image) => {
    storage = getStorage();

    const selectedImageUri = image;
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
  };

  export default handleImageUpload;