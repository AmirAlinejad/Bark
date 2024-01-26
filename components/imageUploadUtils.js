import * as ImagePicker from 'expo-image-picker';

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

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        // Use the first image in the assets array
        const selectedImageUri = pickerResult.assets[0].uri;
        callback(selectedImageUri);
    }
};

