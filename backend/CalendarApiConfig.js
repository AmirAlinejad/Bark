import ApiCalendar from "react-google-calendar-api";

const config = {
  clientId: "876889988156-56qduhghi0t7m5kbc5c422cdpi9nhbrd.apps.googleusercontent.com",
  apiKey: "AIzaSyA0xxZJ0-ZR5SvsWqR4bAlt3Y8da2CXEk8",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

export const apiCalendar = new ApiCalendar(config);