import { emailSplit } from "./backendFunctions";

export const goToClubScreen = (clubId, navigation) => {
    navigation.navigate("ClubScreen", {
        clubId: clubId,
    });
}

export const goToEventScreen = (eventId, navigation) => {
    navigation.navigate("EventScreen", {
        eventId: eventId,
    });
}

export const goToChatScreen = async (clubName, clubId, clubImg, navigation) => {
    const schoolKey = await emailSplit();

    navigation.navigate("Chat", {
        name: clubName,
        id: clubId,
        img: clubImg,
        schoolKey: schoolKey,
    });
}

export const goToAdminChatScreen = async (club, navigation) => {
    const schoolKey = await emailSplit();

    navigation.push("Chat", {
        chatName: 'admin',
        name: club.clubName,
        id: club.clubId,
        img: club.clubImg,
        club: club,
        schoolKey: schoolKey,
    });
}