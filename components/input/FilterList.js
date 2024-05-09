import React from 'react';
import { View, StyleSheet } from 'react-native';
// multi-select list
import MultiSelect from 'react-native-multiple-select';
// colors
import { Colors } from '../../styles/Colors';

// club list screen
const FilterList = ({ items, setter, selected, text }) => {

  // messy code for the multi-select but only used in one place b/c need to save the selected items
  // used in calendar filter overlay
  return (
    <MultiSelect
        hideTags
        hideSearch
        hideSubmitButton
        items={items}
        uniqueKey="key"
        ref={(component) => { this.multiSelect = component }}
        onSelectedItemsChange={setter}
        selectedItems={selected}
        selectText={text}
        searchInputPlaceholderText="Search..."
        noItemsText='No items found'
        onChangeInput={ (text)=> console.log(text)}
        tagRemoveIconColor={Colors.inputBorder}
        tagBorderColor={Colors.inputBorder}
        tagTextColor={Colors.black}
        selectedItemTextColor={Colors.black}
        selectedItemIconColor={Colors.black}
        itemTextColor={Colors.black}
        displayKey="value"
        searchInputStyle={styles.searchInputStyle}
        styleMainWrapper={styles.mainWrapper}
        styleDropdownMenu={styles.dropdownMenu}
        styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
        styleTextDropdown={styles.textDropdown}
        styleTextDropdownSelected={styles.textDropdownSelected}
        styleInputGroup={styles.inputGroup}
        styleItemsContainer={styles.itemsContainer}
        styleRowList={styles.rowList}
    />
  );
}

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputStyle: {
    color: Colors.black,
  },
  mainWrapper: {
    margin: 0,
    width: 300,
  },
  dropdownMenu: {
    height: 50,
  },
  dropdownMenuSubsection: {
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: Colors.white,
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
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 25,
    paddingRight: 20,
    paddingLeft: 20,
  },
  itemsContainer: {
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  rowList: {
    padding: 3,
  },
});

export default FilterList;