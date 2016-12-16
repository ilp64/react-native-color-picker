# react-native-color-picker

React Native implementation of color picker for both Android and iOS.

![android preview](preview_android.png)
![iphone preview](preview_iphone.png)

* [x] works both in controlled and uncontrolled way
* [x] old color can be displayed for visual comparison

## Getting started
Install the color picker
```
npm install react-native-color-picker --save
```
And use it in your application
```
import { ColorPicker } from 'react-native-color-picker'
...
    <ColorPicker
      onColorSelected={color => alert(`Color selected: ${color}`)}
      style={{flex: 1}}
    />
```
Color picker will use space you provide. Therefore it is necessary to provide styles that will determine picker's size.

## API

## Limitations
* Does not work well within `ScrollView` due to touch event interference.

## Thanks
Our implementation was inspired by [Android Holo ColorPicker](https://github.com/LarsWerkman/HoloColorPicker)
