import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

// image upload function
export const handleImageUpload = async (image_type, setter, image) => {
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

export const handleDocumentUpload = async (document_type, setter, document) => {
  storage = getStorage();

  const selectedDocumentUri = document;
  const fileName = `${document_type}_${Date.now()}`; // unique filename
  const documentRef = storageRef(
    storage,
    `${document_type}_documents/${fileName}`
  );
  try {
    const response = await fetch(selectedDocumentUri);
    const blob = await response.blob();
    await uploadBytes(documentRef, blob);
    const downloadURL = await getDownloadURL(documentRef);
    setter(downloadURL);
  } catch (error) {
    console.error("Error uploading document:", error);
    alert("Error uploading document.");
  }
};

export const deleteImageFromStorage = async (imagePath) => {
  const storage = getStorage();
  const imageRef = ref(storage, imagePath);
  try {
    await deleteObject(imageRef);
  } catch (error) {
    console.log(error);
  }
};
