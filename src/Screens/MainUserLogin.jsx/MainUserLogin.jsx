import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput as RNTextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
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
import Header from '../../Components/Header';
import { ActivityIndicator } from 'react-native-paper';

const MainUserLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpLoader, setOtpLoader] = useState(false);
    const [otp, setOtp] = useState('');
    const [visibleOtpUI, setVisibleOtpUI] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [focusedInput, setFocusedInput] = useState(null);

    const { showToast } = useGlobalContext();

    const codeFieldRef = useBlurOnFulfill({ value: otp, cellCount: 5 });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: otp,
        setValue: setOtp,
    });

    const navigateToDestination = useCallback((role, shouldReplace = false) => {
        const destination = role === 'ADMIN' ? 'BottomNavigation' : 'UserMainScreen';
        
        if (shouldReplace) {
            navigation.replace(destination);
        } else {
            navigation.navigate(destination);
        }
    }, [navigation]);

    // Clear form data
    const clearFormData = useCallback(() => {
        setEmail('');
        setPassword('');
        setOtp('');
        setVisibleOtpUI(false);
        setActiveIndex(0);
        setFocusedInput(null);
    }, []);

    // Store login info securely
    const storeLoginInfo = useCallback(async (token, role, userId) => {
        try {
            const loginInfo = {
                email: email.trim(),
                token,
                role,
                timestamp: Date.now()
            };
            
            await Promise.all([
                AsyncStorage.setItem('userId', userId),
                AsyncStorage.setItem('loginInfo', JSON.stringify(loginInfo))
            ]);
            
            return true;
        } catch (error) {
            console.error('Error storing login info:', error);
            return false;
        }
    }, [email]);

    // Check existing session
    useEffect(() => {
        const checkExistingSession = async () => {
            try {
                const data = await AsyncStorage.getItem('loginInfo');
                if (!data) return;

                const parsedData = JSON.parse(data);
                const { token, role, timestamp } = parsedData;
                
                // Check if token exists and is not expired (optional: add expiry check)
                if (token && role) {
                    // Optional: Check if token is still valid with server
                    navigateToDestination(role, true);
                }
            } catch (error) {
                console.error('Error checking existing session:', error);
                // Clear corrupted data
                await AsyncStorage.multiRemove(['loginInfo', 'userId']);
            }
        };

        checkExistingSession();
    }, [navigateToDestination]);

    // Form validation
    const isFormValid = email.trim() !== '' && password.trim() !== '';

    useEffect(() => {
        if (otp.length < 5) {
            setActiveIndex(otp.length);
        }
    }, [otp]);

    // Email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle navigation after successful login
    const handleSuccessfulLogin = useCallback(async (response) => {
        try {
            const { token, body } = response.data;
            const { _id: userId, role } = body;

            // Store login information
            const storeSuccess = await storeLoginInfo(token, role, userId);
            
            if (!storeSuccess) {
                throw new Error('Failed to store login information');
            }

            // Show success message
            showToast({
                type: 'SUCCESS',
                message: 'Login successful'
            });

            // Clear form data
            clearFormData();

            // Navigate to appropriate screen
            navigateToDestination(role);
            
        } catch (error) {
            console.error('Error handling successful login:', error);
            showToast({
                type: 'ERROR',
                message: 'Login successful but failed to save session'
            });
        }
    }, [storeLoginInfo, showToast, clearFormData, navigateToDestination]);

    // Main sign-in handler
    const handleSignIn = async () => {
        if (!isFormValid) {
            showToast({
                type: 'ERROR',
                message: 'Please fill in all required fields'
            });
            return;
        }

        if (!validateEmail(email)) {
            showToast({
                type: 'ERROR',
                message: 'Please enter a valid email address'
            });
            return;
        }

        setIsLoading(true);

        try {
            // Check if OTP is required
            const validationResult = await checkValidLogin({ email, password, otp });

            if (validationResult?.error) {
                showToast({
                    type: 'ERROR',
                    message: validationResult.error
                });
                return;
            }

            const askOtp = validationResult?.askOTP;

            // Handle OTP flow
            if (askOtp && !visibleOtpUI) {
                setVisibleOtpUI(true);
                await sendOtp();
                return;
            } else if (askOtp && visibleOtpUI) {
                if (!otp || otp.length < 5) {
                    showToast({
                        type: 'ERROR',
                        message: 'Please enter a valid 5-digit OTP'
                    });
                    return;
                }
            }

            // API call for login
            const response = await axios.post('https://secure.ceoitbox.com/api/signin', {
                email: email.trim(),
                password,
                otp: visibleOtpUI ? otp : '',
            });

            // Handle successful response
            if (response.data?.token && response.data?.body) {
                await handleSuccessfulLogin(response);
            } else {
                showToast({
                    type: 'ERROR',
                    message: 'Invalid response from server'
                });
            }

        } catch (error) {
            console.error('Login error:', error);
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                showToast({
                    type: 'ERROR',
                    message: 'Invalid email or password'
                });
            } else if (error.response?.status === 422) {
                showToast({
                    type: 'ERROR',
                    message: 'Invalid OTP. Please try again'
                });
            } else {
                showToast({
                    type: 'ERROR',
                    message: 'Login failed. Please check your internet connection'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Send OTP
    const sendOtp = async () => {
        if (!email.trim()) {
            showToast({
                type: 'ERROR',
                message: 'Please enter your email first'
            });
            return;
        }

        if (!validateEmail(email)) {
            showToast({
                type: 'ERROR',
                message: 'Please enter a valid email address'
            });
            return;
        }

        setOtpLoader(true);

        try {
            const response = await axios.post('https://secure.ceoitbox.com/api/sendUserOTP', {
                email: email.trim(),
            });

            if (response.data) {
                showToast({
                    type: 'SUCCESS',
                    message: 'OTP sent successfully'
                });
            }
        } catch (error) {
            console.error('OTP sending error:', error);
            showToast({
                type: 'ERROR',
                message: 'Failed to send OTP. Please try again'
            });
        } finally {
            setOtpLoader(false);
        }
    };

    // Handle cell press for OTP
    const handleCellPress = (index) => {
        setActiveIndex(index);
        if (codeFieldRef?.current) {
            codeFieldRef.current.focus();
        }
    };

    // Handle OTP change
    const handleOtpChange = (text) => {
        if (text.length < otp.length) {
            const newOtp = otp.slice(0, activeIndex - 1) + otp.slice(activeIndex);
            setOtp(newOtp);
            setActiveIndex(Math.max(0, activeIndex - 1));
        } else if (text.length > otp.length) {
            const newChar = text.charAt(text.length - 1);
            if (/^\d$/.test(newChar) && activeIndex < 5) {
                const newOtp = otp.slice(0, activeIndex) + newChar + otp.slice(activeIndex);
                setOtp(newOtp.slice(0, 5));
                setActiveIndex(Math.min(newOtp.length, 5));
            }
        }
    };

    // Check if form is ready for submission
    const isSubmitReady = isFormValid && (!visibleOtpUI || otp.length === 5);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Header />
                
                <View style={styles.signIn}>
                    <MaterialIcons name="login" size={responsiveFontSize(2.7)} color="black" />
                    <Text style={styles.signInText}>Sign In</Text>
                </View>

                <View style={styles.inputContainer}>
                    {/* Email Input */}
                    <View style={[
                        styles.inputWrapper,
                        focusedInput === 'email' && styles.inputWrapperFocused
                    ]}>
                        <EmailSvg width={responsiveFontSize(2.3)} height={responsiveFontSize(2.2)} />
                        <RNTextInput
                            style={styles.textInput}
                            placeholder="Email ID*"
                            placeholderTextColor="gray"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={[
                        styles.inputWrapper,
                        focusedInput === 'password' && styles.inputWrapperFocused
                    ]}>
                        <LockSvg width={responsiveFontSize(2.3)} height={responsiveFontSize(2.2)} />
                        <RNTextInput
                            style={styles.textInput}
                            placeholder="Password*"
                            placeholderTextColor="gray"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                        />
                        <TouchableOpacity 
                            onPress={() => setShowPassword(!showPassword)} 
                            style={styles.togglePassword}
                        >
                            <Feather 
                                name={showPassword ? "eye" : "eye-off"} 
                                size={responsiveFontSize(2.3)} 
                                color="gray" 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* OTP Input */}
                    {visibleOtpUI && (
                        <View style={styles.otpFieldContainer}>
                            <CodeField
                                ref={codeFieldRef}
                                {...props}
                                value={otp}
                                onChangeText={handleOtpChange}
                                cellCount={5}
                                keyboardType="number-pad"
                                textContentType="oneTimeCode"
                                autoComplete={Platform.select({ 
                                    android: 'sms-otp', 
                                    default: 'one-time-code' 
                                })}
                                renderCell={({ index, symbol, isFocused }) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleCellPress(index)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.cell,
                                            {
                                                borderColor: (isFocused || index === activeIndex) 
                                                    ? '#61A443' : '#ccc',
                                                backgroundColor: symbol ? '#61A443' : 'transparent',
                                            },
                                        ]}>
                                            <Text style={[
                                                styles.cellText,
                                                { color: symbol ? '#FFF' : '#000' }
                                            ]}>
                                                {symbol || (isFocused && index === activeIndex ? 
                                                    <Cursor style={{ backgroundColor: '#61A443' }} /> : null)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />

                            {/* Hidden TextInput for cursor control */}
                            <RNTextInput
                                style={{ height: 0, width: 0, opacity: 0 }}
                                value={otp}
                                onChangeText={handleOtpChange}
                                keyboardType="number-pad"
                                maxLength={5}
                                selection={{ start: activeIndex, end: activeIndex }}
                                onSelectionChange={(event) => {
                                    setActiveIndex(event.nativeEvent.selection.start);
                                }}
                            />
                        </View>
                    )}

                    {/* Resend OTP Button */}
                    {visibleOtpUI && (
                        <TouchableOpacity onPress={sendOtp} style={styles.sendOtp}>
                            {otpLoader ? (
                                <ActivityIndicator size="small" color="#61A443" />
                            ) : (
                                <Text style={styles.sendOtpText}>Resend OTP</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                    onPress={handleSignIn}
                    disabled={!isSubmitReady || isLoading}
                    style={[
                        styles.nextBtn,
                        { opacity: (isSubmitReady && !isLoading) ? 1 : 0.5 },
                    ]}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <>
                            <MaterialIcons name="login" size={responsiveFontSize(2)} color="white" />
                            <Text style={styles.nextBtnText}>Sign In</Text>
                        </>
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default MainUserLogin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFEFF',
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
    inputContainer: {
        width: responsiveWidth(90),
        alignSelf: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: responsiveHeight(1.6),
        borderWidth: 1,
        borderColor: '#61A443',
        borderRadius: 10,
        paddingLeft: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inputWrapperFocused: {
        borderWidth: 1.5,
        borderColor: '#4D8733',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    textInput: {
        flex: 1,
        color: '#222327',
        minHeight: responsiveHeight(5.5),
        paddingLeft: 10,
        fontSize: responsiveFontSize(1.8),
        fontFamily: 'Poppins-Regular',
        paddingVertical: 8,
    },
    togglePassword: {
        paddingRight: 10,
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
    otpFieldContainer: {
        marginTop: 10,
    },
    cell: {
        width: responsiveHeight(6),
        height: responsiveHeight(5.5),
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    cellText: {
        fontSize: responsiveFontSize(3.5),
        textAlign: 'center',
    },
});