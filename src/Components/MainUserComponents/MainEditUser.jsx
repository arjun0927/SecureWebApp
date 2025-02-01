import React, { useState, useEffect, useRef } from 'react';
import {
	StyleSheet,
	Text,
	// TextInput,
	View,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	FlatList,
	ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import FrameSvg from '../../assets/Svgs/FrameSvg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useGlobalContext } from '../../Context/GlobalContext';
import { TextInput } from 'react-native-paper';
import DropdownAccordion from './DropdownAccordion';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const MainEditUser = ({ route }) => {
	const { id, fieldData, __ID, userItem, typeInfo } = route.params;
	const navigation = useNavigation();
	const [initialData, setInitialData] = useState({});
	const [formData, setFormData] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
	const [imageUri, setImageUri] = useState('');
	
	const { showToast,getAllTableData } = useGlobalContext()

	const inputRefs = useRef({});

	useEffect(() => {
		const initialValues = fieldData.reduce((acc, field) => {
			acc[field] = userItem?.[field] || '';
			return acc;
		}, {});
		setInitialData(initialValues);
		setFormData(initialValues);
	}, [fieldData, userItem]);

	const handleInputChange = (field, value) => {
		setFormData((prevData) => ({
			...prevData,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		setIsSubmitting(true);

		// Generate changes object by comparing initialData and formData
		const changes = Object.keys(initialData).reduce((acc, key) => {
			if (initialData[key] !== formData[key]) {
				acc[key] = true; // Mark the field as modified
			}
			return acc;
		}, {});

		const token = await AsyncStorage.getItem('token');
		// console.log('formData:', formData);
		// console.log('changes:', changes);
		// console.log('id:', id);

		try {
			const response = await axios.post(
				`https://secure.ceoitbox.com/api/updateTableData/${id}`,
				{
					changes: changes,
					newValue: formData,
					__ID: __ID
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (response) {
				await getAllTableData(id);
			}

			console.log('Response.data:', response.data);
			// alert('Data saved successfully!');
			showToast({
				type: 'SUCCESS',
				message: 'Data saved successfully'
			})
		} catch (error) {
			console.error('Error saving data:', error.response || error.message);
			showToast({
				type: 'ERROR',
				message: 'Failed to save data'
			})
			// alert('Failed to save data.');
		} finally {
			setIsSubmitting(false);
		}
	};


	// Check if any field has been modified
	const isFormModified = JSON.stringify(initialData) !== JSON.stringify(formData);

	const renderInputField = (field, fieldName) => {
		const dataType = typeInfo?.[fieldName]?.dataType;
		const dropdownItems = typeInfo?.[fieldName]?.dropdownItems;

		if (dataType === 'Text') {
			return (
				<TextInput
					ref={(ref) => (inputRefs.current[field] = ref)}
					label={fieldName}
					style={styles.input}
					value={formData[field] || ''}
					onChangeText={(text) => handleInputChange(field, text)}
					underlineColor='#B9BDCF'
					activeUnderlineColor='#B9BDCF'
					textColor='black'
					style={[
						{
							fontSize: 18,
							height: 50,
							paddingHorizontal: 5,
							backgroundColor: 'white',
						},
					]}
				/>
			);
		}
		if (dataType === 'Date') {
			const showDatePicker = (field) => {
				setDatePickerVisibility((prev) => ({ ...prev, [field]: true }));
			};
			const hideDatePicker = (field) => {
				setDatePickerVisibility((prev) => ({ ...prev, [field]: false }));
			};
			const handleConfirm = (field, date) => {
				const formattedDate = new Date(date)
					.toLocaleDateString("en-GB")
					.split("/")
					.join("-");
				handleInputChange(field, formattedDate);
				hideDatePicker(field);
			};
			

			return (
				<View key={field} style={{ marginBottom: 15 }}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<TextInput
							ref={(ref) => (inputRefs.current[field] = ref)}
							value={formData[field] || "dd-mm-yy"}
							label={fieldName}
							editable={false}
							style={{
								flex: 1,
								fontSize: 18,
								height: 50,
								paddingHorizontal: 5,
								backgroundColor: "white",
								borderRadius: 5,
							}}
							underlineColor="#B9BDCF"
							activeUnderlineColor="#B9BDCF"
							textColor="black"
						/>
						<TouchableOpacity
							onPress={() => showDatePicker(field)}
							style={{ marginLeft: 10 }}
						>
							<Feather name="calendar" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<DateTimePickerModal
						isVisible={!!isDatePickerVisible[field]}
						mode="date"
						onConfirm={(date) => handleConfirm(field, date)}
						onCancel={() => hideDatePicker(field)}
					/>
				</View>
			);
		}
		const selectImageFromGallery = async (field) => {
			try {
				const response = await launchImageLibrary({
					mediaType: 'photo',
					quality: 0.5,
				});

				console.log('Image Picker Response:', response); // Log the entire response to inspect its structure

				if (response.didCancel) {
					console.log('User cancelled image picker');
				} else if (response.errorCode) {
					console.log('ImagePicker Error: ', response.errorCode);
				} else {
					// Ensure we access the URI from response.assets array
					if (response.assets && response.assets[0] && response.assets[0].uri) {
						const sourceUri = response.assets[0].uri;
						console.log('Selected Image URI:', sourceUri);
						setImageUri(sourceUri);
						const field = 'userID';
						handleInputChange(field, sourceUri);
					} else {
						console.log('No valid URI found in response');
					}
				}
			} catch (error) {
				console.error('Error selecting image: ', error);
			}
		};


		if (dataType === 'Number') {
			return (
				<TextInput
					ref={(ref) => (inputRefs.current[field] = ref)}
					label={fieldName}
					style={styles.input}
					value={formData[field] || ''}
					onChangeText={(text) => handleInputChange(field, text)}
					underlineColor='#B9BDCF'
					keyboardType='numeric'
					activeUnderlineColor='#B9BDCF'
					textColor='black'
					style={[
						{
							fontSize: 18,
							height: 50,
							paddingHorizontal: 5,
							backgroundColor: 'white',
						},
					]}
				/>
			);
		}

		if (dataType === 'Dropdown Range' && dropdownItems?.length > 0) {
			return (
				<DropdownAccordion
					field={fieldName}
					dropdownItems={dropdownItems}
					formData={formData}
					handleInputChange={(field, value) => {
						setFormData((prevData) => ({ ...prevData, [field]: value }));
					}}
				/>
			);
		}
		if (dataType === 'File') {
			return (
				<View
					style={{
						flexDirection: 'row',
						borderColor: '#B9BDCF',
						borderBottomWidth: 0.6,
						alignItems: 'center',
						paddingBottom: 10,
						gap: 10,
						flexWrap: 'nowrap',
					}}
				>
					<TouchableOpacity
						onPress={() => selectImageFromGallery(field)}
						style={styles.fileInputContainer}
					>
						<View
							style={{
								borderColor: 'gray',
								borderWidth: 1,
								justifyContent: 'center',
								alignItems: 'center',
								paddingHorizontal: 12,
								paddingVertical: 7,
								borderRadius: 5,
								backgroundColor: '#F7F7F7',
								flex: 1,
							}}
						>
							<Text style={{ color: 'black', fontSize: 16, fontWeight: '500' }}>
								Choose File
							</Text>
						</View>
					</TouchableOpacity>
					<View style={{ flex: 1 }}>
						<Text
							style={{
								color: '#333333',
								fontSize: 17,
								overflow: 'hidden', // Ensure text doesn't overflow its container
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
							numberOfLines={1}
						>
							{imageUri !== ''
								? imageUri.split('/').pop()
								: 'No file chosen'}
						</Text>
					</View>
				</View>
			);
		}



		return null;
	};
	const selectImageFromGallery = async (field) => {
		try {
			const response = await launchImageLibrary({
				mediaType: 'photo',
				quality: 0.5,
			});

			console.log('Image Picker Response:', response);

			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.errorCode) {
				console.log('ImagePicker Error: ', response.errorCode);
			} else {
				// Ensure we access the URI from response.assets array
				if (response.assets && response.assets[0] && response.assets[0].uri) {
					const sourceUri = response.assets[0].uri;
					console.log('Selected Image URI:', sourceUri);
					setImageUri(sourceUri);
					const field = 'userID';
					handleInputChange(field, sourceUri);
				} else {
					console.log('No valid URI found in response');
				}
			}
		} catch (error) {
			console.error('Error selecting image: ', error);
		}
	};


	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			// keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 30} // Adjust based on your app's layout
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<View style={{ flexDirection: 'row' }}>
						<Text style={styles.usersText}>Tables</Text>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => navigation.goBack()}
						>
							<Feather name="chevron-left" size={24} color="black" />
							<Text style={styles.headerTitle}>{__ID}</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.iconWrapper}>
						<FrameSvg />
					</View>
				</View>

				<View style={{marginBottom:200}}>
				<FlatList
					data={fieldData}
					keyExtractor={(item, index) => index.toString()} // Ensure a unique key
					renderItem={({ item }) => {
						const fieldName = item;
						const dataType = typeInfo?.[fieldName]?.dataType;

						return (
							<View style={styles.inputGroup}>
								{renderInputField(fieldName, fieldName)}
							</View>
						);
					}}
					contentContainerStyle={styles.form}
					keyboardShouldPersistTaps="handled"
				/>
				</View>

				<View style={styles.footer}>
					<TouchableOpacity
						onPress={isFormModified ? handleSave : null}
						disabled={!isFormModified}
						style={[
							styles.saveBtn,
							{ opacity: isFormModified ? 1 : 0.5 },
						]}
					>
						{isSubmitting ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.saveBtnText}>Save</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>

	);
};

export default MainEditUser;

const styles = StyleSheet.create({
	// Styles remain the same
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 20,
		justifyContent: 'space-between',
		marginBottom: 10,
		marginHorizontal: 10,
	},
	usersText: {
		color: '#848486',
		fontSize: responsiveFontSize(2),
		fontWeight: '400',
	},
	headerTitle: {
		color: '#222327',
		fontSize: responsiveFontSize(2.3),
		fontWeight: '400',
		marginLeft: 5,
	},
	iconWrapper: {
		marginRight: 10,
		height: 32,
		width: 32,
		backgroundColor: '#C6FF96',
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
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
	label1: {
		color: '#767A8D',
		fontSize: responsiveFontSize(1.6),
		fontWeight: '400',
	},
	input: {
		height: 40,
		borderColor: '#B9BDCF',
		borderBottomWidth: 1,
		paddingLeft: 10,
		color: 'black',
		fontSize: responsiveFontSize(2.1),
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
		// paddingVertical: 15,
		height:50,
		justifyContent:'center',
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
