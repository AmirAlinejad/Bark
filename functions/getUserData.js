// backend functions
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../backend/FirebaseConfig';
import { ref, get } from "firebase/database";

export const getUserData = (setter, setLoading) => {
    // get user data from auth
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await updateUserData(user.uid, setter);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
}

// update user data (from useEffect)
const updateUserData = async (userId, setter) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();

        // set user data
        setter(userData);
        console.log(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
};