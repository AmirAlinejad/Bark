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

export const goToChatScreen = async (club, navigation) => {
    const schoolKey = await emailSplit();

    navigation.navigate("Chat", {
        name: club.clubName,
        id: club.clubId,
        img: club.clubImg,
        club: club,
        schoolKey: schoolKey,
    });
}

export const goToAdminChatScreen = async (club, navigation) => {
    const schoolKey = await emailSplit();

    navigation.navigate("Chat", {
        chatName: 'adminChat',
        name: club.clubName,
        id: club.clubId,
        img: club.clubImg,
        club: club,
        schoolKey: schoolKey,
    });
}