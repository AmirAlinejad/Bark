import React from 'react';
// multi-select list
import MultiSelect from 'react-native-multiple-select';

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
        searchInputPlaceholderText="Search Items..."
        onChangeInput={ (text)=> console.log(text)}
        tagRemoveIconColor="#CCC"
        tagBorderColor="#CCC"
        tagTextColor="#CCC"
        selectedItemTextColor="#CCC"
        selectedItemIconColor="#CCC"
        itemTextColor="#000"
        displayKey="value"
        searchInputStyle={{ color: '#CCC' }}
        submitButtonColor="#CCC"
        submitButtonText="Submit"
    />
  );
}


export default FilterList;