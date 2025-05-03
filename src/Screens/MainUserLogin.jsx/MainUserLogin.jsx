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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../Context/GlobalContext';
import checkValidLogin from '../../Components/checkValidLogin';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const MainUserLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpLoader, setOtpLoader] = useState(false);
    const [otp, setOtp] = useState('');
    const [visibleOtpUI, setVisibleOtpUI] = useState(false);

    const { showToast } = useGlobalContext();
    
    // Always declare hooks at the top level, outside of any conditions
    const codeFieldRef = useBlurOnFulfill({ value: otp, cellCount: 5 });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: otp,
        setValue: setOtp,
    });

    useEffect(() => {
        const checkToken = async () => {
            try {
                const data = await AsyncStorage.getItem('loginInfo');
                const parsedData = JSON.parse(data);
                const token = parsedData?.token;
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

    useEffect(()=>{
        console.log('otp',otp)
    },[otp])

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
            // Check if OTP is required for this login
            const validationResult = await checkValidLogin({ email, password, otp });
        
            // ✅ Show toast and return if there's a validation error
            if (validationResult?.error) {
                showToast({
                    type: 'ERROR',
                    message: validationResult.error, // Make sure this is a string
                });
                setIsLoading(false);
                return;
            }
        
            const askOtp = validationResult?.askOTP;
        
            if (askOtp && !visibleOtpUI) {
                // First time OTP is requested, show OTP UI
                setVisibleOtpUI(true);
                await sendOtp();
                setIsLoading(false);
                return;
            } else if (askOtp && visibleOtpUI) {
                // User has entered OTP, validate it
                if (!otp || otp.length < 5) {
                    showToast({
                        type: 'ERROR',
                        message: 'Please enter a valid OTP'
                    });
                    setIsLoading(false);
                    return;
                }
            }
        
            // Proceed with login API call
            const response = await axios.post('https://secure.ceoitbox.com/api/signin', {
                email,
                password,
                otp: visibleOtpUI ? otp : '',
            });
        
            console.log('login response', response.data);
        
            if (response.data && response.data.token) {
                await AsyncStorage.setItem('userId', response.data.body._id);
        
                const token = response.data.token;
                const role = response.data.body.role;
                const loginInfo = {
                    email: email.trim(),
                    token: token,
                    role: role,
                };
                await AsyncStorage.setItem('loginInfo', JSON.stringify(loginInfo));
        
                showToast({
                    type: 'SUCCESS',
                    message: 'Login successful'
                });
        
                navigation.navigate('UserMainScreen');
                setEmail('');
                setPassword('');
                setOtp('');
                setVisibleOtpUI(false);
            } else {
                showToast({
                    type: 'ERROR',
                    message: 'Login failed. Please check your credentials'
                });
            }
        } catch (err) {
            console.error(err);
            showToast({
                type: 'ERROR',
                message: 'Failed to sign in. Please try again'
            });
        } finally {
            setIsLoading(false);
        }
        
    };

    const sendOtp = async () => {
        if (!email.trim()) {
            showToast({
                type: 'ERROR',
                message: 'Please enter your email',
            });
            return;
        }

        setOtpLoader(true);

        try {
            const response = await axios.post('https://secure.ceoitbox.com/api/sendUserOTP', {
                email,
            });

            if (response.data) {
                // console.log('OTP sent successfully:', response.data);
                // Store the OTP from server response for validation later
                // setServerOtp(response.data.OTP);
                showToast({
                    type: 'SUCCESS',
                    message: 'OTP sent successfully'
                });
            }
        } catch (err) {
            console.error(err);
            showToast({
                type: 'ERROR',
                message: 'Failed to send OTP. Please try again'
            });
        } finally {
            setOtpLoader(false);
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
                                <Feather name="eye" size={18} color="#222327" />
                            ) : (
                                <Feather name="eye-off" size={18} color="#222327" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* OTP Input Field - Always render but conditionally display */}
                    <View style={{ marginTop: 10, display: visibleOtpUI ? 'flex' : 'none' }}>
                        <CodeField
                            ref={codeFieldRef}
                            {...props}
                            value={otp}
                            onChangeText={setOtp}
                            cellCount={5}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            autoComplete={Platform.select({ android: 'sms-otp', default: 'one-time-code' })}
                            renderCell={({ index, symbol, isFocused }) => (
                                <Text
                                    key={index}
                                    style={[
                                        {
                                            width: responsiveHeight(6),
                                            height: responsiveHeight(6),
                                            borderWidth: 1,
                                            borderColor: '#61A443',
                                            borderRadius: 10,
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontSize: responsiveFontSize(3.5),
                                            color: '#222327',
                                        },
                                        isFocused && { borderColor: '#61A443', backgroundColor: '#61A443', },
                                    ]}
                                >
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            )}
                        />
                    </View>

                    {visibleOtpUI && (
                        <TouchableOpacity onPress={sendOtp}>
                            <View style={styles.sendOtp}>
                                {otpLoader ? (
                                    <ActivityIndicator size="small" color="#61A443" />
                                ) : (
                                    <Text style={styles.sendOtpText}>Resend OTP</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity 
                    onPress={handleSignIn} 
                    disabled={!isFormValid || (visibleOtpUI && otp.length < 5)}
                >
                    <View
                        style={[
                            styles.nextBtn,
                            { opacity: (isFormValid && (!visibleOtpUI || otp.length === 5)) ? 1 : 0.5 },
                        ]}
                    >
                        {isLoading ? (
                            <ActivityIndicator size={'small'} color={'#FFF'} />
                        ) : (
                            <>
                                <MaterialIcons name={'login'} size={20} color={'white'} />
                                <Text style={styles.nextBtnText}>
                                    Sign In
                                </Text>
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
        color: '#222327',
        minHeight: responsiveHeight(5),
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
    sendOtp: {
        marginTop: responsiveHeight(2),
        borderWidth: 1,
        borderColor: '#61A443',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: responsiveFontSize(3),
        paddingVertical: 6,
        paddingHorizontal: 18,
        alignSelf: 'center',
    },
    sendOtpText: {
        color: '#222327',
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'Poppins-Regular',
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