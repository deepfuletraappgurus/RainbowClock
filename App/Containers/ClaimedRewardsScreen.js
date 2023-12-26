import React from 'react';
import { Image, ImageBackground, ScrollView, SectionList, Text, TouchableOpacity, View } from 'react-native';
import BaseComponent from '../Components/BaseComponent';
import Api from '../Services/Api';
import { Colors, Images, Metrics } from '../Themes';
import * as Helper from '../Lib/Helper'
import Constants from '../Components/Constants';
 

// Styles
import styles from './Styles/ClaimedRewardsScreenStyles';
import Spinner from '../Components/Spinner';
import { FlatList } from 'react-native-gesture-handler';

// Global Variables
const mAPi = Api.createSecure();

export default class ClaimedRewardsScreen extends BaseComponent {

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
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.getRewardList()
        this.navFocusListener =  this.props.navigation.addListener('didFocus', () => {
            Helper.getChildRewardPoints(this.props.navigation)
          });
    }

    // componentWillUnmount() {
    //     this.navFocusListener.remove();
    // }

    getRewardList = () => {
        mAPi.parentRewardList(true).then(response => {
            if (response.ok) {
                if (response.data.success) {
                    this.groupBy(response.data.data)
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

    groupBy = (arr) => {
        // this gives an object with dates as keys
        const groups = arr.reduce((groups, data) => {
            const date = data.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(data);
            return groups;
        }, {});

        // Edit: to add it in the array format instead
        const groupArrays = Object.keys(groups).map((date) => {
            var arrData = groups[date]
            return {
                date,
                data: arrData
            };
        });
        this.setState({ arrReward: groupArrays })
    }

    onPressClearReward = (arritem, item, index) => {
        item.clearLoading = true
        this.setState({})
        mAPi.clearReward(item.id).then(response => {
            item.clearLoading = false
            this.setState({})
            if (response.ok) {
                if (response.data.success) {
                    arritem.data.splice(index, 1);
                    this.setState({})
                } else {
                    Helper.showErrorMessage(response.data.message)
                }
            } else {
                Helper.showErrorMessage(response.problem)
            }
        })
    }

    btnGoBack = () => {
        this.props.navigation.goBack();
    }

    renderRewardRow = (arritem, index) => {
        const grids = arritem.data.map((item, index) => {
            return this.renderItem(arritem, item, index);
        });
        return (
            <View style={styles.rewardGridContainer}>
                <Text style={styles.rewardsDate}>{Helper.dateFormater(arritem.date, 'YYYY-MM-DD', 'DD/MM/YYYY')}</Text>
                {grids}
            </View>
        )
    }

    renderItem(arritem, item, index) {
        return (
            <View style={styles.rewardsItem} >
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
                                this.onPressClearReward(arritem, item)
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
                </View>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.mainContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <ImageBackground source={Images.blueBackground} style={styles.backgroundImage}>
                    <ScrollView contentContainerStyle={styles.ScrollView}>
                        <View style={[styles.container]}>
                            <View style={styles.clockHeader}>
                                <Text style={[styles.h1, styles.textCenter]}>{'Claimed Rewards'.toUpperCase()}</Text>
                            </View>
                            <FlatList
                                keyboardShouldPersistTaps={'always'}
                                horizontal={false}
                                data={this.state.arrReward}
                                extraData={this.state}
                                keyExtractor={(item, index) => (index + '')}
                                renderItem={({ item, index }) => this.renderRewardRow(item, index)}
                            />
                        </View>
                    </ScrollView>
                    <View style={styles.formFooter}>
                        <TouchableOpacity style={styles.nextButton} onPress={() => this.btnGoBack()}>
                            <Image source={Images.circleArrowLeft} style={styles.circleArrow} />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
        )
    }
    //#endregion
}
