import React, {Component, PropTypes} from 'react'
import {TouchableOpacity, Slider, View, Image, StyleSheet, InteractionManager, Platform, Text, Dimensions} from 'react-native'
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import tinycolor from 'tinycolor2'
import {createPanResponder, getOppositeColor, floatToInt} from './utils'
const window = Dimensions.get('window');

export class HoloColorPicker extends Component {

	constructor(props, ctx) {
		super(props, ctx)
		this.state = {
			color: {h: 0, s: 1, l: 1},
			pickerSize: null,
		}
		if (props.oldColor) {
			this.state.color = tinycolor(props.oldColor).toHsl()
		}
		if (props.defaultColor) {
			this.state.color = tinycolor(props.defaultColor).toHsl()
		}
		this._layout = {width: 0, height: 0, x: 0, y: 0}
		this._pageX = 0
		this._pageY = 0
		this._onLayout = this._onLayout.bind(this)
		this._onSValueChange = this._onSValueChange.bind(this)
		this._onVValueChange = this._onVValueChange.bind(this)
		this._onColorSelected = this._onColorSelected.bind(this)
		this._onOldColorSelected = this._onOldColorSelected.bind(this)
		this._hideSaturationSlider = props.hideSaturationSlider;
		this._hideLightnessSlider = props.hideLightnessSlider;
    this._saturationMin = props.saturationMin;
    this._saturationMax = props.saturationMax;
    this._lightnessMin = props.lightnessMin;
    this._lightnessMax = props.lightnessMax;

  }

	_getColor() {
		const passedColor = typeof this.props.color === 'string'
			? tinycolor(this.props.color).toHsl()
			: this.props.color
		return passedColor || this.state.color
	}

	_onColorSelected() {
		const {onColorSelected} = this.props
		const color = tinycolor(this._getColor()).toHexString()
		onColorSelected && onColorSelected(color)
	}

	_onOldColorSelected() {
		const {oldColor, onOldColorSelected} = this.props
		const color = tinycolor(oldColor)
		this.setState({color: color.toHsl()})
		onOldColorSelected && onOldColorSelected(color.toHexString())
	}

	_onSValueChange(s) {
		const {h, l} = this._getColor()
		this._onColorChange({h, s, l})
	}

	_onVValueChange(l) {
		const {h, s} = this._getColor()
		this._onColorChange({h, s, l})
	}

	_onColorChange(color) {
		this.setState({color})
		if (this.props.onColorChange) {
			this.props.onColorChange(color)
		}
	}

	_onLayout(l) {
		this._layout = l.nativeEvent.layout
		const {width, height} = this._layout
		const pickerSize = Math.min(width, height)
		if (this.state.pickerSize !== pickerSize) {
			this.setState({pickerSize})
		}
		// layout.x, layout.y is always 0
		// we always measure because layout is the same even though picker is moved on the page
		InteractionManager.runAfterInteractions(() => {
			// measure only after (possible) animation ended
			this.refs.pickerContainer && this.refs.pickerContainer.measure((x, y, width, height, pageX, pageY) => {
				// picker position in the screen
				this._pageX = pageX
				this._pageY = pageY
			})
		})
	}

	_computeHValue(x, y) {
		const mx = this.state.pickerSize / 2
		const my = this.state.pickerSize / 2
		const dx = x - mx
		const dy = y - my
		const rad = Math.atan2(dx, dy) + Math.PI + Math.PI / 2
		return rad * 180 / Math.PI % 360
	}

	_hValueToRad(deg) {
		const rad = deg * Math.PI / 180
		return rad - Math.PI - Math.PI / 2
	}

	getColor() {
		return tinycolor(this._getColor()).toHexString()
	}

