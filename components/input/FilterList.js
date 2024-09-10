import React from "react";
import { StyleSheet } from "react-native";
// multi-select list
import { MultipleSelectList } from "react-native-dropdown-select-list";
// colors
import { useTheme } from "@react-navigation/native";

// club list screen
const FilterList = ({ items, setter, selected, text }) => {
  const { colors } = useTheme();

  // messy code for the multi-select but only used in one place b/c need to save the selected items
  // used in calendar filter overlay
  return (
    // <MultiSelect
    //   hideTags
    //   hideSearch
    //   hideSubmitButton
    //   items={items}
    //   uniqueKey="key"
    //   ref={(component) => {
    //     this.multiSelect = component;
    //   }}
    //   onSelectedItemsChange={setter}
    //   selectedItems={selected}
    //   selectText={text}
    //   searchInputPlaceholderText="Search..."
    //   noItemsText="No items found"
    //   onChangeInput={(text) => console.log(text)}
    //   tagRemoveIconColor={colors.inputBorder}
    //   tagBorderColor={colors.inputBorder}
    //   tagTextColor={colors.text}
    //   selectedItemTextColor={colors.text}
    //   selectedItemIconColor={colors.text}
    //   itemTextColor={colors.text}
    //   displayKey="value"
    //   searchInputStyle={{ color: colors.text }}
    //   styleMainWrapper={[styles.mainWrapper, { backgroundColor: colors.card }]}
    //   styleSelectorContainer={{ backgroundColor: colors.card }}
    //   styleDropdownMenu={[
    //     styles.dropdownMenu,
    //     { borderColor: colors.inputBorder, backgroundColor: colors.card },
    //   ]}
    //   styleDropdownMenuSubsection={[styles.dropdownMenuSubsection]}
    //   styleTextDropdown={styles.textDropdown}
    //   styleTextDropdownSelected={styles.textDropdownSelected}
    //   styleInputGroup={[
    //     styles.inputGroup,
    //     { borderColor: colors.inputBorder, backgroundColor: colors.card },
    //   ]}
    //   styleItemsContainer={[
    //     styles.itemsContainer,
    //     { borderColor: colors.inputBorder, backgroundColor: colors.card },
    //   ]}
    //   styleRowList={styles.rowList}
    // />
    <MultipleSelectList
      data={items}
      setSelected={(value) => setter(value)}
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
};

// styles
const styles = StyleSheet.create({
  mainWrapper: {
    margin: 0,
    width: 300,
  },
  dropdownMenu: {
    height: 50,
  },
  dropdownMenuSubsection: {
    borderWidth: 1,
    borderRadius: 25,
  },
  textDropdown: {
    paddingLeft: 20,
    fontSize: 16,
  },
  textDropdownSelected: {
    paddingLeft: 20,
    fontSize: 16,
  },
  inputGroup: {
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingRight: 20,
    paddingLeft: 20,
  },
  itemsContainer: {
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 10,
    paddingVertical: 10,
  },
  rowList: {
    padding: 3,
  },
});

export default FilterList;
