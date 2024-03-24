import React from 'react';
// multi-select list
import MultiSelect from 'react-native-multiple-select';
// colors
import { Colors } from '../../styles/Colors';

// club list screen
const FilterList = ({ items, setter, selected, text }) => {

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
        tagRemoveIconColor="#CCC"
        tagBorderColor="#CCC"
        tagTextColor="#CCC"
        selectedItemTextColor="#CCC"
        selectedItemIconColor="#CCC"
        itemTextColor={Colors.black}
        displayKey="value"
        searchInputStyle={{ color: Colors.black }}
        styleMainWrapper={{margin: 10, width: 300}}
        styleDropdownMenu={{height: 50}}
        styleDropdownMenuSubsection={{borderColor: '#ccc', borderWidth: 1, borderRadius: 20, backgroundColor: 'white'}}
        styleTextDropdown={{ paddingLeft: 20, fontSize: 16 }}
        styleTextDropdownSelected={{ paddingLeft: 20, fontSize: 16 }}
        styleInputGroup={{height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, paddingRight: 20, paddingLeft: 20,}}
        styleItemsContainer={{borderColor: '#ccc', borderWidth: 1, borderRadius: 20, marginTop: 10, paddingVertical: 10, backgroundColor: 'white'}}
        styleRowList={{padding: 3,}}
    />
  );
}

export default FilterList;