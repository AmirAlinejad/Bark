import React from 'react';
import { View } from 'react-native';
// colors
import { Colors } from '../../styles/Colors';
// slider
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const CustomSlider = ({ values, onValuesChange }) => {
    return (
        <MultiSlider
            values={values}
            sliderLength={250}
            onValuesChange={onValuesChange}
            touchDimensions={{
            height: 50,
            width: 50,
            borderRadius: 15,
            slipDisplacement: 200,
            }}
            selectedStyle={{backgroundColor: Colors.black, height: 4}}
            unselectedStyle={{backgroundColor: Colors.gray, height: 4}}
            markerContainerStyle={{marginTop: 2}}
            customMarker={() => {
            return (
                <View style={{height: 20, width: 20, borderRadius: 10, backgroundColor: Colors.black}} />
            )
            }}
            containerStyle={{height: 30}}
            min={0}
            max={24}
            step={1}
            allowOverlap
            snapped         
        />
    )
}

export default CustomSlider;