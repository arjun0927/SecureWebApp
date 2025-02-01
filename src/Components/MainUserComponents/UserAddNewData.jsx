import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../Context/GlobalContext';
import { ActivityIndicator, Button } from 'react-native-paper';
import { TextInput } from 'react-native-paper';
import DropdownAccordion from './DropdownAccordion';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const UserAddNewData = ({ route }) => {
	const { showToast, getAllTableData } = useGlobalContext();
	const [formData, setFormData] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageUri, setImageUri] = useState('');
	const navigation = useNavigation();
	const { fieldData, id, typeInfo } = route.params;
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);


	const inputRefs = useRef({});

	const handleSave = async () => {
		setIsSubmitting(true);
		const token = await AsyncStorage.getItem('token');
		console.log('formData', formData);

		try {
			const response = await axios.post(
				`https://secure.ceoitbox.com/api/create/TableData/${id}`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			// console.log('Response:', response);
			if (response) {
				await getAllTableData(id);
			}
			// Clear formData and reset input values via refs
			setFormData({});
			Object.keys(inputRefs.current).forEach((key) => {
				if (inputRefs.current[key]) {
					inputRefs.current[key].clear();
				}
			});

			showToast({
				type: 'SUCCESS',
				message: 'Data Created Successfully',
			});
		} catch (error) {
			console.error('Error saving data:', error.response || error.message);

			showToast({
				type: 'ERROR',
				message: 'Failed to save data',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData((prevData) => ({
			...prevData,
			[field]: value,
		}));
	};

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
							editable={false}
							label={fieldName}
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
							<Feather name="calendar" size={20} color="black" />
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
								textOverflow: 'ellipsis', // Add ellipsis if text overflows
								whiteSpace: 'nowrap', // Prevent wrapping
							}}
							numberOfLines={1} // Limit displayed lines to 1
						>
							{imageUri !== ''
								? imageUri.split('/').pop() // Extract the file name from the URI
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
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.usersText}>Tables</Text>
					<TouchableOpacity
						style={{ flexDirection: 'row' }}
						onPress={() => navigation.goBack()}
					>
						<Feather name="chevron-left" size={24} color="black" />
						<Text style={styles.headerTitle}>Add New Data</Text>
					</TouchableOpacity>
				</View>

				<ScrollView contentContainerStyle={styles.form}>
					<FlatList
						data={fieldData}
						keyExtractor={(item, index) => index.toString()} // Unique key based on index
						renderItem={({ item }) => {
							const fieldName = item;
							const dataType = typeInfo?.[fieldName]?.dataType;

							return (
								<View style={styles.inputGroup}>
									{renderInputField(fieldName, fieldName)}
								</View>
							);
						}}
					/>
					{/* <View>
						<Button title="Show Date Picker" onPress={showDatePicker} />
						<DateTimePickerModal
							isVisible={isDatePickerVisible}
							mode="date"
							onConfirm={handleConfirm}
							onCancel={hideDatePicker}
						/>
					</View> */}
				</ScrollView>


				<View style={styles.footer}>
					<TouchableOpacity
						onPress={!isSubmitting ? handleSave : null} // Always enabled (no validation)
						disabled={isSubmitting} // Disable only when submitting
						style={[styles.saveBtn, { opacity: isSubmitting ? 0.5 : 1 }]}
					>
						<Text style={styles.saveBtnText}>
							{isSubmitting ? <ActivityIndicator size={20} color="white" /> : 'Add Data'}
						</Text>
					</TouchableOpacity>
				</View>

			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 20,
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
	label: {
		color: '#222327',
		fontSize: responsiveFontSize(2),
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

export default UserAddNewData;
