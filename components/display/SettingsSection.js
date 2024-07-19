import React from "react";
// react native components
import { View, StyleSheet, FlatList, Switch } from "react-native";
// my components
import IconText from "../../components/buttons/IconButton";
import IconButton from "../../components/buttons/IconButton";
// colors
import { Colors } from "../../styles/Colors";
import CustomText from "./CustomText";

const SettingsSection = ({ data, loading }) => {
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
              color={item.color ? item.color : Colors.black}
            />
            <Switch
              trackColor={{ false: Colors.black, true: Colors.buttonBlue }}
              thumbColor={Colors.white}
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
            color={item.color ? item.color : Colors.black}
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
              style={{ fontSize: 20, marginBottom: 8 }}
              icon={item.icon}
              text={item.title}
            />
          )}
          <View style={styles.settingsContent}>
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
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginBottom: 16,
  },
  settingsButton: {
    marginVertical: 10,
  },
  buttonContainerView: {
    marginTop: 0,
    marginBottom: 0,
  },
  separator: {
    backgroundColor: Colors.lightGray,
    height: 1,
    marginRight: 20,
  },
});

export default SettingsSection;
