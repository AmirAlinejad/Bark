// backend functions
import { db } from '../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";

export const getClubData = (setter) => {

    const starCountRef = ref(db, 'clubs/');
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        const newClubs = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        console.log(newClubs);
        setter(newClubs);
    })
}