	componentWillMount() {
		const handleColorChange = ({x, y}) => {
			const {s, l} = this._getColor()
			const marginLeft = (this._layout.width - this.state.pickerSize) / 2
			const marginTop = (this._layout.height - this.state.pickerSize) / 2
			const relativeX = x - this._pageX - marginLeft;
			const relativeY = y - this._pageY - marginTop;
			const h = this._computeHValue(relativeX, relativeY)
			this._onColorChange({h, s, l})
		}
		this._pickerResponder = createPanResponder({
			onStart: handleColorChange,
			onMove: handleColorChange,
		});

		this.oldColorText = this.props.oldColorText;
		this.selectedColorText = this.props.selectedColorText;
	}

	render() {
		const {pickerSize} = this.state
		const {oldColor, style} = this.props
		const color = this._getColor()
		const {h, s, l} = color
		const angle = this._hValueToRad(h)
		const selectedColor = tinycolor(color).toHexString()
		const indicatorColor = tinycolor({h, s: 1, l: 1}).toHexString()
		const computed = makeComputedStyles({
			pickerSize,
			selectedColor,
			indicatorColor,
			oldColor,
			angle,
		})

		let oldTextColor, selectedTextColor;
    if (this.oldColorText) {
      oldTextColor = getOppositeColor(computed.originalPreview.backgroundColor);
    }
    if (this.selectedColorText) {
      selectedTextColor = getOppositeColor(computed.selectedPreview.backgroundColor);

    }
		return (
			<View style={style}>
				{this.props.note ? <Text style={[styles.note, {textAlign: this.props.notePos}]}>{this.props.note}</Text> : null}
				<View onLayout={this._onLayout} ref='pickerContainer' style={styles.pickerContainer}>
					{!pickerSize ? null :
						<View>
							<View
								{...this._pickerResponder.panHandlers}
								style={[styles.picker, computed.picker]}
								collapsable={false}
							>
								<Image
									source={{uri: 'https://gw.alicdn.com/tfs/TB1U1WmQFXXXXXpXXXXXXXXXXXX-510-510.png'}}
									resizeMode='contain'
									style={[styles.pickerImage]}
								/>
								<View style={[styles.pickerIndicator, computed.pickerIndicator]}/>
							</View>
							{oldColor &&
							<TouchableOpacity
								style={[styles.selectedPreview, computed.selectedPreview]}
								onPress={this._onColorSelected}
								activeOpacity={0.7}
							>
								{this.selectedColorText  ?
                  this.selectedColorText.split('').map((item, index)=> <Text key={index} style={{color: selectedTextColor}}>{item}</Text>) :
                  null}
							</TouchableOpacity>
							}
							{oldColor &&
							<TouchableOpacity
								style={[styles.originalPreview, computed.originalPreview]}
								onPress={this._onOldColorSelected}
								activeOpacity={0.7}
							>
								{this.oldColorText ?
									this.oldColorText.split('').map((item, index)=> <Text key={index} style={{color: oldTextColor}}>{item}</Text>) :
									null}
							</TouchableOpacity>
							}
							{!oldColor &&
							<TouchableOpacity
								style={[styles.selectedFullPreview, computed.selectedFullPreview]}
								onPress={this._onColorSelected}
								activeOpacity={0.7}
							/>
							}
						</View>
					}
				</View>


				{
					!this._hideSaturationSlider
						? <View>{this.getSlider(s, this._saturationMin, this._saturationMax, this._onSValueChange)}</View>
						: null
				}


				{
					!this._hideLightnessSlider
						? (<View style={styles.secondSlider}>{this.getSlider(l, this._lightnessMin, this._lightnessMax, this._onVValueChange)}</View>)
						: null
				}


			</View>
		)
	}

	getSlider(value, min, max, valueChange) {
    let cV = floatToInt(value, 3),
      cMin = floatToInt(min, 3),
      cMax = floatToInt(max, 3);


    if (Platform.OS === 'android') {
      return <MultiSlider values={[cV]}
	                 onValuesChange={v => valueChange(v[0] / 1000)}
	                 min={cMin}
	                 max={cMax}
	                 // step={1}
	                 sliderLength={window.width - 30}
	                 markerStyle={{
                     height: 24,
                     width: 24,
                     borderRadius: 12
                   }}
	                 pressedMarkerStyle={{
                     height: 24,
                     width: 24,
                     borderRadius: 12
                   }}/>;
    }

		return <View><Slider value={value} onValueChange={valueChange} minimumValue={min} maximumValue={max}/></View>;
	}

}

