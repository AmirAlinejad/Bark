import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../../styles/Colors";
import { textNormal } from "../../styles/FontStyles";
// my components
import CustomText from "../CustomText";
// icons
import { Ionicons } from "@expo/vector-icons";

const Chip = ({ text, icon, color }) => {
    // update color
    const styles = StyleSheet.create({
        container: {
            backgroundColor: color ? color : Colors.gray,
            paddingHorizontal: 10,
            paddingVertical: 2,
            borderRadius: 10,
            flexDirection: "row",
            gap: 10,
        },
        text: {
            ...textNormal,
            fontSize: 15,
            color: Colors.black,
            marginTop: 6,
        },
    });

    return (
        <View style={styles.container}>
            {icon && <Ionicons name={icon} size={20} color={Colors.black} />}
            <CustomText style={styles.text} text={text} font="bold"/>
        </View>
    );
};

export default Chip;