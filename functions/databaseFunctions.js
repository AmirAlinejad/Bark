// generic functions for database operations
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../backend/FirebaseConfig";

// get data from a document
export const getDocData = async (collection, docId) => {
  const docRef = doc(firestore, collection, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    return docSnap.data();
  } else {
    console.log("Document does not exist.");
  }
};

// get data from a collection
export const getCollectionData = async (collectionRef) => {
  console.log("Collection:", collectionRef);
  const querySnapshot = await getDocs(collectionRef);
  let data = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });

  console.log("Data:", data);
  return data;
}

export const addDocData = async (collection, data, docId) => {
    try {
        await setDoc(doc(firestore, collection, docId), data);
        console.log("Document successfully written!");
    } catch (error) {
        console.error("Error writing document: ", error);
    }
}

export const updateDocument = async (collection, docId, data) => {
    try {
        await updateDoc(doc(firestore, collection, docId), data);
        console.log("Document successfully updated!");
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

export const deleteDocument = async (collection, docId) => {
    try {
        await deleteDoc(doc(firestore, collection, docId));
        console.log("Document successfully deleted!");
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
}