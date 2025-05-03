import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput as RNTextInput, ActivityIndicator } from 'react-native';
import HeaderSvg from '../../assets/Svgs/HeaderSvg';
import EmailSvg from '../../assets/Svgs/EmailSvg';
import {
	responsiveFontSize,
	responsiveHeight,
	responsiveWidth,
} from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Circle from '../../assets/Svgs/Circle';
import RadioSelectedCheckbox from '../../assets/Svgs/RadioSelectedCheckbox';
import axios from 'axios';
import { useGlobalContext } from '../../Context/GlobalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmailRegex from '../../Components/EmailRegex';

const MainUserOtpScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isLoading2, setIsLoading2] = useState(false);
	const [error, setError] = useState(null);
	const [rememberMe, setRememberMe] = useState(false);
	const [otp, setOtp] = useState(['', '', '', '', '']);
	const [message, setMessage] = useState(null);

	const { showToast } = useGlobalContext()

	// Determine if both email and password are filled
	const isFormValid = email.trim() !== '' && otp.every(digit => digit.trim() !== '');

	const handleOtpChange = (value, index) => {
		const updatedOtp = [...otp];
		updatedOtp[index] = value;
		setOtp(updatedOtp);

		// Automatically focus the next input
		if (value.length === 1 && index < otp.length - 1) {
			const nextInput = index + 1;
			otpRefs[nextInput]?.focus();
		}
	};

	const handleOtpKeyPress = (nativeEvent, index) => {
		if (nativeEvent.key === 'Backspace') {
			const updatedOtp = [...otp];
			updatedOtp[index] = ''; // Clear the current input
			setOtp(updatedOtp);

			// Move focus to the previous input
			if (index > 0) {
				const prevInput = index - 1;
				otpRefs[prevInput]?.focus();
			}
		}
	};

	const otpRefs = [];
	const sendOtp = async () => {
		if (!email.trim()) {
			setError('Please enter your email.');
			showToast({
				type: 'ERROR',
				message: 'Please enter your email',
			});
			return;
		}

		if (!EmailRegex(email)) {
			showToast({
				type: 'ERROR',
				message: 'Please enter valid email address',
			});
			return;
		}

		setIsLoading(true);
		setError(null);
		setMessage(null);

		try {
			const response = await axios.post('https://secure.ceoitbox.com/api/sendUserOTP', { email: email });
			console.log(response.data)
			setMessage(response.data.message || 'OTP sent successfully.');
			showToast({
				type: 'SUCCESS',
				message: 'OTP Sent Successfully',
			});
		} catch (err) {
			setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const resendOtp = async () => {
		await sendOtp();
	};

	const handleSignIn = async () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email.trim()) {
			setError('Please enter your email.');
			showToast({
				type: 'ERROR',
				message: 'Please enter your email',
			});
			return;
		}

		if (!emailRegex.test(email)) {
			setError('Please enter a valid email address.');
			showToast({
				type: 'ERROR',
				message: 'Please enter a valid email address',
			});
			return;
		}

		setIsLoading2(true);
		setError(null);

		try {
			const response = await axios.post('https://secure.ceoitbox.com/api/signin', {
				email,
				otp: otp.join(''),
			});

			console.log(response.data);
			if (response.data && response.data.token) {
				const token = response.data.token;
				const role = response.data.body.role;
				const loginInfo = {
					email: email.trim(),
					token: token,
					role: role,
				}
				await AsyncStorage.setItem('loginInfo', JSON.stringify(loginInfo));
				await AsyncStorage.setItem('userId', response?.data?.body?._id)
				navigation.navigate('UserMainScreen');
				// console.log('Login successful:', response.data);
				showToast({
					type: 'SUCCESS',
					message: 'Login successfully',
				});

				// Reset inputs
				setEmail('');
				setPassword('');
				setOtp(['', '', '', '', '']);
			} else {
				setError(response.data.error || 'Login failed. Please check your credentials and OTP.');
			}
		} catch (err) {
			console.error(err);
			setError('Failed to sign in. Please try again.');
		} finally {
			setIsLoading2(false);
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
						keyboardType='email-address'
						placeholderTextColor={'#222327'}
						value={email}
						onChangeText={setEmail}
					/>
				</View>

				{/* OTP Input */}
				<View style={styles.otpWrapper}>
					{otp.map((digit, index) => (
						<RNTextInput
							key={index}
							style={[
								styles.otpBox,
								digit && { backgroundColor: '#61A443', color: 'white', fontSize: responsiveFontSize(3), fontWeight: '500' },
							]}
							value={digit}
							onChangeText={(value) => handleOtpChange(value, index)}
							keyboardType="number-pad"
							maxLength={1}
							ref={(ref) => (otpRefs[index] = ref)}
							onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent, index)}
						/>
					))}
				</View>


				<TouchableOpacity onPress={sendOtp} disabled={isLoading}>
					<View style={styles.sendOtp}>
						{isLoading ? (
							<ActivityIndicator size="small" color="#61A443" />
						) : (
							<Text style={styles.sendOtpText}>Send OTP</Text>
						)}
					</View>
				</TouchableOpacity>

				<View style={styles.resendOtpContainer}>
					<Text style={styles.resendOtpContainerText1}>Didn’t receive OTP?</Text>
					<TouchableOpacity onPress={resendOtp} disabled={isLoading}>
						<Text style={styles.resendOtpContainerText2}>Resend OTP</Text>
					</TouchableOpacity>
				</View>

				{/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10, }} >

					<TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
						{
							rememberMe ? <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#E0FFD9', justifyContent: 'center', alignItems: 'center' }}>
								<RadioSelectedCheckbox />
							</View> : <Circle />
						}
					</TouchableOpacity>
					<Text>Remember Me</Text>
				</View> */}

			</View>

			<TouchableOpacity onPress={handleSignIn} disabled={!isFormValid}>
				<View
					style={[
						styles.nextBtn,
						{ opacity: isFormValid ? 1 : 0.5 },
					]}
				>
					{isLoading2 ? (
						<ActivityIndicator size={'small'} color={'#FFF'} />
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

export default MainUserOtpScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FEFEFF',
		// padding: 20,
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
	otpWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
		width: responsiveWidth(90)
	},
	otpBox: {
		width: responsiveWidth(15),
		height: responsiveWidth(15),
		borderWidth: 1,
		borderColor: '#61A443',
		borderRadius: 10,
		textAlign: 'center',
		fontSize: responsiveFontSize(3),
		color: '#222327',
	},


	sendOtp: {
		borderWidth: 0.7,
		borderColor: '#222327',
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
	resendOtpContainer: {
		flexDirection: 'row',
		alignSelf: 'center',
		gap: 5 * 2,
		alignItems: 'center',
		marginVertical: 10,
		paddingTop: 5,
	},
	resendOtpContainerText1: {
		textAlign: 'center',
		color: 'black',
		fontSize: responsiveFontSize(1.4),
		fontFamily: 'Poppins-Regular',
	},
	resendOtpContainerText2: {
		textAlign: 'center',
		color: '#61A443',
		fontSize: responsiveFontSize(1.7),
		fontFamily: 'Poppins-Medium',
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
});
