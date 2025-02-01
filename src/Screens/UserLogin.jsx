import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import HeaderSvg from '../assets/Svgs/HeaderSvg';
import LockSvg from '../assets/Svgs/LockSvg';
import EmailSvg from '../assets/Svgs/EmailSvg';
import {
    responsiveFontSize,
    responsiveHeight,
} from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const UserLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // To track loading state
    const [error, setError] = useState(null); // To handle error messages

    // Determine if both email and password are filled
    const isFormValid = email.trim() !== '' && password.trim() !== '';

    // Handle sign-in logic with API call
    const handleSignIn = async () => {
        if (!isFormValid) return;
    
        setIsLoading(true);
        setError(null);
    
        try {
            const response = await axios.post('https://datawebform.onrender.com/api/signin', {
                email,
                password,
            });
            console.log(response); // Log the full response object to inspect the data
            // Assuming successful response will contain a token or user data
            if (response.data && response.data.token) {

                navigation.navigate('Home')

                console.log('Login successful:', response.data);
                setEmail('');
                setPassword('')

            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to sign in. Please try again.');
        } finally {
            setIsLoading(false); // Make sure to reset loading state
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
                    <Text
                        style={styles.togglePassword}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </Text>
                </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>} {/* Display error */}

            <TouchableOpacity onPress={handleSignIn} disabled={isLoading}>
                <View
                    style={[
                        styles.nextBtn,
                        { opacity: isFormValid && !isLoading ? 1 : 0.5 },
                    ]}
                >
                    {isLoading ? (
                        <Text style={styles.nextBtnText}>Loading...</Text>
                    ) : (
                        <>
                            <MaterialIcons name={'login'} size={20} color={'white'} />
                            <Text style={styles.nextBtnText}>Sign In</Text>
                        </>
                    )}
                </View>
            </TouchableOpacity>

        </View>
    );
};

export default UserLogin;

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
        fontWeight: 'bold',
    },
    text2: {
        fontSize: responsiveFontSize(2.1),
        color: '#61A443',
        fontWeight: 'bold',
        lineHeight: 22.05,
    },
    inputContainer: {
        // marginTop: responsiveHeight(5),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingLeft: 10,
    },
    textInput: {
        flex: 1,
        height: 40,
        paddingLeft: 10,
        fontSize: 16,
    },
    icon: {
        width: 20,
        height: 20,
    },
    togglePassword: {
        color: 'blue',
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
        marginLeft: 10, // Adds spacing between icon and text
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
});
