import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput as RNTextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import HeaderSvg from '../../assets/Svgs/HeaderSvg';
import LockSvg from '../../assets/Svgs/LockSvg';
import EmailSvg from '../../assets/Svgs/EmailSvg';
import {
    responsiveFontSize,
    responsiveHeight,
} from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import CircleCheckBoxSvg from '../../assets/Svgs/CircleCheckBoxSvg';
import Circle from '../../assets/Svgs/Circle';
import RadioSelectedCheckbox from '../../assets/Svgs/RadioSelectedCheckbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../Context/GlobalContext';

const MainUserLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
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

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('https://secure.ceoitbox.com/api/signin', {
                email,
                password,
            });
            // console.log(response); 
            // console.log(response.data);
            // console.log('login User Id', response.data.body._id);
            await AsyncStorage.setItem('userId', response.data.body._id);

            const token = response.data.token;
            // console.log('Token:', token);
            await AsyncStorage.setItem('token', token);


            if (response.data && response.data.token) {

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
                // setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error(err);
            showToast({
                type: 'ERROR',
                message: 'Failed to sign in. Please try again'
            })
            // setError('Failed to sign in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
        style={{flex:1}}
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
                    <MaterialIcons name={'login'} size={25} color={'black'} />
                    <Text style={styles.signInText}>Sign In</Text>
                </View>

                <View style={styles.inputContainer}>
                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                        <EmailSvg style={styles.icon} />
                        <RNTextInput
                            style={styles.textInput}
                            placeholder="Email ID*"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                        <LockSvg style={styles.icon} />
                        <RNTextInput
                            style={styles.textInput}
                            placeholder="Password*"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.togglePassword}>
                            {showPassword ? (
                                <Feather name="eye" size={18} color="gray" />
                            ) : (
                                <Feather name="eye-off" size={18} color="gray" />
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

                <TouchableOpacity onPress={handleSignIn} disabled={isLoading}>
                    <View
                        style={[
                            styles.nextBtn,
                            { opacity: isFormValid && !isLoading ? 1 : 0.5 },
                        ]}
                    >
                        {isLoading ? (
                            <Text style={styles.nextBtnText}><ActivityIndicator size={'small'} color={'green'} /> </Text>
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
        fontWeight: '600',
    },
    text2: {
        fontSize: responsiveFontSize(2.1),
        color: '#61A443',
        fontWeight: '500',
        lineHeight: 22.05,
    },
    inputContainer: {
        // marginTop: responsiveHeight(5),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 0.6,
        borderColor: '#61A443',
        borderRadius: 10,
        paddingLeft: 10,
    },
    textInput: {
        flex: 1,
        height: 50,
        paddingLeft: 10,
        fontSize: 18,
    },
    icon: {
        width: 20,
        height: 20,
    },
    togglePassword: {
        color: 'gray',
        paddingRight: 10,
    },
    signIn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: responsiveHeight(6),
    },
    signInText: {
        fontSize: responsiveFontSize(3),
        color: 'black',
        fontWeight: '500',
        marginLeft: 10,
    },
    nextBtn: {
        width: '100%',
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
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: responsiveFontSize(2),
        marginTop: 10,
        textAlign: 'center',
    },
    otpContainer: {
        borderWidth: 1,
        borderColor: '#61A443',
        width: '42%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        paddingVertical: 7,
        paddingHorizontal: 16,
        marginTop: 10,
    },
    otpContainerText: {
        color: '#222327',
        fontSize: responsiveFontSize(1.8),
        // fontFamily:'Poppins',
        fontWeight: '400',
    }
});
