import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Dimensions,
	StatusBar,
	Animated,
	Keyboard,
} from 'react-native';
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { useGlobalContext } from '../../Context/GlobalContext';
import { ActivityIndicator } from 'react-native-paper';
import { TextInput } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import getToken from '../getToken';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scaleFactor = SCREEN_WIDTH / 375;

const rs = (size) => size * scaleFactor; // Responsive size
const rf = (size) => Math.round(size * scaleFactor); 

const FloatingAccordion = ({ field, dropdownItems, formData, handleInputChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const animatedHeight = useRef(new Animated.Value(0)).current;
	const [selectedItem, setSelectedItem] = useState(formData[field] || 'Select');

	const toggleAccordion = () => {
		setIsOpen(!isOpen);
		Animated.timing(animatedHeight, {
			toValue: isOpen ? 0 : rs(150), // Adjust height based on content
			duration: 300,
			useNativeDriver: false,
		}).start();
	};

	const selectItem = (item) => {
		setSelectedItem(item);
		handleInputChange(field, item);
		toggleAccordion();
	};

	return (
		<View style={styles.accordionContainer}>
			<TouchableOpacity
				style={styles.accordionHeader}
				onPress={toggleAccordion}
				activeOpacity={0.7}
			>
				<View style={styles.accordionTitleContainer}>
					<Text style={[styles.accordionLabel, selectedItem ? styles.accordionLabelSelected : null]}>
						{field}
					</Text>
					<Text style={styles.accordionSelectedValue} numberOfLines={1}>
						{selectedItem}
					</Text>
				</View>
				<Feather
					name={isOpen ? "chevron-up" : "chevron-down"}
					size={rs(20)}
					color="#4D8733"
				/>
			</TouchableOpacity>
			<Animated.View style={[styles.accordionBody, { height: animatedHeight }]}>
				<ScrollView
					nestedScrollEnabled={true}
					showsVerticalScrollIndicator={true}
					contentContainerStyle={styles.accordionScrollContent}
				>
					{dropdownItems.map((item, index) => (
						<TouchableOpacity
							key={`dropdown-${field}-${index}`}
							style={[
								styles.accordionItem,
								selectedItem === item && styles.accordionItemSelected
							]}
							onPress={() => selectItem(item)}
						>
							<Text style={[
								styles.accordionItemText,
								selectedItem === item && styles.accordionItemTextSelected
							]}>
								{item}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</Animated.View>
		</View>
	);
};

const UserEditData = ({ route }) => {
	const { showToast, getAllTableData } = useGlobalContext();
	const [initialData, setInitialData] = useState({});
	const [formData, setFormData] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageUris, setImageUris] = useState({}); // Track image URIs for each field
	const navigation = useNavigation();
	const { fieldData, id, typeInfo, __ID, userItem } = route.params;
	const [datePickerField, setDatePickerField] = useState(null);
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
	const [keyboardVisible, setKeyboardVisible] = useState(false);

	const inputRefs = useRef({});
	const scrollViewRef = useRef();

	// Initialize form data from userItem
	useEffect(() => {
		const initialValues = fieldData.reduce((acc, field) => {
			acc[field] = userItem?.[field] || '';
			return acc;
		}, {});
		setInitialData(initialValues);
		setFormData(initialValues);

		// Set image URIs if there are files in the user data
		const imageURIs = {};
		for (const field in initialValues) {
			const dataType = typeInfo?.[field]?.dataType;
			if (dataType === 'File' && initialValues[field]) {
				imageURIs[field] = initialValues[field];
			}
		}
		setImageUris(imageURIs);
	}, [fieldData, userItem, typeInfo]);

	// Track keyboard visibility
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			() => setKeyboardVisible(true)
		);
		const keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			() => setKeyboardVisible(false)
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	// Memoize form modification check to prevent unnecessary re-renders
	const isFormModified = useMemo(() => {
		return JSON.stringify(initialData) !== JSON.stringify(formData);
	}, [initialData, formData]);

	const handleSave = useCallback(async () => {
		if (isSubmitting || !isFormModified) return;

		setIsSubmitting(true);

		// Generate changes object by comparing initialData and formData
		const changes = Object.keys(initialData).reduce((acc, key) => {
			if (initialData[key] !== formData[key]) {
				acc[key] = true;
			}
			return acc;
		}, {});

		try {
			const token = await getToken();

			console.log('formData',formData)

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

			console.log('response',response.data)

			
			
			if (response.data) {
				// Fetch updated data
				await getAllTableData(id);
				navigation.goBack();
				setFormData({});
				showToast({
					type: 'SUCCESS',
					message: 'Data Updated Successfully',
				});
				return;
			}
			if (response?.data?.error){
				showToast({
					type: 'ERROR',
					message: response?.data?.error,
				});
				return;
			}
		} catch (error) {
			console.error('Error saving data:', error.response?.data || error.message);

			showToast({
				type: 'ERROR',
				message: error.response?.data?.message || 'Failed to update data',
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, initialData, isFormModified, isSubmitting, id, __ID, getAllTableData, showToast]);

	// Optimize input change handler with useCallback
	const handleInputChange = useCallback((field, value) => {
		setFormData(prevData => ({
			...prevData,
			[field]: value,
		}));
	}, []);

	// Optimize date picker handlers
	const showDatePicker = useCallback((field) => {
		setDatePickerField(field);
		setDatePickerVisibility(true);
	}, []);

	const hideDatePicker = useCallback(() => {
		setDatePickerVisibility(false);
	}, []);

	const handleDateConfirm = useCallback((date) => {
		if (!datePickerField) return;

		const formattedDate = new Date(date)
			.toLocaleDateString("en-GB")
			.split("/")
			.join("-");

		handleInputChange(datePickerField, formattedDate);
		hideDatePicker();
	}, [datePickerField, handleInputChange, hideDatePicker]);

	// Image selection optimized with useCallback
	const selectImageFromGallery = useCallback(async (field) => {
		try {
			const response = await launchImageLibrary({
				mediaType: 'mixed',
				quality: 0.5,
			});

			if (response.didCancel || response.errorCode) return;

			// Process only when we have valid response data
			if (response.assets?.[0]?.uri) {
				const sourceUri = response.assets[0].uri;

				// Update only the specific field's image URI
				setImageUris(prev => ({
					...prev,
					[field]: sourceUri
				}));

				handleInputChange(field, sourceUri);
			}
		} catch (error) {
			console.error('Error selecting image:', error);
			showToast({
				type: 'ERROR',
				message: 'Failed to select image',
			});
		}
	}, [handleInputChange, showToast]);

	// Memoize input field renderer for better performance
	const renderInputField = useCallback((field, fieldName) => {
		const dataType = typeInfo?.[fieldName]?.dataType;
		const dropdownItems = typeInfo?.[fieldName]?.dropdownItems;
		if (fieldName === '__ID') return null;

		const commonInputStyles = {
			fontSize: rf(15),
			height: rs(50),
			paddingHorizontal: rs(5),
			backgroundColor: 'white',
		};

		switch (dataType) {
			case 'Text':
				return (
					<TextInput
						ref={(ref) => (inputRefs.current[field] = ref)}
						label={fieldName}
						value={formData[field] || ''}
						onChangeText={(text) => handleInputChange(field, text)}
						underlineColor='#B9BDCF'
						activeUnderlineColor='#4D8733'
						textColor='black'
						style={commonInputStyles}
					/>
				);

			case 'Number':
				return (
					<TextInput
						ref={(ref) => (inputRefs.current[field] = ref)}
						label={fieldName}
						value={formData[field] || ''}
						onChangeText={(text) => handleInputChange(field, text)}
						underlineColor='#B9BDCF'
						activeUnderlineColor='#4D8733'
						keyboardType='numeric'
						textColor='black'
						style={commonInputStyles}
					/>
				);

			case 'Date':
				return (
					<View style={styles.dateInputContainer}>
						<TextInput
							ref={(ref) => (inputRefs.current[field] = ref)}
							value={formData[field] || "dd-mm-yy"}
							editable={false}
							label={fieldName}
							underlineColor='#B9BDCF'
							activeUnderlineColor='#4D8733'
							textColor="black"
							style={[commonInputStyles, { flex: 1 }]}
						/>
						<TouchableOpacity
							onPress={() => showDatePicker(field)}
							style={styles.calendarButton}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Feather name="calendar" size={rs(20)} color="#4D8733" />
						</TouchableOpacity>
					</View>
				);

			case 'Dropdown Range':
				if (dropdownItems?.length > 0) {
					return (
						<FloatingAccordion
							field={fieldName}
							dropdownItems={dropdownItems}
							formData={formData}
							handleInputChange={handleInputChange}
						/>
					);
				}
				return null;

			case 'File':
				return (
					<View style={styles.fileContainer}>
						<View style={styles.fileContainer}>
							<View style={{ position: 'relative' }}>
								<TouchableOpacity
									onPress={() => selectImageFromGallery(field)}
									style={styles.fileInputButton}
								>
									<Text style={styles.fileButtonText}>Choose File</Text>
								</TouchableOpacity>
							</View>

							<View style={styles.fileNameContainer}>
								<Text style={{ color: '#4D8733', fontFamily: 'Poppins-Regular', fontSize: rs(10.5) }}>{fieldName}</Text>
								<Text
									style={styles.fileName}
									numberOfLines={1}
									ellipsizeMode="middle"
								>
									{imageUris[field] ? imageUris[field].split('/').pop() : 'No file chosen'}
								</Text>
							</View>
						</View>
					</View>
				);

			default:
				return null;
		}
	}, [formData, typeInfo, handleInputChange, showDatePicker, selectImageFromGallery, imageUris]);

	// Create a memoized list of form fields
	const formFields = useMemo(() => {
		return fieldData.map((fieldName, index) => (
			<View key={`field-${index}`} style={styles.inputGroup}>
				{renderInputField(fieldName, fieldName)}
			</View>
		));
	}, [fieldData, renderInputField]);

	return (
		<KeyboardAvoidingView
			style={styles.mainContainer}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? rs(20) : 0}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#F4FAF4" />

			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.usersText}>Tables</Text>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Feather name="chevron-left" size={rs(22)} color="black" />
						<Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
							{__ID}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Form */}
				<ScrollView
					ref={scrollViewRef}
					contentContainerStyle={styles.formContainer}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.form}>
						{formFields}
					</View>
				</ScrollView>

				{/* Footer */}
				<View style={styles.footer}>
					<TouchableOpacity
						onPress={handleSave}
						disabled={!isFormModified || isSubmitting}
						style={[
							styles.saveBtn,
							(!isFormModified || isSubmitting) && styles.disabledButton
						]}
						activeOpacity={0.7}
					>
						{isSubmitting ? (
							<ActivityIndicator size={rs(20)} color="white" />
						) : (
							<Text style={styles.saveBtnText}>Save</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>

			{/* Date Picker Modal */}
			<DateTimePickerModal
				isVisible={isDatePickerVisible}
				mode="date"
				onConfirm={handleDateConfirm}
				onCancel={hideDatePicker}
			/>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
	},
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: Platform.OS === 'ios' ? rs(40) : rs(20),
		marginBottom: rs(10),
		paddingHorizontal: rs(15),
	},
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	usersText: {
		color: '#848486',
		fontSize: rf(16),
		fontFamily: 'Poppins-Regular',
		marginRight: rs(5),
	},
	headerTitle: {
		color: '#222327',
		fontSize: rf(18),
		fontFamily: 'Poppins-Medium',
		marginLeft: rs(5),
		width: '70%',
	},
	formContainer: {
		flexGrow: 1,
	},
	form: {
		backgroundColor: '#FFF',
		borderRadius: rs(15),
		padding: rs(15),
		marginHorizontal: rs(15),
		marginVertical: rs(5),
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 2,
	},
	inputGroup: {
		marginBottom: rs(5),
	},
	dateInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	calendarButton: {
		marginLeft: rs(10),
		height: rs(40),
		width: rs(40),
		borderRadius: rs(20),
		backgroundColor: '#F4FAF4',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fileContainer: {
		flexDirection: 'row',
		borderColor: '#B9BDCF',
		borderBottomWidth: 0.6,
		alignItems: 'center',
		paddingBottom: rs(10),
		gap: rs(10),
	},
	fileInputButton: {
		borderColor: '#B9BDCF',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: rs(12),
		paddingVertical: rs(8),
		borderRadius: rs(5),
		backgroundColor: '#F7F7F7',
	},
	fileButtonText: {
		color: '#222327',
		fontSize: rf(14),
		fontFamily: 'Poppins-Medium',
	},
	fileNameContainer: {
		flex: 1,
	},
	fileName: {
		color: '#333333',
		fontSize: rf(12),
		fontFamily: 'Poppins-Regular',
	},
	footer: {
		paddingVertical: rs(10),
		backgroundColor: '#F4FAF4',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: '#EBE7F3',
	},
	saveBtn: {
		backgroundColor: '#4D8733',
		paddingVertical: rs(10),
		width: '40%',
		alignSelf: 'center',
		borderRadius: rs(10),
		alignItems: 'center',
		justifyContent: 'center',
	},
	disabledButton: {
		opacity: 0.5,
	},
	saveBtnText: {
		color: '#FCFDFF',
		fontSize: rf(16),
		fontFamily: 'Poppins-SemiBold',
		letterSpacing: 0.5,
	},
	// Accordion styles
	accordionContainer: {
		borderBottomWidth: 0.6,
		borderBottomColor: '#B9BDCF',
		overflow: 'hidden',
	},
	accordionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	accordionTitleContainer: {
		flex: 1,
	},
	accordionLabel: {
		color: '#848486',
		fontSize: rf(10.5),
		fontFamily: 'Poppins-Regular',
	},
	accordionLabelSelected: {
		color: '#4D8733',
	},
	accordionSelectedValue: {
		color: '#222327',
		fontSize: rf(15),
		fontFamily: 'Poppins-Regular',
		marginTop: rs(2),
	},
	accordionBody: {
		overflow: 'hidden',
	},
	accordionScrollContent: {
		// paddingBottom: rs(10),
	},
	accordionItem: {
		paddingVertical: rs(10),
		paddingHorizontal: rs(5),
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#E5E5E5',
	},
	accordionItemSelected: {
		backgroundColor: '#F4FAF4',
	},
	accordionItemText: {
		color: '#222327',
		fontSize: rf(14),
		fontFamily: 'Poppins-Regular',
	},
	accordionItemTextSelected: {
		color: '#4D8733',
		fontFamily: 'Poppins-Medium',
	},
});

export default UserEditData;