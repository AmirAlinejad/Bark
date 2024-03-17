import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Assuming Firebase is already initialized elsewhere in your project
export const uploadImage = async (callback) => {
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

    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
        const selectedImageUri = pickerResult.assets[0].uri;
        const blob = await fetch(selectedImageUri).then((res) => res.blob());
        
        const storage = getStorage();
        const imageName = `chatImages/${new Date().toISOString()}-${pickerResult.assets[0].fileName}`;
        const imageRef = storageRef(storage, imageName);

        uploadBytes(imageRef, blob).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);
                callback(downloadURL); // This URL can be used in the chat message
            });
        }).catch((error) => {
            console.error("Error uploading image: ", error);
            alert("Error uploading image, please try again.");
        });
    }
};