import ApiCalendar from "react-google-calendar-api";

const config = {
  clientId: "Maps API Key",
  apiKey: "AIzaSyAoX4MTi2eAw2b_W3RzA35Cy5yjpwQYV3E",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

export const apiCalendar = new ApiCalendar(config);