import React, { useState, useEffect, useContext } from "react";
// react native components
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
// my components
import CustomInput from "../components/input/CustomInput";
import CustomText from "../components/display/CustomText";
import PrivacySwitch from "../components/input/PrivacySwitch";
// multi-select list
import {
  MultipleSelectList,
  SelectList,
} from "react-native-dropdown-select-list";
// colors
import { useTheme, useRoute } from "@react-navigation/native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
// global context
import { GlobalContext } from "../App";

const Form = ({
  formPropertiesAndTypes,
  form,
  setForm,
  navigation,
  eventId,
  clubId,
  clubCategories,
}) => {
  const { colors } = useTheme();
  const route = useRoute();

  const [state, setState] = useContext(GlobalContext);

  // update form state
  const updateForm = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const [array, setArray] = useState([]);

  useEffect(() => {
    setForm({ ...form, categoriesSelected: array });
  }, [array]);

  const renderFormInput = (propName, type, placeholder, options) => {
    if (type === "text") {
      return (
        <CustomInput
          placeholder={placeholder}
          value={form[propName]}
          setValue={(val) => updateForm(propName, val)}
          maxLength={50}
        />
      );
    } else if (type === "textLong") {
      return (
        <View
          style={[styles.inputContainer, { borderColor: colors.inputBorder }]}
        >
          <TextInput
            placeholder={placeholder}
            value={form[propName]}
            onChangeText={(val) => updateForm(propName, val)}
            keyboardType="default"
            maxLength={200}
            numberOfLines={5}
            style={[styles.input, { color: colors.text }]}
            multiline={true}
            textAlignVertical="top"
            placeholderTextColor={colors.textLight}
          />
        </View>
      );
    } else if (type === "boolean") {
      return (
        <View style={{ marginBottom: 12 }}>
          <PrivacySwitch
            toggled={form[propName]}
            setToggled={(val) => updateForm(propName, val)}
          />
        </View>
      );
    } else if (type === "array") {
      return (
        <MultipleSelectList
          data={options}
          setSelected={(val) => {
            setArray(val);
          }}
          save="value"
          boxStyles={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 12,
            width: 200,
            padding: 15,
            marginBottom: 20,
          }}
          dropdownStyles={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 12,
            width: 200,
            marginBottom: 20,
          }}
          checkBoxStyles={{
            borderRadius: 12,
            borderWidth: 1,
            backgroundColor: colors.inputBorder,
            borderColor: colors.inputBorder,
          }}
          labelStyles={{
            opacity: 0,
            marginBottom: -16,
            marginLeft: 5,
          }}
          badgeTextStyles={{
            fontFamily: "Nunito_400Regular",
            color: colors.text,
            fontSize: 16,
          }}
          badgeStyles={{
            backgroundColor: colors.inputBorder,
            borderRadius: 12,
            padding: 5,
            margin: 5,
          }}
          inputStyles={{
            color: colors.text,
            fontSize: 14,
            marginTop: 3,
          }}
          dropdownTextStyles={{
            color: colors.text,
            fontSize: 14,
          }}
        />
      );
    } else if (type === "select") {
      return (
        <SelectList
          data={options}
          setSelected={(val) => updateForm(propName, val)}
          save="value"
          boxStyles={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 12,
            width: 200,
            padding: 15,
            marginBottom: 20,
          }}
          dropdownStyles={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 12,
            width: 200,
            marginBottom: 20,
          }}
          checkBoxStyles={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.inputBorder,
          }}
          disabledCheckBoxStyles={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.inputBorder,
          }}
          labelStyles={{
            opacity: 0,
            marginBottom: -16,
            marginLeft: 5,
          }}
          badgeTextStyles={{
            fontFamily: "Nunito_400Regular",
            color: colors.text,
            fontSize: 16,
          }}
          badgeStyles={{
            backgroundColor: colors.inputBorder,
            borderRadius: 12,
            padding: 5,
            margin: 5,
          }}
          inputStyles={{
            color: colors.text,
            fontSize: 14,
            marginTop: 3,
          }}
          dropdownTextStyles={{
            color: colors.text,
            fontSize: 14,
          }}
        />
      );
    } else if (type == "date") {
      return (
        <RNDateTimePicker
          value={new Date(form[propName])}
          mode="datetime"
          onChange={(event, date) => {
            updateForm(propName, date);
          }}
          style={styles.dateTimePicker}
          themeVariant={state.theme}
        />
      );
      // } else if (type == "time") {
      //   return (
      //     <DateTimePicker
      //       value={new Date(form[propName])}
      //       mode="time"
      //       onChange={(event, date) => {
      //         updateForm(propName, date);
      //       }}
      //       style={styles.dateTimePicker}
      //     />
      //   );
    } else if (type == "location") {
      const splitAddress = (address) => {
        const split = address.split(",");
        return [split[0], split.slice(1).join(",")];
      };
      // navigate to map screen
      const onMapPressed = () => {
        const updatedEvent = {
          id: eventId,
          clubId: clubId,
          categories: clubCategories,
          eventName: form.eventName,
          description: form.eventDescription,
          date: form.date.toString(),
          publicEvent: form.publicEvent,
        };
        if (form.duration) updatedEvent.duration = form.duration;
        if (form.address) updatedEvent.address = form.address;
        if (form.roomNumber) updatedEvent.roomNumber = form.roomNumber;
        if (form.instructions) updatedEvent.instructions = form.instructions;

        navigation.navigate("Map Picker", {
          event: updatedEvent,
          fromEdit: route.name === "Edit Event",
        });
      };
      return (
        <TouchableOpacity onPress={onMapPressed}>
          <CustomText
            style={[
              styles.textPressable,
              { fontSize: 18, marginBottom: 20, color: colors.button },
            ]}
            text={
              form[propName]
                ? splitAddress(form[propName])[0] +
                  "\n" +
                  splitAddress(form[propName])[1]
                : "Select Location"
            }
          />
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {formPropertiesAndTypes.map((prop) => (
        <View style={styles.elementsContainer}>
          <CustomText
            style={{ ...styles.textNormal, color: colors.text }}
            font="bold"
            text={prop.title}
          />
          {renderFormInput(
            prop.propName,
            prop.type,
            prop.placeholder,
            prop.options
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  elementsContainer: {
    gap: 5,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    height: 100,
    width: "90%",
    padding: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "transparent",
    width: "90%",
  },
  textNormal: {
    fontSize: 20,
    marginBottom: 5,
    marginLeft: 5,
  },
  text: {
    fontSize: 12,
  },
  dateTimePicker: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    marginBottom: 12,
  },
});

export default Form;
