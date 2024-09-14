import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { FIREBASE_AUTH, firestore } from "../backend/FirebaseConfig";
import { emailSplit } from "./backendFunctions";
import { getProfileData } from "./profileFunctions";
import * as Calendar from "expo-calendar";

const getSetCalendarData = async (setter) => {
  // maybe change to query based on date or club
  const schoolKey = await emailSplit();
  const eventsDocRef = collection(
    firestore,
    "schools",
    schoolKey,
    "calendarData"
  );
  const eventsSnapshot = await getDocs(eventsDocRef);

  if (eventsSnapshot.empty) {
    console.log("No events found.");
    return;
  }

  const events = eventsSnapshot.docs.map((doc) => doc.data());
  setter(events);
};

const getSetClubCalendarData = async (clubId, setter) => {
  const schoolKey = await emailSplit();
  const eventsDocRef = collection(
    firestore,
    "schools",
    schoolKey,
    "calendarData"
  );
  const eventsQuery = query(eventsDocRef, where("clubId", "==", clubId));
  const eventsSnapshot = await getDocs(eventsQuery);

  if (eventsSnapshot.empty) {
    console.log("No events found.");
    return;
  }

  const events = eventsSnapshot.docs.map((doc) => doc.data());
  setter(events);
};

const getClubCalendarData = async (clubId, setter) => {
  const schoolKey = await emailSplit();

  const eventsDocRef = collection(
    firestore,
    "schools",
    schoolKey,
    "calendarData"
  );
  const eventsQuery = query(eventsDocRef, where("clubId", "==", clubId));
  const eventsSnapshot = await getDocs(eventsQuery);

  if (eventsSnapshot.empty) {
    console.log("No events found.");
    return;
  }

  return setter(eventsSnapshot.docs.map((doc) => doc.data()));
};

const getSetEventData = async (eventId, setter, setRSVPList, goBack) => {
  const schoolKey = await emailSplit();
  const eventDocRef = doc(
    firestore,
    "schools",
    schoolKey,
    "eventData",
    eventId
  );
  const eventDocSnapshot = await getDoc(eventDocRef);

  if (!eventDocSnapshot.exists()) {
    console.log("Event not found.");
    return;
  }

  const event = eventDocSnapshot.data();

  if (event === undefined) {
    if (goBack) {
      goBack();
      return;
    }
  }

  // get RSVP list
  setRSVPList(event.rsvps ? event.rsvps : []);

  setter(event);
};

const deleteEvent = async (eventId) => {
  const schoolKey = await emailSplit();

  // delete event data
  await deleteDoc(doc(firestore, "schools", schoolKey, "eventData", eventId));

  // delete event from calendar
  await deleteDoc(
    doc(firestore, "schools", schoolKey, "calendarData", eventId)
  );
};

// add user to attendance for an event
const attendEvent = async (eventId) => {
  const schoolKey = await emailSplit();

  // get user id from auth
  const userId = FIREBASE_AUTH.currentUser.uid;

  // get event data
  const eventDocRef = doc(
    firestore,
    "schools",
    schoolKey,
    "eventAttendance",
    eventId
  );
  const eventDocSnapshot = await getDoc(eventDocRef);
  const eventData = eventDocSnapshot.data();

  // add user to attendance list
  let attendanceList = eventData.attendance;
  if (attendanceList == undefined) {
    attendanceList = [];
  }
  attendanceList = [...attendanceList, userId];

  await updateDoc(eventDocRef, {
    attendance: attendanceList,
  });
};

// get list of users attending an event
const getSetEventAttendance = async (eventId, setter) => {
  const schoolKey = await emailSplit();

  const eventDocRef = doc(
    firestore,
    "schools",
    schoolKey,
    "eventAttendance",
    eventId
  );
  const eventDocSnapshot = await getDoc(eventDocRef);
  setter(eventDocSnapshot.data().attendance);
};

// get attendees' data
const getAttendeesData = async (attendees, setter) => {
  let attendeesData = [];
  // for every user id in the attendance list, get user data
  for (let i = 0; i < attendees.length; i++) {
    const userId = attendees[i];
    const profileData = await getProfileData(userId);

    // append user data to array
    if (profileData) {
      attendeesData = [...attendeesData, profileData];
    }
  }

  setter(attendeesData);
};

const addEventToDefaultCalendar = async (event) => {
  const defaultCalendar = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );

  const eventDuration = new Date(event.duration);
  let minutes = eventDuration.getMinutes() + eventDuration.getHours() * 60;

  const endDate = new Date(event.date);
  endDate.setMinutes(endDate.getMinutes() + minutes);

  let newEvent = {
    title: event.name,
    startDate: new Date(event.date),
    endDate: endDate,
    location: event.address,
    notes: event.description,
  };

  if (event.repeats === "Daily") {
    newEvent.recurrenceRule = {
      frequency: "daily",
      occurence: 30,
    };
  } else if (event.repeats === "Weekly") {
    newEvent.recurrenceRule = {
      frequency: "weekly",
      occurence: 4,
    };
  } else if (event.repeats === "Monthly") {
    newEvent.recurrenceRule = {
      frequency: "monthly",
      occurence: 12,
    };
  }

  await Calendar.createEventAsync(defaultCalendar[0].id, newEvent);
};

const getRSVPProfileData = async (rsvpList, setter) => {
  let rsvpProfileData = [];
  if (!rsvpList) {
    setter(rsvpProfileData);
    return;
  }

  for (let i = 0; i < rsvpList.length; i++) {
    const profileData = await getProfileData(rsvpList[i]);
    const profileObj = {
      username: profileData.userName,
      first: profileData.firstName,
      last: profileData.lastName,
      id: profileData.id,
    };
    if (profileData.profileImg) {
      profileObj.profileImg = profileData.profileImg;
    }
    rsvpProfileData = [...rsvpProfileData, profileObj];
  }

  setter(rsvpProfileData);
};

export {
  getSetCalendarData,
  getClubCalendarData,
  getSetClubCalendarData,
  getSetEventData,
  deleteEvent,
  attendEvent,
  getSetEventAttendance,
  getAttendeesData,
  addEventToDefaultCalendar,
  getRSVPProfileData,
};
