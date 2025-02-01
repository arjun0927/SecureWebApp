import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput as RNTextInput, ActivityIndicator } from 'react-native';
import HeaderSvg from '../../assets/Svgs/HeaderSvg';
import EmailSvg from '../../assets/Svgs/EmailSvg';
import {
	responsiveFontSize,
	responsiveHeight,
} from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Circle from '../../assets/Svgs/Circle';
import RadioSelectedCheckbox from '../../assets/Svgs/RadioSelectedCheckbox';
import axios from 'axios';
import { useGlobalContext } from '../../Context/GlobalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainUserOtpScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isLoading2, setIsLoading2] = useState(false);
	const [error, setError] = useState(null);
	const [rememberMe, setRememberMe] = useState(false);
	const [otp, setOtp] = useState(['', '', '', '', '']);
	const [message, setMessage] = useState(null);

	const {showToast}=useGlobalContext()

	// Determine if both email and password are filled
	// const isFormValid = email.trim() !== '' && otp.trim() !== '';
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

		setIsLoading(true);
		setError(null);
		setMessage(null);

		try {
			const response = await axios.post('https://secure.ceoitbox.com/api/sendUserOTP', {email:email });
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

	// Handle sign-in logic with API call
	const handleSignIn = async () => {
		// Check if all fields are valid
		// if (!isFormValid || otp.some((digit) => digit.trim() === '')) {
		// 	setError('Please fill in all the fields, including OTP.');
		// 	return;
		// }

		setIsLoading2(true);
		setError(null);

		try {
			const response = await axios.post('https://secure.ceoitbox.com/api/signin', {
				email,
				otp: otp.join(''),
			});

			console.log(response.data);
			if (response.data && response.data.token) {
				// console.log('token',response.data.token)
				// console.log('userId',response.data.body._id)
				await AsyncStorage.setItem('token',response?.data?.token)
				await AsyncStorage.setItem('userId',response?.data?.body?._id)
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
								digit && { backgroundColor: '#61A443', color: 'white', fontSize: 22, fontWeight: '500' },
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


				{/* <View style={styles.otpContainer2}>
					<Text style={styles.otpContainerText2}>
						Log In With OTP
					</Text>
				</View> */}

			</View>

			<TouchableOpacity onPress={handleSignIn} disabled={isLoading2}>
				<View
					style={[
						styles.nextBtn,
						// { opacity: isFormValid && !isLoading ? 1 : 0.5 },
					]}
				>
					{isLoading2 ? (
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
	);
};

export default MainUserOtpScreen;

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
	otpWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	otpBox: {
		width: 50,
		height: 50,
		borderWidth: 1,
		borderColor: '#61A443',
		borderRadius: 10,
		textAlign: 'center',
		fontSize: 18,
		color: '#222327',
	},
	rememberMeWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	rememberMeSelected: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#E0FFD9',
		justifyContent: 'center',
		alignItems: 'center',
	},
	otpContainer: {
		borderWidth: 1,
		borderColor: '#61A443',
		borderRadius: 30,
		paddingVertical: 7,
		alignItems: 'center',
	},
	otpContainerText: {
		color: '#222327',
		fontSize: 14,
	},
	sendOtp: {
		borderWidth: 0.7,
		borderColor: '#222327',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 30,
		paddingVertical: 6,
		paddingHorizontal: 18,
		alignSelf: 'center',
	},
	sendOtpText: {
		color: '#222327',
		fontSize: responsiveFontSize(1.7),
		// fontFamily:'Poppins',
		fontWeight: '400',
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
		fontSize: responsiveFontSize(1.7),
		// fontSize:14,
	},
	resendOtpContainerText2: {
		textAlign: 'center',
		color: '#61A443',
		fontSize: responsiveFontSize(1.9),
		fontWeight: 'bold'
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
	otpContainer2: {
		borderWidth: 1,
		borderColor: '#61A443',
		alignSelf: 'flex-start',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 30,
		paddingVertical: 7,
		paddingHorizontal: 16,
		marginTop: 10,
	},
	otpContainerText2: {
		color: '#222327',
		fontSize: responsiveFontSize(1.8),
		// fontFamily:'Poppins',
		fontWeight: '400',
	}
});
