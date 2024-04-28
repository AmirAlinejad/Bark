import React from 'react';
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
        searchInputStyle={{ color: Colors.black }}
        styleMainWrapper={{margin: 0, width: 300}}
        styleDropdownMenu={{height: 50}}
        styleDropdownMenuSubsection={{borderColor: Colors.inputBorder, borderWidth: 1, borderRadius: 25, backgroundColor: Colors.white}}
        styleTextDropdown={{ paddingLeft: 20, fontSize: 16 }}
        styleTextDropdownSelected={{ paddingLeft: 20, fontSize: 16 }}
        styleInputGroup={{height: 50, borderColor: Colors.inputBorder, borderWidth: 1, borderRadius: 25, paddingRight: 20, paddingLeft: 20,}}
        styleItemsContainer={{borderColor: Colors.inputBorder, borderWidth: 1, borderRadius: 20, marginTop: 10, paddingVertical: 10, backgroundColor: Colors.white}}
        styleRowList={{padding: 3}}
    />
  );
}

export default FilterList;