const formatDate = (date) => {
    // reformat date from 'Day Month DD YYYY' to 'YYYY-MM-DD'
    let formattedYear = date.substring(date.length - 4, date.length);
    let formattedMonth = date.substring(date.indexOf(' ') + 1, date.indexOf(' ') + 4);
    let formattedDay = date.substring(date.indexOf(' ') + 5, date.length - 5);
    if (formattedMonth == 'Jan') {
        formattedMonth = '01';
    }
    if (formattedMonth == 'Feb') {
        formattedMonth = '02';
    }
    if (formattedMonth == 'Mar') {
        formattedMonth = '03';
    }
    if (formattedMonth == 'Apr') {
        formattedMonth = '04';
    }
    if (formattedMonth == 'May') {
        formattedMonth = '05';
    }
    if (formattedMonth == 'Jun') {
        formattedMonth = '06';
    }
    if (formattedMonth == 'Jul') {
        formattedMonth = '07';
    }
    if (formattedMonth == 'Aug') {
        formattedMonth = '08';
    }
    if (formattedMonth == 'Sep') {
        formattedMonth = '09';
    }
    if (formattedMonth == 'Oct') {
        formattedMonth = '10';
    }
    if (formattedMonth == 'Nov') {
        formattedMonth = '11';
    }
    if (formattedMonth == 'Dec') {
        formattedMonth = '12';
    }

    return formattedYear + '-' + formattedMonth + '-' + formattedDay;
}

const formatTime = (time) => {
    // reformat time from 'HH:MM:SS AM/PM' to 'HH:MM:00'
    let formattedHour = time.substring(0, time.indexOf(':'));
    if (formattedHour.length == 1) {
        formattedHour = '0' + formattedHour;
    }
    let formattedMinute = time.substring(time.indexOf(':') + 1, time.length - 12);
    if (formattedMinute.length == 1) {
        formattedMinute = '0' + formattedMinute;
    }
    return formattedHour + ':' + formattedMinute + ':00';
}

const timeToString = (time) => {
    // convert time from 'HH:MM:SS' to 'HH:MM AM/PM'
    let hour = time.substring(0, time.indexOf(':'));
    let minute = time.substring(time.indexOf(':') + 1, time.length - 12);
    let ampm = 'AM';
    if (hour > 12) {
        hour = hour - 12;
        ampm = 'PM';
    }
    return hour + ':' + minute + ' ' + ampm;
}

// format start and end time for slider in calendar screen
const formatStartEndTime = (time) => {
    let formattedTime = time > 12 ? time - 12 : time;
    formattedTime = time >= 12 ? `${formattedTime} PM` : `${formattedTime} AM`;
    if (time == 0 || time == 24) { 
      formattedTime = '12 AM';
    }

    return formattedTime;
}

// format date from DOT Mon DD YYYY to create date object
const dateForObj = (date) => {
    const split = date.split(" ");
    let month = split[1];
    if (month === "Jan") {
      month = "01";
    } else if (month === "Feb") {
      month = "02";
    } else if (month === "Mar") {
      month = "03";
    } else if (month === "Apr") {
      month = "04";
    } else if (month === "May") {
      month = "05";
    } else if (month === "Jun") {
      month = "06";
    } else if (month === "Jul") {
      month = "07";
    } else if (month === "Aug") {
      month = "08";
    } else if (month === "Sep") {
      month = "09";
    } else if (month === "Oct") {
      month = "10";
    } else if (month === "Nov") {
      month = "11";
    } else if (month === "Dec") {
      month = "12";
    }
    let day = split[2];
    const dayNum = parseInt(day) + 1;
    day = dayNum.toString();
    if (day.length === 1) {
      // add 1 to value of day
      day = "0" + day;
    }
    const year = split[3];
    console.log(year + "-" + month + "-" + day);
    return year + "-" + month + "-" + day;
};

// time format
const timeForObj = (time) => {

    // reformat time from 'HH:MM:SS AM/PM' to 'HH:MM:00'
    const split = time.split(" ");
    const timeSplit = split[0].split(":");
    const hour = timeSplit[0];
    let minute = parseInt(timeSplit[1]);
    if (minute < 10) {
      minute = "0" + minute;
    }
    console.log(hour + ":" + minute);
    return "0000-00-00T" + hour + ":" + minute + ":00" + "-05:00";
};

// reformat date from 'Day Month DD YYYY' to 'Day, Month DD, YYYY'
const reformatDate = (date) => {
    let split = [];
    split[0] = date.split(' ')[0];
    if (split[0] === 'Mon') {
      split[0] = 'Monday';
    } else if (split[0] === 'Tue') {
      split[0] = 'Tuesday';
    } else if (split[0] === 'Wed') {
      split[0] = 'Wednesday';
    } else if (split[0] === 'Thu') {
      split[0] = 'Thursday';
    } else if (split[0] === 'Fri') {
      split[0] = 'Friday';
    } else if (split[0] === 'Sat') {
      split[0] = 'Saturday';
    } else if (split[0] === 'Sun') {
      split[0] = 'Sunday';
    }
    split[1] = date.split(' ')[1];
    if (split[1] === 'Jan') {
      split[1] = 'January';
    } else if (split[1] === 'Feb') {
      split[1] = 'February';
    } else if (split[1] === 'Mar') {
      split[1] = 'March';
    } else if (split[1] === 'Apr') {
      split[1] = 'April';
    } else if (split[1] === 'May') {
      split[1] = 'May';
    } else if (split[1] === 'Jun') {
      split[1] = 'June';
    } else if (split[1] === 'Jul') {
      split[1] = 'July';
    } else if (split[1] === 'Aug') {
      split[1] = 'August';
    } else if (split[1] === 'Sep') {
      split[1] = 'September';
    } else if (split[1] === 'Oct') {
      split[1] = 'October';
    } else if (split[1] === 'Nov') {
      split[1] = 'November';
    } else if (split[1] === 'Dec') {
      split[1] = 'December';
    }
    split[2] = date.split(' ')[2];
    split[3] = date.split(' ')[3];
    return split[0] + ', ' + split[1] + ' ' + split[2] + ', ' + split[3];
}

const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const chatFormatDate = (date) => {
  const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const chatFormatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amOrPm = hours >= 12 ? 'PM' : 'AM';
  const twelveHourFormatHours = hours % 12 || 12; // Convert 0 to 12 in 12-hour format

  // Removed the condition to add leading zero for hours
  const formattedHours = twelveHourFormatHours; // Directly use the calculated hour
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Keep the leading zero for minutes if necessary

  // Return the formatted time string without leading zero for hours
  return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
};

const getTimeZoneOffset = () => {
  // get time zone as a string based on the current date
  const offset = new Date().getTimezoneOffset();

  // convert the offset to hours and minutes
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;

  // return the time zone offset
  return `${offset < 0 ? '+' : '-'}${hours}:${minutes}`;
}

export { formatDate, formatTime, timeToString, formatStartEndTime, dateForObj, timeForObj, reformatDate, isSameDay, chatFormatDate, chatFormatTime, getTimeZoneOffset};