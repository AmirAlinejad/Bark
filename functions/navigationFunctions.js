const goToClubScreen = (club, navigation, imageUrls) => {
    navigation.navigate("ClubScreen", {
        club: club,
        imageUrls: imageUrls ? imageUrls : null,
    });
}

const goToChatScreen = (club, navigation) => {
    navigation.navigate("Chat", {
        name: club.clubName,
        id: club.clubId,
        img: club.clubImg,
        club: club,
    });
}

const goToAdminChatScreen = (club, navigation) => {
    navigation.navigate("AdminChat", {
        name: club.clubName,
        id: club.clubId,
        img: club.clubImg,
        club: club,
    });
}

export { goToClubScreen, goToChatScreen, goToAdminChatScreen };