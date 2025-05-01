import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput as RNTextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import HeaderSvg from '../../assets/Svgs/HeaderSvg';
import LockSvg from '../../assets/Svgs/LockSvg';
import EmailSvg from '../../assets/Svgs/EmailSvg';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import Circle from '../../assets/Svgs/Circle';
import RadioSelectedCheckbox from '../../assets/Svgs/RadioSelectedCheckbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../Context/GlobalContext';

const MainUserLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { getDataByToken, showToast } = useGlobalContext()


    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    // Navigate to UserMainScreen if token exists
                    navigation.replace('UserMainScreen');
                }
            } catch (err) {
                console.error('Error checking token:', err);
            }
        };

        checkToken();
    }, [navigation]);


    // Determine if both email and password are filled
    const isFormValid = email.trim() !== '' && password.trim() !== '';

    // Handle sign-in logic with API call
    const handleSignIn = async () => {
        if (!isFormValid) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            showToast({
                type: 'ERROR',
                message: 'Please enter your email',
            });
            return;
        }

        if (!emailRegex.test(email)) {
            showToast({
                type: 'ERROR',
                message: 'Please enter a valid email address',
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('https://secure.ceoitbox.com/api/signin', {
                email,
                password,
            });


            if (response.data && response.data.token) {
                // console.log(response); 
                // console.log(response.data);
                // console.log('login User Id', response.data.body._id);
                await AsyncStorage.setItem('userId', response.data.body._id);

                const token = response.data.token;
                // console.log('Token:', token);
                await AsyncStorage.setItem('token', token);

                showToast({
                    type: 'SUCCESS',
                    message: 'Login successfully'
                })

                navigation.navigate('UserMainScreen');

                console.log('Login successfully:', response.data);
                setEmail('');
                setPassword('');
            } else {
                showToast({
                    type: 'ERROR',
                    message: 'Login failed. Please check your credentials'
                })
            }
        } catch (err) {
            console.error(err);
            showToast({
                type: 'ERROR',
                message: 'Failed to sign in. Please try again'
            })
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'android' ? 'padding' : 'padding'}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <HeaderSvg />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text1}>WELCOME TO</Text>
                    <Text style={styles.text2}>Secure WebApp</Text>
                </View>

                <View style={styles.signIn}>
                    <MaterialIcons name={'login'} size={responsiveFontSize(2.7)} color={'black'} />
                    <Text style={styles.signInText}>Sign In</Text>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <EmailSvg style={styles.icon} />
                        <RNTextInput
                            style={styles.textInput}
                            placeholder="Email ID*"
                            placeholderTextColor={'#222327'}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType='email-address'
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                        <LockSvg style={styles.icon} />
                        <RNTextInput
                            style={styles.textInput}
                            placeholder="Password*"
                            placeholderTextColor={'#222327'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            keyboardType='default'
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.togglePassword}>
                            {showPassword ? (
                                <Feather name="eye" size={18} color="222327" />
                            ) : (
                                <Feather name="eye-off" size={18} color="222327" />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10, }} >

                        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                            {
                                rememberMe ? <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#E0FFD9', justifyContent: 'center', alignItems: 'center' }}>
                                    <RadioSelectedCheckbox />
                                </View> : <Circle />
                            }
                        </TouchableOpacity>
                        <Text>Remember Me</Text>
                    </View>


                    <TouchableOpacity onPress={() => navigation.navigate('MainUserOtpScreen')}>
                        <View style={styles.otpContainer}>
                            <Text style={styles.otpContainerText}>
                                Log In With OTP
                            </Text>
                        </View>
                    </TouchableOpacity>

                </View>

                {/* {
                error && <View>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            } */}

                <TouchableOpacity onPress={handleSignIn} disabled={!isFormValid}  >
                    <View
                        style={[
                            styles.nextBtn,
                            { opacity: isFormValid ? 1 : 0.5 },
                        ]}
                    >
                        {isLoading ? (
                            <Text style={styles.nextBtnText}><ActivityIndicator size={'small'} color={'#FFF'} /> </Text>
                        ) : (
                            <>
                                <MaterialIcons name={'login'} size={20} color={'white'} />
                                <Text style={styles.nextBtnText}>Sign In</Text>
                            </>
                        )}
                    </View>
                </TouchableOpacity>

            </View>

        </KeyboardAvoidingView>
    );
};

export default MainUserLogin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFEFF',
    },
    header: {
        alignSelf: 'flex-end',
        marginTop: 20,
        marginHorizontal: 20,
    },
    textContainer: {
        marginLeft: 20,
    },
    text1: {
        fontSize: responsiveFontSize(3.5),
        color: '#222327',
        fontFamily: 'Poppins-SemiBold'
    },
    text2: {
        fontSize: responsiveFontSize(2.1),
        color: '#61A443',
        fontFamily: 'Montserrat-Medium',
        lineHeight: 22.05,
    },
    inputContainer: {
        width: responsiveWidth(90),
        alignSelf: 'center'
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: responsiveHeight(1.6),
        borderWidth: 0.6,
        borderColor: '#61A443',
        borderRadius: 10,
        paddingLeft: 10,
    },
    textInput: {
        flex: 1,
        color:'#222327',
        minHeight:responsiveHeight(5),
        paddingLeft: 10,
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular'
    },
    icon: {
        // width: 200,
        // height: 200,
    },
    togglePassword: {
        paddingRight: 10,
    },
    signIn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: responsiveHeight(2),
        marginLeft: 20,
        marginTop: responsiveHeight(6),
    },
    signInText: {
        fontSize: responsiveFontSize(2.7),
        color: 'black',
        fontFamily: 'Poppins-Medium',
        marginLeft: 10,
    },
    nextBtn: {
        width: '90%',
        height: responsiveHeight(6.5),
        backgroundColor: '#4D8733',
        borderRadius: responsiveFontSize(2),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: responsiveHeight(6),
        gap: 10,
    },
    nextBtnText: {
        fontSize: responsiveFontSize(2.1),
        color: 'white',
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
    otpContainer: {
        borderWidth: 1,
        borderColor: '#61A443',
        width: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: responsiveFontSize(3),
        paddingVertical: responsiveHeight(0.7),
        marginTop: 10,
        marginLeft: responsiveHeight(2)
    },
    otpContainerText: {
        color: '#222327',
        fontSize: responsiveFontSize(1.6),
        fontFamily: 'Poppins-Regular',
    }
});
