import React from "react";
// react-native components
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
// my components
import ClubCard from "./ClubCard";
import CustomText from "../display/CustomText";
// colors
import { useTheme } from "@react-navigation/native";

const ClubCategory = ({ name, data, schoolKey, navigation }) => {
  const { colors } = useTheme();

  // go to club category screen
  const goToClubCategoryScreen = () => {
    navigation.navigate("ClubCategoryScreen", {
      clubCategory: name,
      schoolKey: schoolKey,
      navigation: navigation,
    });
  };

  return (
    <View style={styles.clubCategory}>
      <View style={{ height: 10 }} />
      <CustomText
        style={[styles.title, { color: colors.text }]}
        font="bold"
        text={name}
      />
      <FlatList
        contentContainerStyle={styles.list}
        data={data}
        renderItem={({ item }) => (
          <ClubCard
            clubId={item.clubId}
            name={item.clubName}
            description={item.clubDescription}
            img={item.clubImg}
            navigation={navigation}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.clubId}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.rightButtonView}
        onPress={goToClubCategoryScreen}
      >
        <CustomText text="View All" style={{ color: colors.button }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  clubCategory: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  list: {
    paddingRight: 20,
  },
  separator: {
    width: 12,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});

export default ClubCategory;
