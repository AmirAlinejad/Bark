import React from "react";
import { View, StyleSheet } from "react-native";
// multi-select list
import MultiSelect from "react-native-multiple-select";
// colors
import { useTheme } from "@react-navigation/native";

// club list screen
const FilterList = ({ items, setter, selected, text }) => {
  const { colors } = useTheme();

  // messy code for the multi-select but only used in one place b/c need to save the selected items
  // used in calendar filter overlay
  return (
    <MultiSelect
      hideTags
      hideSearch
      hideSubmitButton
      items={items}
      uniqueKey="key"
      ref={(component) => {
        this.multiSelect = component;
      }}
      onSelectedItemsChange={setter}
      selectedItems={selected}
      selectText={text}
      searchInputPlaceholderText="Search..."
      noItemsText="No items found"
      onChangeInput={(text) => console.log(text)}
      tagRemoveIconColor={colors.inputBorder}
      tagBorderColor={colors.inputBorder}
      tagTextColor={colors.text}
      selectedItemTextColor={colors.text}
      selectedItemIconColor={colors.text}
      itemTextColor={colors.text}
      displayKey="value"
      searchInputStyle={{ color: colors.text }}
      styleMainWrapper={styles.mainWrapper}
      styleDropdownMenu={styles.dropdownMenu}
      styleDropdownMenuSubsection={[
        styles.dropdownMenuSubsection,
        { borderColor: colors.inputBorder, backgroundColor: colors.background },
      ]}
      styleTextDropdown={styles.textDropdown}
      styleTextDropdownSelected={styles.textDropdownSelected}
      styleInputGroup={[styles.inputGroup, { borderColor: colors.inputBorder }]}
      styleItemsContainer={[
        styles.itemsContainer,
        { borderColor: colors.inputBorder, backgroundColor: colors.background },
      ]}
      styleRowList={styles.rowList}
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
