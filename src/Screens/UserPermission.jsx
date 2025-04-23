import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderSvg from '../assets/Svgs/HeaderSvg';
import {
    responsiveFontSize,
    responsiveHeight,
} from 'react-native-responsive-dimensions';

import ForwardIcon from '../assets/Svgs/ForwardIcon';
import Circle from '../assets/Svgs/Circle';
import RadioSelectedCheckbox from '../assets/Svgs/RadioSelectedCheckbox';

const UserPermission = ({ navigation }) => {
    const [selectedButton, setSelectedButton] = useState(null); // Track which button is selected

    const handlePress = (buttonType) => {
        setSelectedButton(buttonType);
    };

    const handleNextPress = () => {
        if (selectedButton === 'admin') {
            navigation.navigate('AdminLogin');
        } else if (selectedButton === 'user') {
            navigation.navigate('MainUserLogin');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <HeaderSvg />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text1}>WELCOME TO</Text>
                <Text style={styles.text2}>Secure WebApp</Text>
            </View>
            <View style={styles.btnContainer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handlePress('admin')}
                    style={{ opacity: selectedButton && selectedButton !== 'admin' ? 0.4 : 1 }}
                >
                    <View
                        style={[
                            styles.btn,
                            selectedButton === 'admin' && styles.activeBtn,
                        ]}
                    >
                        {selectedButton === 'admin' ? (
                            <RadioSelectedCheckbox />
                        ) : (
                            <Circle />
                        )}
                        <Text
                            style={[
                                styles.btnText,
                                selectedButton === 'admin' && styles.activeBtnText,
                            ]}
                        >
                            Sign In as Admin
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handlePress('user')}
                    style={{ opacity: selectedButton && selectedButton !== 'user' ? 0.4 : 1 }}
                >
                    <View
                        style={[
                            styles.btn,
                            selectedButton === 'user' && styles.activeBtn,
                        ]}
                    >
                        {selectedButton === 'user' ? (
                            <RadioSelectedCheckbox />
                        ) : (
                            <Circle />
                        )}
                        <Text
                            style={[
                                styles.btnText,
                                selectedButton === 'user' && styles.activeBtnText,
                            ]}
                        >
                            Sign In as User
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleNextPress}>
                <View
                    style={[
                        styles.nextBtn,
                        { opacity: selectedButton ? 1 : 0.5 },
                    ]}
                >
                    <Text style={styles.nextBtnText}>Next</Text>
                    <ForwardIcon />
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default UserPermission;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFEFF',
        padding: 20,
    },
    header: {
        alignSelf: 'flex-end',
    },
    textContainer: {
        marginTop: 10,
    },
    text1: {
        fontSize: responsiveFontSize(4),
        color: '#222327',
        fontWeight: '500',
    },
    text2: {
        fontSize: responsiveFontSize(2.1),
        color: '#61A443',
        fontWeight: '500',
        lineHeight: 22.05,
    },
    btnContainer: {
        alignSelf: 'center',
        flexDirection: 'column',
        gap: responsiveHeight(2),
        marginTop: responsiveHeight(14),
    },
    btn: {
        paddingHorizontal: responsiveHeight(4.5),
        paddingVertical: responsiveHeight(1.6),
        borderColor: '#111220',
        borderWidth: 1,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 15,
        backgroundColor: '#FEFEFF',
    },
    activeBtn: {
        backgroundColor: '#F0FFEB',
        borderWidth: 0,
    },
    btnText: {
        fontSize: responsiveFontSize(2),
        color: '#4D8733',
        fontWeight: '500',
    },
    activeBtnText: {
        color: '#4D8733',
    },
    nextBtn: {
        width: '90%',
        height: responsiveHeight(6.5),
        backgroundColor: '#4D8733',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: 60,
        gap: 10,
    },
    nextBtnText: {
        fontSize: responsiveFontSize(2.1),
        color: 'white',
        fontWeight: '500',
    },
});
