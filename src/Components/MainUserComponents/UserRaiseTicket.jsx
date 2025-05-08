import {
	StyleSheet,
	Text,
	// TextInput,
	View,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Image,
	BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../Context/GlobalContext';
import RNFS from 'react-native-fs';
import Backhandler from '../Backhandler';

const UserRaiseTicket = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [issueType, setIssueType] = useState('');
	const [priority, setPriority] = useState('');
	const [isAccordionOpen, setIsAccordionOpen] = useState(false);
	const [imageUri, setImageUri] = useState(null);
	const [loader, setLoader] = useState(false);
	const [base64Image, setBase64Image] = useState('');

	const navigation = useNavigation();
	const { showToast } = useGlobalContext();

	const handleSave = async () => {
		if (!isFormValid) return;
		setLoader(true);

		const payload = {
			"Issue Statement": issueType,
			"customerName": name,
			"email": email,
			"Priority Level": priority,
			"phone": password,
			"sheets": "Sheet To App",
			"Upload Problem Screenshot": base64Image,
		};

		// console.log('Payload:', payload);

		const token = await AsyncStorage.getItem('token');
		try {
			const response = await axios.post(
				'https://secure.ceoitbox.com/api/helpdesk/raiseTicket',
				payload,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log('Response:', response.data);

			if (response.status === 200) {
				setLoader(false);
				showToast({
					type: 'SUCCESS',
					message: 'Ticket raised successfully',
				});
				// Clear form
				setEmail('');
				setName('');
				setPassword('');
				setIssueType('');
				setPriority('');
				setBase64Image('');
				setImageUri(null);
			}
		} catch (error) {
			console.error('API call error:', error);
			alert('Failed to raise ticket. Please try again.');
			setLoader(false);
		}
	};
	const isFormValid = name && email;
	const toggleAccordion = () => {
		setIsAccordionOpen(!isAccordionOpen);
	};

	const selectPriority = (level) => {
		setPriority(level);
		setIsAccordionOpen(false);
	};


	const openGallery = () => {
		const options = {
			mediaType: 'photo',
			quality: 1,
		};
		launchImageLibrary(options, async (response) => {
			if (response.didCancel) {
				// console.log('User cancelled image picker');
			} else if (response.errorMessage) {
				console.error('ImagePicker Error: ', response.errorMessage);
			} else {
				const uri = response.assets[0].uri;
				// console.log('imageuri', uri);

				// Extract the last part of the file name
				const fileName = uri.split('/').pop(); // Extract file name from the URI
				// console.log('File Name:', fileName);

				setImageUri(fileName); // Set only the file name
				// Convert image to Base64
				const base64String = await RNFS.readFile(uri, 'base64');
				setBase64Image(base64String); // Store the Base64 string in a state
			}
		});
	};

	Backhandler();

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity
						style={{ flexDirection: 'row' , alignItems:'center' }}
						onPress={() => navigation.goBack()}
					>
						<Feather name="chevron-left" size={responsiveFontSize(2.3)} color="black" />

						<Text style={styles.headerTitle}>Raise Tickets</Text>
					</TouchableOpacity>
				</View>

				<ScrollView contentContainerStyle={styles.form}>
					<View style={styles.inputGroup}>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
							label='Customer Name*'
							underlineColor='#B9BDCF'
							activeUnderlineColor='#767A8D'
							textColor='black'
						/>
					</View>
					<View style={styles.inputGroup}>

						<TextInput
							style={styles.input}
							value={email}
							onChangeText={setEmail}
							label='Customer Email*'
							underlineColor='#B9BDCF'
							activeUnderlineColor='#B9BDCF'
							textColor='black'
					
						/>
					</View>
					<View style={styles.inputGroup}>
						<TextInput
							style={styles.input}
							value={password}
							onChangeText={setPassword}
							label='Phone*'
							underlineColor='#B9BDCF'
							activeUnderlineColor='#B9BDCF'
							textColor='black'
							

						/>
					</View>
					<View style={styles.inputGroup}>
						<TextInput
							style={styles.input}
							value={issueType}
							onChangeText={setIssueType}
							label='Issue Statement*'
							underlineColor='#B9BDCF'
							activeUnderlineColor='#B9BDCF'
							textColor='black'
							
						/>
					</View>
					<View style={styles.uploadProblemContainer}>
						<TouchableOpacity onPress={openGallery} style={styles.uploadButton}>
							<View>
								{imageUri ? (
									<Text style={styles.uploadProblemContainerText2} numberOfLines={1}>
										{imageUri}
									</Text>
								) : (
									<Text style={styles.uploadProblemContainerText}>
										Upload Problem Screenshot
									</Text>
								)}
							</View>
							<View>
								<Feather name={'upload'} size={23} color={'#578356'} />
							</View>
						</TouchableOpacity>

					</View>
					{/* Preview Image */}

					<View style={styles.accordionContainer}>
						<TouchableOpacity onPress={toggleAccordion}>
							<View style={styles.accordionHeader}>
								<Text style={styles.accordionHeaderText}>
									{priority ? `${priority}` : 'Priority Level*'}
								</Text>
								<Feather
									name={isAccordionOpen ? 'chevron-up' : 'chevron-down'}
									size={23}
									color="gray"
								/>
							</View>
						</TouchableOpacity>
						{isAccordionOpen && (
							<View style={styles.accordionContent}>
								{['Low', 'Medium', 'High'].map((level) => (
									<TouchableOpacity
										key={level}
										onPress={() => selectPriority(level)}
									>
										<View style={styles.accordionItem}>
											<Text style={styles.accordionItemText}>{level}</Text>
										</View>
									</TouchableOpacity>
								))}
							</View>
						)}
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<TouchableOpacity
						onPress={isFormValid ? handleSave : null}
						disabled={!isFormValid}
						style={[
							styles.saveBtn,
							{ opacity: isFormValid ? 1 : 0.5 },
						]}
					>
						<Text style={styles.saveBtnText}>
							{loader ? <ActivityIndicator size={20} color="white" /> : 'Submit'}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
};

export default UserRaiseTicket;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
	},
	header: {
		marginTop: 20,
		marginBottom: 10,
		marginHorizontal: 10,
	},
	headerTitle: {
		color: '#222327',
		fontSize: responsiveFontSize(2),
		fontFamily:'Poppins-Medium',
		marginLeft: 5,
	},
	form: {
		paddingHorizontal: 20,
		backgroundColor: '#FFF',
		borderRadius: 15,
		padding: 15,
		marginHorizontal: 20,
		marginVertical: 10,
	},
	inputGroup: {
		marginBottom: 15,
	},
	input: {
		height: responsiveHeight(5),
		borderColor: '#B9BDCF',
		borderBottomWidth: 1,
		paddingLeft: 10,
		color: 'gray',
		fontSize: responsiveFontSize(1.8),
		backgroundColor:'#FFF',
		fontFamily: 'Poppins-Regular',
	},
	uploadProblemContainer: {
		paddingHorizontal: 35,
		paddingVertical: 15,
		borderWidth: 1,
		borderColor: '#767A8D',
		borderRadius: 10,
		marginTop: 10,
	},
	uploadButton: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 10
	},
	imagePreview: {
		marginTop: 15,
		alignItems: 'center',
	},
	previewImage: {
		width: 60,
		height: 40,
		borderRadius: 5,
		marginTop: 10,
	},
	uploadProblemContainerText: {
		color: '#767A8D',
		fontSize: responsiveFontSize(2),
		fontWeight: '400',
		fontFamily: 'Poppins',
	},
	uploadProblemContainerText2: {
		color: '#767A8D',
		fontSize: responsiveFontSize(2),
		fontWeight: '400',
		fontFamily: 'Poppins',
		maxWidth: '90%', // Ensure the text doesn't take up more than this width
		overflow: 'hidden', // Hide overflowing text
		textOverflow: 'ellipsis', // Add ellipsis for overflowing text
		whiteSpace: 'nowrap', // Prevent wrapping to a new line
	},

	accordionContainer: {
		marginBottom: 15,
	},
	accordionHeader: {
		paddingHorizontal: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 25,
		borderColor: '#B9BDCF',
		borderBottomWidth: 1,
		paddingBottom: 20,
	},
	accordionHeaderText: {
		fontSize: responsiveFontSize(2),
		fontWeight: '500',
		color: 'gray',
	},
	accordionContent: {
		paddingTop: 10,
		borderWidth: 0.5,
		borderColor: '#DEE0EA',
		marginTop: 10,
		borderRadius: 5,
		paddingHorizontal: 10,
	},
	accordionItem: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderColor: '#EEEFF6',
	},
	accordionItemText: {
		fontSize: 17,
	},
	noBorder: {
		borderWidth: 0,
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 20,
		backgroundColor: '#F4FAF4',
	},
	saveBtn: {
		backgroundColor: '#4D8733',
		paddingVertical: 15,
		width: '40%',
		alignSelf: 'center',
		borderRadius: 10,
		alignItems: 'center',
	},
	saveBtnText: {
		color: '#FCFDFF',
		fontSize: responsiveFontSize(2.4),
		fontWeight: '600',
		letterSpacing: 0.5,
	},
});
