import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TouchableOpacity, Text } from 'react-native'
import ExamplesRegistry from '../Services/ExamplesRegistry'
import styles from './Styles/PinScreenStyles'

// Note that this file (App/Components/RoundedButton) needs to be
// imported in your app somewhere, otherwise your component won't be
// compiled and added to the examples dev screen.

// Ignore in coverage report
/* istanbul ignore next */
ExamplesRegistry.addComponentExample('Pin TextInput', () =>
    <View style={styles.pinBox}>
        <TextInput style={styles.input} />
    </View>
)

export default class PinTextInput extends Component {
    static propTypes = {
        onPress: PropTypes.func,
        text: PropTypes.string,
        children: PropTypes.string,
        navigator: PropTypes.object
    }

    constructor(props){
        super(props)
        this.state={
            ref=props.ref
        }
    }

    getText() {
        const buttonText = this.props.text || this.props.children || ''
        return buttonText.toUpperCase()
    }

    render() {
        return (
            <View style={styles.pinBox} >
                <TextInput style={styles.input}
                    ref="pin4"
                    textAlign={'center'}
                    keyboardType={"number-pad"}
                    maxLength={1}
                    onKeyPress={(e) => {
                        if (e.nativeEvent.key == "Backspace") {
                            this.manageNextField(4, '')
                        }
                        else { this.manageNextField(4, e.nativeEvent.key) }
                    }}
                    onChangeText={(e) => {
                        if (Platform.OS != 'ios') {
                            this.manageNextField(4, e)
                        }
                        else if (e.length == 6) {
                            this.manageAllInputs(e)
                        }
                    }} />/>
            </View>
        )
    }
}
