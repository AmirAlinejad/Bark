import { getStorage, ref, deleteObject } from "firebase/storage";

const deleteImageFromStorage = async (imagePath) => {
    const storage = getStorage();
    const imageRef = ref(storage, imagePath);
    try {
        await deleteObject(imageRef);
    } catch (error) {
        console.log(error);
    }
};

export { deleteImageFromStorage };