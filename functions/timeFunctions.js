const formatDate = (date) => {
    // reformat date to form 'YYYY-MM-DD' from 'DOTW Month DD YYYY'
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
    // reformat time to form 'HH:MM:SS'
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
    // convert time to string with AM/PM
    let hour = time.substring(0, time.indexOf(':'));
    let minute = time.substring(time.indexOf(':') + 1, time.length - 12);
    let ampm = 'AM';
    if (hour > 12) {
        hour = hour - 12;
        ampm = 'PM';
    }
    return hour + ':' + minute + ' ' + ampm;
}

export { formatDate, formatTime, timeToString };