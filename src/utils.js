import tinycolor from 'tinycolor2'
import { PanResponder } from 'react-native'

/**
 * Converts color to hsv representation.
 * @param {string} color any color represenation - name, hexa, rgb
 * @return {object} { h: number, s: number, v: number } object literal
 */
export function toHsv(color) {
  return tinycolor(color).toHsv()
}

/**
 * Converts hsv object to hexa color string.
 * @param {object} hsv { h: number, s: number, v: number } object literal
 * @return {string} color in hexa representation
 */
export function fromHsv(hsv) {
  return tinycolor(hsv).toHexString()
}

const fn = () => true;
/**
 * Simplified pan responder wrapper.
 */
export function createPanResponder({ onStart = fn, onMove = fn, onEnd = fn }) {
  return PanResponder.create({
    onStartShouldSetPanResponder: fn,
    onStartShouldSetPanResponderCapture: fn,
    onMoveShouldSetPanResponder: fn,
    onMoveShouldSetPanResponderCapture: fn,
    onPanResponderTerminationRequest: fn,
    onPanResponderGrant: (evt, state) => {
      return onStart({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY }, evt, state)
    },
    onPanResponderMove: (evt, state) => {
      return onMove({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY }, evt, state)
    },
    onPanResponderRelease: (evt, state) => {
      return onEnd({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY }, evt, state)
    },
  })
}

/**
 * Rotates point around given center in 2d.
 * Point is object literal { x: number, y: number }
 * @param {point} point to be rotated
 * @param {number} angle in radians
 * @param {point} center to be rotated around
 * @return {point} rotated point
 */
export function rotatePoint(point, angle, center = { x: 0, y: 0 }) {
  // translation to origin
  const transOriginX = point.x - center.x
  const transOriginY = point.y - center.y

  // rotation around origin
  const rotatedX = transOriginX * Math.cos(angle) - transOriginY * Math.sin(angle)
  const rotatedY = transOriginY * Math.cos(angle) + transOriginX * Math.sin(angle)

  // translate back from origin
  const normalizedX = rotatedX + center.x
  const normalizedY = rotatedY + center.y
  return {
    x: normalizedX,
    y: normalizedY,
  }
}

const hexRegex = /^#[A-Za-z0-9]{6}$/;
const rgbRegex = /^rgba?\((\d{1,3}\s*,?\s*){3,4}\)$/;

const addZero = str => str.length ===1 ? '0' + str : str;

export function rgbToHex(rgb) {
  if (rgbRegex.test(rgb)) {
    let hex = '#';
    rgb = rgb.replace(/rgba?\(|\)/g, '').split(',');
    if (rgb.length > 3) {
      rgb.length = 3;
    }
    rgb.forEach(item=>{
      item = parseInt(item);
      if (item < 0) {
        item = 0;
      } else if (item > 255) {
        item = 255;
      }
      item = item.toString(16);
      hex += addZero(item);
    });
    return hex;
  } else if (/#.{6}/.test(rgb)) {
    return rgb;
  } else {
    return '#ffffff';
  }
}


export function getOppositeColor(hex) {
  if (rgbRegex.test(hex)) {
    hex = rgbToHex(hex);
  } else if (!hexRegex.test(hex)) {
    return '#000000';
  }
  let oppositeColor = '#';

  oppositeColor += addZero((255 - parseInt(hex.slice(1,3), 16)).toString(16));
  oppositeColor += addZero((255 - parseInt(hex.slice(3,5), 16)).toString(16));
  oppositeColor += addZero((255 - parseInt(hex.slice(5,7), 16)).toString(16));

  return oppositeColor;
}

export function hexToRgb(hex, alpha) {
  if (rgbRegex.test(hex)) {
    return hex;
  } else if (!hexRegex.test(hex)) {
    return 'rgb(255, 255, 255)'
  }
  let rgb = 'rgb{{C}}(';
  rgb += parseInt(hex.slice(1,3), 16) + ',';
  rgb += parseInt(hex.slice(3,5), 16) + ',';
  rgb += parseInt(hex.slice(5,7), 16);
  if (alpha !== undefined) {
    rgb += ',' + alpha.toString() + ')';
    rgb = rgb.replace('{{C}}', 'a');
  } else {
    rgb += ')';
    rgb = rgb.replace('{{C}}', '');
  }

  return rgb;
}