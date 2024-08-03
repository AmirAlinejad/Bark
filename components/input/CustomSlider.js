import React from 'react';
import { View } from 'react-native';
// colors
import { useTheme } from '@react-navigation/native';
// slider
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const CustomSlider = ({ values, onValuesChange }) => {
    const { colors } = useTheme();
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
            selectedStyle={{backgroundColor: colors.text, height: 4}}
            unselectedStyle={{backgroundColor: colors.gray, height: 4}}
            markerContainerStyle={{marginTop: 2}}
            customMarker={() => {
            return (
                <View style={{height: 20, width: 20, borderRadius: 10, backgroundColor: colors.text}} />
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