import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ImageBackground } from 'react-native';
import HeaderSvg from '../assets/Svgs/HeaderSvg';
import {
    responsiveFontSize,
    responsiveHeight,
} from 'react-native-responsive-dimensions';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../Context/GlobalContext';
import { ActivityIndicator } from 'react-native-paper';

const AdminLogin = ({ navigation }) => {

    const [isLoading, setIsLoading] = useState(false)

    const { showToast } = useGlobalContext()

    GoogleSignin.configure({
        webClientId: '295572026253-vt87r81lovfs1ptcpiomkals5l1n3qgb.apps.googleusercontent.com',
        scopes: ['profile', 'email', 'openid'],
        offlineAccess: true,
    });

    const googleLogin = async () => {
        try {
            setIsLoading(true);
            await GoogleSignin.hasPlayServices(); // Ensure Play Services are available

            const userInfo = await GoogleSignin.signIn(); // Sign in and get user info
            const tokens = await GoogleSignin.getTokens(); // Get access and ID tokens

            const email = userInfo.data.user.email; // Extract the user's email
            const idToken = tokens.idToken; // Extract the ID token

            if (email && idToken) {
                const response = await axios.post(
                    'https://secure.ceoitbox.com/api/auth/google/login',
                    {
                        email, // Send the email
                        idToken, // Send the ID token
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.data) {
                    const userId = response.data.body._id;
                    const token = response.data.token;
                    const role = response?.data?.body?.role;

                    // console.log('admin login role:', role); // Debugging log

                    const loginInfo = {
                        email: email,
                        token: token,
                        role: role,
                    }

                    await AsyncStorage.setItem('loginUser', JSON.stringify(response.data));
                    await AsyncStorage.setItem('userId', userId);
                    await AsyncStorage.setItem('loginInfo', JSON.stringify(loginInfo));
                    setIsLoading(false);
                    showToast({
                        type: 'SUCCESS',
                        message: 'Login successfully',
                    });
                    navigation.navigate('BottomNavigation');
                }
            } else {
                setIsLoading(false);
                console.warn('No email or ID token received. Please check Google SignIn configuration.');
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Google login error:', error);
        }
    };




    return (
        <ImageBackground
            source={require('../assets/images/background.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <HeaderSvg />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text1}>WELCOME TO</Text>
                    <Text style={styles.text2}>Secure WebApp</Text>
                </View>
                <View style={styles.adminSignIn}>
                    <Text style={styles.adminSignInText}>Admin Sign In</Text>
                </View>
                <TouchableOpacity onPress={googleLogin}>
                    <View style={styles.btn}>
                        <Image style={styles.googleImg} source={require('../assets/images/google.png')} />
                        <View>
                            {
                                isLoading ? (
                                    <ActivityIndicator size={'small'} color='#4D8733' animating={true} />) : (
                                    <Text style={styles.btnText}>Sign In With Google</Text>
                                )
                            }
                        </View>
                    </View>

                </TouchableOpacity>
                <View style={styles.horizontalLine}></View>
            </View>
        </ImageBackground>
    );
};

export default AdminLogin;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        // width: '100%',
        // height: '30%',
        justifyContent: 'flex-start',
        zIndex: 1,
    },
    container: {
        // height: '60%',
        backgroundColor: '#FEFEFF',
        flex: 1,
    },
    header: {
        alignSelf: 'flex-end',
        marginTop: 20,
        marginRight: 20,
    },
    textContainer: {
        // marginTop: 20,
        marginHorizontal: 20,
    },
    text1: {
        fontSize: responsiveFontSize(3.5),
        color: '#222327',
        fontFamily: 'Poppins-SemiBold'
    },
    text2: {
        fontSize: responsiveFontSize(2.1),
        color: '#61A443',
        fontFamily: 'Montserrat-SemiBold',
        lineHeight: 22.05,
    },
    adminSignIn: {
        alignSelf: 'center',
        marginTop: responsiveHeight(10),
    },
    adminSignInText: {
        color: '#222327',
        fontSize: responsiveFontSize(2.7),
        fontFamily: 'Poppins-Medium',
    },
    btn: {
        width: '65%',
        paddingVertical: responsiveHeight(2),
        borderColor: '#111220',
        borderWidth: 1,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#FEFEFF',
        alignSelf: 'center',
        marginTop: responsiveHeight(1.5),
    },
    googleImg: {
        width: responsiveHeight(2.4),
        height: responsiveHeight(2.4),
        resizeMode: 'contain',
    },
    btnText: {
        fontSize: responsiveFontSize(1.9),
        color: '#4D8733',
        fontFamily: 'Poppins-Medium',
        // letterSpacing: 0.3,
    },
    horizontalLine: {
        marginTop: responsiveHeight(10),
        width: '100%',
        height: 1,
        backgroundColor: '#E8E8E8',
    },
});
