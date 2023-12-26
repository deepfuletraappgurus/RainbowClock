import Spinner from '../Components/Spinner';
import React from 'react';
import { Image, ImageBackground, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, SafeAreaView, KeyboardAvoidingView, Keyboard } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker';
import Permission from 'react-native-permissions';
import BaseComponent from '../Components/BaseComponent';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Helper from '../Lib/Helper';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
import Constants from '../Components/Constants';
 

// Styles
import styles from './Styles/EditRewardsScreenStyles';

// Global Variables
const mAPi = Api.createSecure();

export default class EditRewardsScreen extends BaseComponent {

    static navigationOptions = ({ navigation }) => ({
        headerStyle: {
            backgroundColor: Colors.navHeaderLight,
            shadowOpacity: 0,
            shadowOffset: { height: 0, },
            elevation: 0,
            height: Metrics.navBarHeight,
            borderBottomWidth: 0,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0
        },
    });

    //constructor event
    constructor(props) {
        super(props)
        this.state = {
            arrReward: [],
            isUpdateReward: false,
            updateItem: '',
            updateIndex: -1,
            imageData: '',
            saveLoading: false,
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.getRewardList()
    }

    getRewardList = () => {
        mAPi.parentRewardList().then(response => {
            if (response.ok) {
                if (response.data.success) {
                    this.setState({ arrReward: response.data.data })
                } else {
                    Helper.showErrorMessage(response.data.message)
                }
            } else {
                Helper.showErrorMessage(response.problem)
            }
        }).catch(error => {
            console.log(error);
        })
    }

    btnGoBack = () => {
        this.props.navigation.goBack();
    }

    onPressClearReward = (item, index) => {
        item.clearLoading = true
        this.setState({})
        mAPi.clearReward(item.id).then(response => {
            item.clearLoading = false
            this.setState({})
            if (response.ok) {
                if (response.data.success) {
                    item.is_claimed = 0
                    this.setState({})
                } else {
                    Helper.showErrorMessage(response.data.message)
                }
            } else {
                Helper.showErrorMessage(response.problem)
            }
        })
    }

    onUpdate = (item, index, visible) => {
        this.setState({
            updateItem: item,
            updateIndex: index,
            isUpdateReward: visible,
            imageData: ''
        })
    }

    renderRewardRow = (item, index) => {
        return (
            <TouchableOpacity style={styles.rewardsItem} onPress={() => this.onUpdate(item, index, true)}>
                <View style={styles.rewardsItemContent}>
                    <Text style={styles.rewardsItemHeader}>{item.name.toUpperCase()}</Text>
                    <View style={styles.rewardItemImageContainer}>
                        <Image source={item.icon != '' ? { uri: item.icon } : Images.upload} style={styles.imagePlaceholder} />
                    </View>
                    <Text style={styles.specialRewardText}>{item.type == "Special" ? 'SPECIAL REWARD' : ''}</Text>
                    <View style={styles.rewardsItemFooter}>
                        <View style={styles.rewardRating}>
                            <Image source={item.type == "Special" ? Images.reward : Constants.standardRewardIcon} style={styles.rewardIcon} />
                            <Text style={styles.rewardText}>{item.no_of_tokens}</Text>
                        </View>
                        <TouchableOpacity style={styles.rewardClear} onPress={() => {
                            if (item.is_claimed == 1) {
                                this.onPressClearReward(item, index)
                            }
                        }}>
                            <View style={item.is_claimed == 1 ? null : styles.disable}>
                                {item.clearLoading ?
                                    <Spinner size='small' color={Colors.snow} />
                                    :
                                    <Text style={styles.rewardClearText}>{'Clear Reward'.toUpperCase()}</Text>
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
                </View >
            </TouchableOpacity >
        )
    }

    render() {
        return (
            <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                    <ScrollView contentContainerStyle={styles.ScrollView}>
                        <View style={[styles.container]}>
                            <View style={styles.clockHeader}>
                                <Text style={[styles.h1, styles.textCenter]}>{'Edit Rewards'.toUpperCase()}</Text>
                            </View>

                            <FlatList
                                contentContainerStyle={styles.rewardGridContainer}
                                numColumns={2}
                                data={this.state.arrReward}
                                keyExtractor={(item, index) => (index + '')}
                                renderItem={({ item, index }) => this.renderRewardRow(item, index)}
                                extraData={this.state}
                            // numColumns={2}
                            />
                        </View>
                    </ScrollView>
                    <View style={styles.formFooter}>
                        <TouchableOpacity style={styles.nextButton} onPress={() => this.btnGoBack()}>
                            <Image source={Images.circleArrowLeft} style={styles.circleArrow} />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.isUpdateReward}
                    onRequestClose={() => { }}>
                    <View style={[styles.modal, styles.modalBlueTrans]}>
                        <ImageBackground source={Images.blueBackground} style={styles.backgroundImageWithoutPadding}>
                            <SafeAreaView style={styles.SafeAreaView}>
                                <KeyboardAvoidingView style={styles.mainContainer} behavior={"padding"}>
                                    <ScrollView contentContainerStyle={styles.ScrollView}>
                                        <View style={styles.modalHeader}>
                                            <View style={styles.modalHeaderRight} />
                                            <View style={styles.modalHeaderRight}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        this.setState({ isUpdateReward: false })
                                                    }}>
                                                    <Icon name="times" size={26} color={'#fff'} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={styles.container}>
                                            <View style={styles.form}>
                                                <View style={styles.imageUploader}>
                                                    <View style={styles.uploadView}>
                                                        <Image source={this.state.updateItem.icon ? { uri: this.state.updateItem.icon } : Images.upload} style={this.state.updateItem.icon ? styles.uploadedImage : styles.uploadPlaceholder} />
                                                    </View>
                                                    <View style={styles.buttonRight}>
                                                        <TouchableOpacity style={[styles.button, styles.smallButton, styles.buttonCarrot, { marginBottom: 0 }]}
                                                            onPress={() => this.checkPermission()}>
                                                            <Text style={styles.smallButtonText}>{'Change Image'.toUpperCase()}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <View style={[styles.formControl, styles.formControlSmall, styles.borderColor]}>
                                                    <TextInput
                                                        autoCapitalize='characters'
                                                        style={[styles.input, styles.updateColor]}
                                                        value={this.state.updateItem.name}
                                                        placeholder={'Name'.toUpperCase()}
                                                        placeholderTextColor={Colors.placeHolderText}
                                                        underlineColorAndroid={'transparent'}
                                                        // placeholderTextColor={Colors.navHeader}
                                                        onChangeText={(rewardName) => {
                                                            this.state.updateItem.name = rewardName
                                                            this.setState({})
                                                        }}
                                                        autoCapitalize='characters'
                                                    />
                                                </View>
                                                <View style={[styles.iconContainer, { flexGrow: 1 }]}>
                                                    <Text style={[styles.title, styles.textCenter, styles.updateColor]}>{'Type of Tokens'.toUpperCase()}</Text>
                                                    <View style={styles.typeTokens}>
                                                        <TouchableOpacity
                                                            style={styles.tokensClick}
                                                            onPress={() => this.chooseToken(false)}>
                                                            <View style={this.state.updateItem.type === 'Special' ? styles.disable : null}>
                                                                <View style={[styles.tokensIconView, styles.borderColor]}>
                                                                    <Image source={Images.everyday} style={styles.tokensIcon} />
                                                                </View>
                                                                <Text style={[styles.tokensText, styles.textCenter, styles.updateColor]}>{'EVERYDAY\nREWARD'.toUpperCase()}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={styles.tokensClick}
                                                            onPress={() => this.chooseToken(true)}>
                                                            <View style={this.state.updateItem.type === 'Special' ? null : styles.disable}>
                                                                <View style={[styles.tokensIconView, styles.borderColor]}>
                                                                    <Image source={Images.special} style={styles.tokensIcon} />
                                                                </View>
                                                                <Text style={[styles.tokensText, styles.textCenter, styles.updateColor]}>{'SPECIAL\nREWARD'.toUpperCase()}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <View style={[styles.formControl, styles.formControlSmall, styles.borderColor]}>
                                                    <TextInput
                                                        style={[styles.input, styles.updateColor]}
                                                        value={this.state.updateItem.no_of_tokens}
                                                        placeholder={'HOW MANY TOKENS'.toUpperCase()}
                                                        underlineColorAndroid={'transparent'}
                                                        placeholderTextColor={Colors.placeHolderText}
                                                        onChangeText={(numberOfToken) => {
                                                            this.state.updateItem.no_of_tokens = numberOfToken
                                                            this.setState({})
                                                        }}
                                                        keyboardType='number-pad'
                                                    />
                                                </View>
                                                <View style={{ paddingLeft: 20, paddingRight: 20, width: '100%' }}>
                                                    <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginBottom: 0 }]} onPress={() => this.onPressSave()}>
                                                        {this.state.saveLoading ?
                                                            <Spinner size='small' color={Colors.snow} />
                                                            :
                                                            <Text style={styles.buttonText}>{'Save'.toUpperCase()}</Text>
                                                        }
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </ScrollView>

                                </KeyboardAvoidingView>
                            </SafeAreaView>
                        </ImageBackground>
                    </View>

                </Modal>
            </View>
        )
    }
    //#endregion

    isValidate = () => {
        if (this.state.updateItem.name.trim() == '') {
            Helper.showErrorMessage('Please enter reward name.');
            return false;
        } else if (this.state.updateItem.no_of_tokens.trim().toLocaleLowerCase() === 'select' || this.state.updateItem.no_of_tokens.trim() == '') {
            Helper.showErrorMessage('Please enter reward token.');
            return false;
        }
        return true;
    }

    onPressSave = () => {
        Keyboard.dismiss()
        if (this.isValidate()) {
            this.setState({ saveLoading: true })
            mAPi.updateReward(this.state.updateItem.id, this.state.updateItem.name, this.state.updateItem.type, this.state.updateItem.no_of_tokens, this.state.imageData).then(response => {

                this.setState({ saveLoading: false })

                if (response.ok) {
                    if (response.data.success) {
                        this.onUpdate('', -1, false)
                    } else {
                        Helper.showErrorMessage(response.data.message)
                    }
                } else {
                    Helper.showErrorMessage(response.problem)
                }

            }).catch(error => {
                console.log(error);
                this.setState({ saveLoading: false })
            })
        }
    }

    chooseToken = (isSpecialReward) => {
        if (isSpecialReward) {
            this.state.updateItem.type = 'Special'
        } else {
            this.state.updateItem.type = 'Standard'
        }
        this.setState({})
    }

    checkPermission = () => {
        Permission.checkMultiple(['photo', 'camera']).then(response => {

            if (response.photo == 'authorized') {
                if (response.camera == 'authorized') {
                    this.onPressSelectImage()
                } else {
                    Permission.request('camera').then(responseCamera => {
                        if (responseCamera == 'authorized') {
                            this.onPressSelectImage()
                        } else
                            Helper.showMessageWithOpenSetting('Can we access your camera? \n' +
                                Constants.APP_NAME + ' uses your camera to upload image.')
                    })
                }
            }
            else {
                Permission.request('photo').then(responsePhoto => {
                    if (responsePhoto == 'authorized') {
                        if (response.camera == 'authorized') {
                            this.onPressSelectImage()
                        } else {
                            Permission.request('camera').then(responseCamera => {
                                if (responseCamera == 'authorized') {
                                    this.onPressSelectImage()
                                } else
                                    Helper.showMessageWithOpenSetting('Can we access your camera? \n' +
                                        Constants.APP_NAME + ' uses your camera to upload image.')
                            })
                        }
                    } else {
                        Helper.showMessageWithOpenSetting('Can we access your photo library? \n' +
                            Constants.APP_NAME + ' uses your photo library to upload image.')
                    }
                })
            }
        })
    }

    onPressSelectImage() {
        ImagePicker.openPicker({
            cropping: true
        }).then(image => {
            console.log('image.path', image);
            this.state.updateItem.icon = image.path
            this.setState({ imageData: image })
        });
    }
}