HoloColorPicker.propTypes = {
	color: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.shape({h: PropTypes.number, s: PropTypes.number, l: PropTypes.number}),
	]),
	defaultColor: PropTypes.string,
	oldColor: PropTypes.string,
	onColorChange: PropTypes.func,
	onColorSelected: PropTypes.func,
	onOldColorSelected: PropTypes.func,
	oldColorText: PropTypes.string,
	selectedColorText: PropTypes.string,
	note: PropTypes.string,
	notePos: PropTypes.string
}

const makeComputedStyles = ({
	                            indicatorColor,
	                            selectedColor,
	                            oldColor,
	                            angle,
	                            pickerSize,
                            }) => {
	const summarySize = 0.5 * pickerSize
	const indicatorPickerRatio = 42 / 510 // computed from picker image
	const indicatorSize = indicatorPickerRatio * pickerSize
	const pickerPadding = indicatorSize / 3
	const indicatorRadius = pickerSize / 2 - indicatorSize / 2 - pickerPadding
	const mx = pickerSize / 2
	const my = pickerSize / 2
	const dx = Math.cos(angle) * indicatorRadius
	const dy = Math.sin(angle) * indicatorRadius
	return {
		picker: {
			padding: pickerPadding,
			width: pickerSize,
			height: pickerSize,
		},
		pickerIndicator: {
			top: mx + dx - indicatorSize / 2,
			left: my + dy - indicatorSize / 2,
			width: indicatorSize,
			height: indicatorSize,
			borderRadius: indicatorSize / 2,
			backgroundColor: indicatorColor,
		},
		selectedPreview: {
			width: summarySize / 2,
			height: summarySize,
			top: pickerSize / 2 - summarySize / 2,
			left: Math.floor(pickerSize / 2),
			borderTopRightRadius: summarySize / 2,
			borderBottomRightRadius: summarySize / 2,
			backgroundColor: selectedColor,
		},
		originalPreview: {
			width: Math.ceil(summarySize / 2),
			height: summarySize,
			top: pickerSize / 2 - summarySize / 2,
			left: pickerSize / 2 - summarySize / 2,
			borderTopLeftRadius: summarySize / 2,
			borderBottomLeftRadius: summarySize / 2,
			backgroundColor: oldColor,
		},
		selectedFullPreview: {
			width: summarySize,
			height: summarySize,
			top: pickerSize / 2 - summarySize / 2,
			left: pickerSize / 2 - summarySize / 2,
			borderRadius: summarySize / 2,
			backgroundColor: selectedColor,
		},
	}
}

const styles = StyleSheet.create({
	pickerContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	pickerImage: {
		flex: 1,
		width: null,
		height: null,
	},
	pickerIndicator: {
		position: 'absolute',
		// Shadow only works on iOS.
		shadowColor: 'black',
		shadowOpacity: 0.3,
		shadowOffset: {width: 3, height: 3},
		shadowRadius: 4,

		// This will elevate the view on Android, causing shadow to be drawn.
		elevation: 5,
	},
	selectedPreview: {
		position: 'absolute',
		borderLeftWidth: 0,
    alignItems: 'center',
		justifyContent: 'center'
	},
	originalPreview: {
		position: 'absolute',
		borderRightWidth: 0,
    alignItems: 'center',
		justifyContent: 'center'
	},
	selectedFullPreview: {
		position: 'absolute',
	},
	pickerAlignment: {
		alignItems: 'center',
	},
	secondSlider: {
		marginTop: Platform.OS === 'android' ? 20 : 0
	},
	note: {
    color: '#fff',
		textAlign: 'left',
		fontSize: 12
	}
})
