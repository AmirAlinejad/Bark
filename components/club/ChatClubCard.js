import React, { memo } from "react";
// react native components
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
// my components
import CustomText from "../display/CustomText";
import ClubImg from "./ClubImg";
// functions
import { goToChatScreen } from "../../functions/navigationFunctions";
// icons
import { Ionicons } from "@expo/vector-icons";
// colors
import { useTheme } from "@react-navigation/native";
// swipeable
import { Swipeable, RectButton } from "react-native-gesture-handler";

// club card displayed on the club list screen
const ChatClubCard = ({
  name,
  description,
  img,
  clubId,
  muted,
  toggleMute,
  unreadMessages,
  lastMessage,
  lastMessageTime,
  navigation,
}) => {
  const { colors } = useTheme();
  onPress = () => {
    goToChatScreen(name, clubId, img, navigation);
  };

  const swipeableRef = React.useRef(null);

  const renderRightActions = (progress, dragX) => {
    return (
      <RectButton
        style={[styles.rightAction, { backgroundColor: colors.button }]}
        onPress={toggleMute}
      >
        <Animated.View
          style={{
            transform: [
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                  extrapolate: "clamp",
                }),
              },
            ],
            opacity: progress,
          }}
        >
          <Ionicons
            name={muted ? "notifications-outline" : "notifications-off-outline"}
            size={30}
            color={colors.white}
          />
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={
        ("right",
        () => {
          toggleMute();
          swipeableRef.current.close();
        })
      }
    >
      <View style={[styles.clubCard, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onPress}>
            <ClubImg clubImg={img} width={100} />
          </TouchableOpacity>

          <View style={styles.cardText}>
            <TouchableOpacity style={styles.nameAndDesc} onPress={onPress}>
              {/* club name and description */}
              <View>
                <CustomText
                  style={[styles.textName, { color: colors.text }]}
                  text={name}
                  numberOfLines={1}
                  font="bold"
                />
                <CustomText
                  style={[styles.textNormal, { color: colors.text }]}
                  text={lastMessage}
                  numberOfLines={3}
                />
              </View>
              <CustomText
                style={[styles.timeText, { color: colors.textLight }]}
                text={lastMessageTime}
                numberOfLines={1}
              />
            </TouchableOpacity>

            <View style={styles.cardRight}>
              {/* notification counter */}
              {unreadMessages > 0 && (
                <View
                  style={[
                    styles.unreadMessageCircle,
                    { backgroundColor: colors.button },
                  ]}
                >
                  <CustomText
                    text={unreadMessages}
                    font="bold"
                    style={[
                      styles.notificationCounterText,
                      { color: colors.white },
                    ]}
                  />
                </View>
              )}

              {/* mute icon if muted */}
              {muted && (
                <Ionicons
                  name="notifications-off-outline"
                  size={30}
                  style={[ styles.muteButton, { color: colors.text }]}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  clubCard: {
    marginBottom: 15,
    flex: 1,

    paddingHorizontal: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 15,
    flex: 1,
  },
  cardText: {
    flex: 1,
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameAndDesc: {
    flex: 1,
    flexDirection: "column",
    height: 100,
    marginVertical: 2,
    justifyContent: "space-between",
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  unreadMessageCircle: {
    borderRadius: 15,
    padding: 5,
    marginRight: 0,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  muteButton: {
    padding: 0,
  },
  textName: {
    fontSize: 20,
    marginBottom: 0,
  },
  textNormal: {
    fontSize: 15,
  },
  timeText: {
    fontSize: 15,
  },
  notificationCounterText: {
    fontSize: 15,
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 100,
  },
});

export default memo(ChatClubCard);
