import React from "react";
// react native components
import { View, StyleSheet, FlatList, Switch } from "react-native";
// my components
import IconButton from "../../components/buttons/IconButton";
import CustomText from "./CustomText";
// colors
import { useTheme } from "@react-navigation/native";

const SettingsSection = ({ data, loading }) => {
  const { colors } = useTheme();
  if (!loading) {
    loading = false;
  }
  // render settings button
  const renderSettingsButton = ({ item }) => {
    if (!item.disabled) {
      if (item.switch) {
        return (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <IconButton
              icon={item.icon}
              text={item.text}
              style={styles.settingsButton}
              color={item.color ? item.color : colors.text}
            />
            <Switch
              trackColor={{ false: colors.gray, true: colors.button }}
              ios_backgroundColor={colors.gray}
              thumbColor={colors.white}
              onValueChange={() => {
                // if not loading, then onPress
                if (!loading) {
                  item.onPress();
                }
              }}
              value={item.value}
            />
          </View>
        );
      } else {
        return (
          <IconButton
            icon={item.icon}
            text={item.text}
            onPress={() => {
              // if not loading, then onPress
              if (!loading) {
                item.onPress();
              }
            }}
            style={styles.settingsButton}
            color={item.color ? item.color : colors.text}
          />
        );
      }
    }
  };

  // data for settings flatlist
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {data.map((item, index) => (
        <View key={index}>
          {item.title && (
            <CustomText
              font="bold"
              style={{ fontSize: 20, marginBottom: 8, color: colors.text }}
              icon={item.icon}
              text={item.title}
            />
          )}
          <View
            style={[styles.settingsContent, { backgroundColor: colors.card }]}
          >
            <FlatList
              scrollEnabled={false}
              data={item.data}
              renderItem={renderSettingsButton}
              keyExtractor={(item) => item.id}
              style={styles.buttonContainerView}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  settingsContent: {
    justifyContent: "flex-start",
    justifySelf: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  settingsButton: {
    marginVertical: 10,
  },
  buttonContainerView: {
    marginTop: 0,
    marginBottom: 0,
  },
});

export default SettingsSection;
