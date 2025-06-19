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
	SafeAreaView,
	Alert,
} from 'react-native';
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { useGlobalContext } from '../../Context/GlobalContext';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import getToken from '../getToken';
import { Switch } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scaleFactor = SCREEN_WIDTH / 375;

const rs = (size) => size * scaleFactor; // Responsive size
const rf = (size) => Math.round(size * scaleFactor); // Responsive font size

const MainEditUser = ({ route }) => {
	const [allInputData, setAllInputData] = useState([]);
	const [formData, setFormData] = useState({});
	const [imageUris, setImageUris] = useState({});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [accordionStates, setAccordionStates] = useState({});
	const [dateRangePickerVisible, setDateRangePickerVisibility] = useState(false);
	const [dateRangeField, setDateRangeField] = useState(null);
	const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);
	const [datePickerOpen, setDatePickerOpen] = useState(false);
	const [timePickerOpen, setTimePickerOpen] = useState(false);
	const [currentField, setCurrentField] = useState(null);
	const [datePickerMode, setDatePickerMode] = useState('date');
	const [tempDate, setTempDate] = useState(new Date());

	const inputRefs = useRef({});
	const accordionHeights = useRef({});

	const { tableAccess, id, __ID, userItem, } = route.params;
	const { globalFieldSettings, getAllTableData, showToast, setUserData } = useGlobalContext();

	const tableInfo = globalFieldSettings.filter((item) => item._id === id);
	const globalPermission = tableInfo[0]?.userFieldSettings || {};

	const navigation = useNavigation();

	// console.log('userItem : ', userItem)

	// Initialize form data with existing userItem data
	useEffect(() => {
		if (userItem && Object.keys(userItem).length > 0) {
			// Create initial form data from userItem
			const initialFormData = { ...userItem };

			const initialImageUris = {};
			Object.entries(tableAccess).forEach(([key, value]) => {
				if (value?.dataType === 'File' && userItem[key]) {
					initialImageUris[key] = userItem[key];
				}
			});

			setFormData(initialFormData);
			setImageUris(initialImageUris);
		}
	}, [userItem, tableAccess]);

	useEffect(() => {
		const resultArray = Object.entries(tableAccess).map(([key, value]) => ({
			key,
			value
		}));
		setAllInputData(resultArray);

		// Initialize accordion animated values
		const initialAccordionStates = {};
		resultArray.forEach(item => {
			if (item.value?.dataType === 'Dropdown Range') {
				const key = item.key;
				initialAccordionStates[key] = {
					isOpen: false,
					height: new Animated.Value(0)
				};
				accordionHeights.current[key] = new Animated.Value(0);
			}
		});
		setAccordionStates(initialAccordionStates);
	}, [tableAccess]);

	

	// Validate form before submission
	const validateForm = useCallback(() => {
		const newErrors = {};
		let isFormValid = true;

		allInputData.forEach((item) => {
			const key = item.key;
			const fieldRequired = item.value?.required;
			const newKey = String(key);
			const matchCondition = globalPermission[newKey];

			// Skip validation for hidden fields or fields with no edit access
			if (item.value.hidden || !matchCondition?.editAccess) {
				return;
			}

			// Validate required fields
			if (fieldRequired && (!formData[key] || formData[key].toString().trim() === '')) {
				newErrors[key] = `${key} is required`;
				isFormValid = false;
			}
		});

		setErrors(newErrors);
		return isFormValid;
	}, [allInputData, formData, globalPermission]);

	const showPicker = useCallback((field, mode) => {
		setCurrentField(field);
		setDatePickerMode(mode);

		if (mode === 'date') {
			setDatePickerOpen(true);
		} else if (mode === 'time') {
			setTimePickerOpen(true);
		} else if (mode === 'date-time') {
			setDatePickerMode('date');
			setDatePickerOpen(true);
		}
	}, []);

	const handlePickerConfirm = useCallback((selectedDate) => {
		if (!currentField) return;

		if (datePickerMode === 'date') {
			if (currentField.toLowerCase().includes('datetime') ||
				(tableAccess[currentField]?.dataType === 'Date & Time')) {
				// Store the selected date and switch to time picker
				setTempDate(selectedDate);
				setDatePickerOpen(false);

				setTimeout(() => {
					setDatePickerMode('time');
					setTimePickerOpen(true);
				}, 300);
			} else {
				// Date-only field
				const formattedDate = selectedDate.toLocaleDateString("en-GB").split("/").join("-");
				handleInputChange(currentField, formattedDate);
				setDatePickerOpen(false);
				setCurrentField(null);
				setDatePickerMode('date'); // Reset mode
			}
		} else if (datePickerMode === 'time') {
			const formattedTime = selectedDate.toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			});

			if (currentField.toLowerCase().includes('datetime') ||
				(tableAccess[currentField]?.dataType === 'Date & Time')) {
				// Combine date and time for datetime fields
				if (tempDate) {
					const formattedDate = tempDate.toLocaleDateString("en-GB").split("/").join("-");
					const combined = `${formattedDate} ${formattedTime}`;
					handleInputChange(currentField, combined);
				}
			} else {
				// Time-only field
				handleInputChange(currentField, formattedTime);
			}

			// Clean up
			setTimePickerOpen(false);
			setCurrentField(null);
			setDatePickerMode('date'); // Reset mode
			setTempDate(new Date()); // Reset temp date
		}
	}, [currentField, datePickerMode, tempDate, handleInputChange, tableAccess]);

	const showDateRangePicker = useCallback((field, isStart = true) => {
		setDateRangeField(field);
		setIsSelectingStartDate(isStart);
		setDateRangePickerVisibility(true);
	}, []);

	// Add this helper function at the top of your component
	const getChangedFields = (originalData, newData) => {
		const changes = {};
		
		// Compare each field in newData with originalData
		Object.keys(newData).forEach(key => {
			// Skip if the field doesn't exist in original data
			if (!(key in originalData)) {
				changes[key] = newData[key];
				return;
			}

			// Compare values and store only if different
			if (JSON.stringify(originalData[key]) !== JSON.stringify(newData[key])) {
				changes[key] = true;
			}
		});

		return changes;
	};

	const getAllFieldsData = useCallback(() => {
		const fieldsData = {};
		
		allInputData.forEach((item) => {
			const key = item.key;
			const datatype = item.value?.dataType;
			const newKey = String(key);
			const matchCondition = globalPermission[newKey];
			const role = tableInfo[0]?.role;

			// Skip if field should be hidden or user doesn't have create access
			if (item.value.hidden || (role === 'USER' && !matchCondition?.createAccess)) {
				return;
			}

			if(key === '__ID') return ;

			// For file fields, store the URI as the value
			if (datatype === 'File') {
				fieldsData[key] = imageUris[key] || '';
			} else {
				// For all other fields, store the form value directly
				fieldsData[key] = formData[key] || '';
			}
		});

		return fieldsData;
	}, [allInputData, formData, imageUris, globalPermission, tableInfo]);

	const isEmptyForm = useMemo(() => {
		// Get changed fields
		const changedFields = getChangedFields(userItem, formData);
		
		// Return true if form is empty OR there are no changes
		return Object.keys(formData).length === 0 || Object.keys(changedFields).length === 0;
	}, [formData, userItem]);

	// Update the handleSave function
	const handleSave = useCallback(async () => {
		if (isSubmitting) return;

		// Validate form before submission
		if (!validateForm()) {
			showToast({
				type: 'ERROR',
				message: 'Please fill all required fields',
			});
			return;
		}

		// Get only the changed fields
		const changedFields = getChangedFields(userItem, formData);

		console.log('changedFields : ', changedFields)
		console.log('formData : ', formData)

		// If no changes were made, show message and return
		if (Object.keys(changedFields).length === 0) {
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();

			// Use PUT method for updating existing data with only changed fields
			// console.log('changedFields : ', changedFields)
			// console.log('formData : ', formData)
			
			const response = await axios.post(
				`https://secure.ceoitbox.com/api/updateTableData/${id}`,
				{
					changes: changedFields, // Only send changed fields
					newValue: formData,     // Keep the complete form data
					__ID: __ID,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response) {
				// console.log('Data updated successfully:', response.data);
				await getAllTableData(id);
				// setUserData(prev => {
				// 	return prev.map(item => {
				// 		console.log('item : ', item)
				// 		if(item.__ID === __ID){
				// 			return 
				// 			return {
				// 				...item,
				// 				...formData
				// 			}
				// 		}
				// 	})
				// });
				navigation.goBack();

				showToast({
					type: 'SUCCESS',
					message: 'Data Updated Successfully',
				});
			}
		} catch (error) {
			console.error('Error updating data:', error);

			showToast({
				type: 'ERROR',
				message: error.response?.data?.message || 'Failed to update data',
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, isSubmitting, id, getAllTableData, showToast, validateForm, userItem, navigation]);

	// Optimize input change handler with useCallback
	const handleInputChange = useCallback((field, value) => {
		setFormData(prevData => ({
			...prevData,
			[field]: value,
		}));

		// Clear error for this field when user updates it
		if (errors[field]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	}, [errors]);

	// Update the selectImageFromGallery function to handle both camera and gallery
	const selectImageFromGallery = useCallback(async (field) => {
		try {
			// Show action sheet to choose between camera and gallery
			Alert.alert(
				"Select Media",
				"Choose media source",
				[
					{
						text: "Camera",
						onPress: async () => {
							const response = await launchCamera({
								mediaType: 'mixed',
								quality: 0.5,
								includeBase64: false,
								saveToPhotos: true,
							});

							handleMediaResponse(response, field);
						}
					},
					{
						text: "Gallery",
						onPress: async () => {
							const response = await launchImageLibrary({
								mediaType: 'mixed',
								quality: 0.5,
								selectionLimit: 1,
							});

							handleMediaResponse(response, field);
						}
					},
					{
						text: "Cancel",
						style: "cancel"
					}
				]
			);
		} catch (error) {
			console.error('Error selecting media:', error);
			showToast({
				type: 'ERROR',
				message: 'Failed to select media',
			});
		}
	}, [showToast]);

	// Add a helper function to handle media response
	const handleMediaResponse = useCallback((response, field) => {
		if (response.didCancel || response.errorCode) return;

		// Process only when we have valid response data
		if (response.assets?.[0]?.uri) {
			const sourceUri = response.assets[0].uri;
			const mediaType = response.assets[0].type;

			// Update imageUris with the selected media
			setImageUris(prev => ({
				...prev,
				[field]: sourceUri
			}));

			// Update form data with the media URI
			handleInputChange(field, sourceUri);

			// Show success message based on media type
			const mediaTypeText = mediaType?.startsWith('video/') ? 'video' : 'image';
			showToast({
				type: 'SUCCESS',
				message: `${mediaTypeText} selected successfully`,
			});
		}
	}, [handleInputChange, showToast]);

	// Toggle accordion state
	const toggleAccordion = useCallback((key) => {
		setAccordionStates(prev => {
			const newState = {
				...prev,
				[key]: {
					isOpen: !prev[key]?.isOpen
				}
			};

			// Handle animation
			const isOpen = newState[key].isOpen;
			const itemHeight = 40; // Height of each dropdown item
			const maxHeight = Math.min(tableAccess[key]?.dropdownItems?.length * itemHeight, 200); // Max height of 200 or total items height

			if (!accordionHeights.current[key]) {
				accordionHeights.current[key] = new Animated.Value(0);
			}

			Animated.timing(accordionHeights.current[key], {
				toValue: isOpen ? maxHeight : 0,
				duration: 300,
				useNativeDriver: false,
			}).start();

			return newState;
		});
	}, [tableAccess]);

	// Integrated FloatingAccordion component within renderInputFields
	const renderInputFields = useCallback((keys, datatype, fieldRequired, index) => {
		if (keys === '__ID') return null;
		// console.log('datatype : ', datatype)
		if (datatype == 'Formula') {
			return null
		}

		const commonInputStyles = {
			fontSize: rf(15),
			height: rs(50),
			paddingHorizontal: rs(5),
			backgroundColor: 'white',
		};

		const errorMessageStyle = {
			color: 'red',
			fontSize: rf(12),
			fontFamily: 'Poppins-Regular',
			marginTop: rs(2),
		};

		const hasError = errors[keys];

		switch (datatype) {
			case 'Text':
				return (
					<View key={index} style={styles.inputGroup}>
						<TextInput
							ref={(ref) => (inputRefs.current[keys] = ref)}
							label={keys + (fieldRequired ? ' *' : '')}
							value={formData[keys] || ''}
							onChangeText={(text) => handleInputChange(keys, text)}
							underlineColor={hasError ? 'red' : '#B9BDCF'}
							activeUnderlineColor={hasError ? 'red' : '#4D8733'}
							textColor='black'
							style={commonInputStyles}
							error={hasError}
						/>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'Email':
				return (
					<View key={index} style={styles.inputGroup}>
						<TextInput
							ref={(ref) => (inputRefs.current[keys] = ref)}
							label={keys + (fieldRequired ? ' *' : '')}
							value={formData[keys] || ''}
							onChangeText={(text) => handleInputChange(keys, text)}
							underlineColor={hasError ? 'red' : '#B9BDCF'}
							activeUnderlineColor={hasError ? 'red' : '#4D8733'}
							textColor='black'
							keyboardType='email-address'
							style={commonInputStyles}
							error={hasError}
						/>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'Image':
				return (
					<View key={index} style={styles.inputGroup}>
						<TextInput
							ref={(ref) => (inputRefs.current[keys] = ref)}
							label={keys + (fieldRequired ? ' *' : '')}
							value={formData[keys] || ''}
							onChangeText={(text) => handleInputChange(keys, text)}
							underlineColor={hasError ? 'red' : '#B9BDCF'}
							activeUnderlineColor={hasError ? 'red' : '#4D8733'}
							textColor='black'
							style={commonInputStyles}
							error={hasError}
						/>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'Number':
				return (
					<View key={index} style={styles.inputGroup}>
						<TextInput
							ref={(ref) => (inputRefs.current[keys] = ref)}
							label={keys + (fieldRequired ? ' *' : '')}
							value={formData[keys]?.toString() || ''}
							onChangeText={(text) => {
								if (/^\d*\.?\d*$/.test(text) || text === '') {
									handleInputChange(keys, text);
								}
							}}
							underlineColor={hasError ? 'red' : '#B9BDCF'}
							activeUnderlineColor={hasError ? 'red' : '#4D8733'}
							keyboardType='numeric'
							textColor='black'
							style={commonInputStyles}
							error={hasError}
						/>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'URL':
				return (
					<View key={index} style={styles.inputGroup}>
						<TextInput
							ref={(ref) => (inputRefs.current[keys] = ref)}
							label={keys + (fieldRequired ? ' *' : '')}
							value={formData[keys] || ''}
							onChangeText={(text) => handleInputChange(keys, text)}
							underlineColor={hasError ? 'red' : '#B9BDCF'}
							activeUnderlineColor={hasError ? 'red' : '#4D8733'}
							textColor='black'
							keyboardType='url'
							autoCapitalize='none'
							style={commonInputStyles}
							error={hasError}
						/>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'Date':
				return (
					<View key={index} style={styles.inputGroup}>
						<View style={styles.dateInputContainer}>
							<TextInput
								ref={(ref) => (inputRefs.current[keys] = ref)}
								value={formData[keys] || ""}
								placeholder="dd-mm-yyyy"
								editable={false}
								label={keys + (fieldRequired ? ' *' : '')}
								underlineColor={hasError ? 'red' : '#B9BDCF'}
								activeUnderlineColor={hasError ? 'red' : '#4D8733'}
								textColor="black"
								style={[commonInputStyles, { flex: 1 }]}
								error={hasError}
							/>
							<TouchableOpacity
								onPress={() => showPicker(keys, 'date')}
								style={styles.calendarButton}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Feather name="calendar" size={rs(20)} color="#4D8733" />
							</TouchableOpacity>
						</View>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'Date & Time':
				return (
					<View key={index} style={styles.inputGroup}>
						<View style={styles.dateInputContainer}>
							<TextInput
								value={formData[keys] || ""}
								placeholder="dd-mm-yyyy HH:MM AM/PM"
								editable={false}
								label={keys + (fieldRequired ? ' *' : '')}
								underlineColor={hasError ? 'red' : '#B9BDCF'}
								activeUnderlineColor={hasError ? 'red' : '#4D8733'}
								textColor="black"
								style={[commonInputStyles, { flex: 1 }]}
								error={hasError}
							/>
							<TouchableOpacity
								onPress={() => showPicker(keys, 'date-time')}
								style={styles.calendarButton}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Feather name="calendar" size={rs(20)} color="#4D8733" />
							</TouchableOpacity>
						</View>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'Time':
				return (
					<View key={index} style={styles.inputGroup}>
						<View style={styles.dateInputContainer}>
							<TextInput
								ref={(ref) => (inputRefs.current[keys] = ref)}
								value={formData[keys] || ""}
								placeholder="HH:MM AM/PM"
								editable={false}
								label={keys + (fieldRequired ? ' *' : '')}
								underlineColor={hasError ? 'red' : '#B9BDCF'}
								activeUnderlineColor={hasError ? 'red' : '#4D8733'}
								textColor="black"
								style={[commonInputStyles, { flex: 1 }]}
								error={hasError}
							/>
							<TouchableOpacity
								onPress={() => showPicker(keys, 'time')}
								style={styles.calendarButton}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Feather name="clock" size={rs(20)} color="#4D8733" />
							</TouchableOpacity>
						</View>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'Dropdown Range':
				const dropdownItems = tableAccess[keys]?.dropdownItems || [];
				const isOpen = accordionStates[keys]?.isOpen || false;
				const selectedItem = formData[keys] || '';

				return (
					<View key={index} style={styles.inputGroup}>
						<View style={[
							styles.accordionContainer,
							hasError && { borderBottomColor: 'red' }
						]}>
							<TouchableOpacity
								style={styles.accordionHeader}
								onPress={() => toggleAccordion(keys)}
								activeOpacity={0.7}
							>
								<View style={styles.accordionTitleContainer}>
									<Text style={[
										styles.accordionLabel,
										selectedItem ? styles.accordionLabelSelected : null,
										hasError && { color: 'red' }
									]}>
										{keys + (fieldRequired ? ' *' : '')}
									</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Text style={styles.accordionSelectedValue} numberOfLines={1}>
											{selectedItem || 'Select an option'}
										</Text>
										{
											selectedItem ? (
												<TouchableOpacity
													onPress={() => handleInputChange(keys, '')}
													style={styles.clearIconButton}
												>
													<AntDesign name="close" size={18} color="#4D8733" />
												</TouchableOpacity>
											) : null
										}
									</View>
								</View>
								<Feather
									name={isOpen ? "chevron-up" : "chevron-down"}
									size={rs(20)}
									color="#4D8733"
								/>
							</TouchableOpacity>

							<Animated.View style={[
								styles.accordionBody,
								{ height: accordionHeights.current[keys] || new Animated.Value(0) }
							]}>
								<ScrollView
									nestedScrollEnabled={true}
									showsVerticalScrollIndicator={true}
									contentContainerStyle={styles.accordionScrollContent}
								>
									{dropdownItems.map((item, idx) => (
										<TouchableOpacity
											key={`dropdown-${keys}-${idx}`}
											style={[
												styles.accordionItem,
												selectedItem === item && styles.accordionItemSelected
											]}
											onPress={() => {
												handleInputChange(keys, item);
												toggleAccordion(keys);
											}}
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
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'Dropdown Item':
				const dropdownItemOptions = tableAccess[keys]?.dropdownItems || [];
				const isOpenOptions = accordionStates[keys]?.isOpen || false;
				const selectedItemOptions = formData[keys] || '';

				// Initialize accordion height if not exists
				if (!accordionHeights.current[keys]) {
					accordionHeights.current[keys] = new Animated.Value(0);
				}

				return (
					<View key={index} style={styles.inputGroup}>
						<View style={[
							styles.accordionContainer,
							hasError && { borderBottomColor: 'red' }
						]}>
							<TouchableOpacity
								style={styles.accordionHeader}
								onPress={() => toggleAccordion(keys)}
								activeOpacity={0.7}
							>
								<View style={styles.accordionTitleContainer}>
									<Text style={[
										styles.accordionLabel,
										selectedItemOptions ? styles.accordionLabelSelected : null,
										hasError && { color: 'red' }
									]}>
										{keys + (fieldRequired ? ' *' : '')}
									</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Text style={styles.accordionSelectedValue} numberOfLines={1}>
											{selectedItemOptions || 'Select an option'}
										</Text>
										{selectedItemOptions ? (
											<TouchableOpacity
												onPress={() => handleInputChange(keys, '')}
												style={styles.clearIconButton}
											>
												<AntDesign name="close" size={rs(14)} color="#4D8733" />
											</TouchableOpacity>
										) : null}
									</View>
								</View>
								<Feather
									name={isOpenOptions ? "chevron-up" : "chevron-down"}
									size={rs(20)}
									color="#4D8733"
								/>
							</TouchableOpacity>

							<Animated.View
								style={[
									styles.accordionBody,
									{
										height: accordionHeights.current[keys],
										overflow: 'hidden'
									}
								]}
							>
								<ScrollView
									nestedScrollEnabled={true}
									showsVerticalScrollIndicator={true}
									contentContainerStyle={styles.accordionScrollContent}
								>
									{dropdownItemOptions.map((item, idx) => (
										<TouchableOpacity
											key={`dropdown-${keys}-${idx}`}
											style={[
												styles.accordionItem,
												selectedItemOptions === item && styles.accordionItemSelected
											]}
											onPress={() => {
												handleInputChange(keys, item);
												setTimeout(() => {
													toggleAccordion(keys);
												}, 100);
											}}
										>
											<Text style={[
												styles.accordionItemText,
												selectedItemOptions === item && styles.accordionItemTextSelected
											]}>
												{item}
											</Text>
										</TouchableOpacity>
									))}
								</ScrollView>
							</Animated.View>
						</View>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'File':
				return (
					<View key={index} style={styles.inputGroup}>
						<View style={styles.fileContainer}>
							<View style={{ position: 'relative' }}>
								<TouchableOpacity
									onPress={() => selectImageFromGallery(keys)}
									style={[
										styles.fileInputButton,
										hasError && { borderColor: 'red' }
									]}
								>
									<Feather name="camera" size={rs(16)} color="#4D8733" style={styles.fileButtonIcon} />
									<Text style={styles.fileButtonText}>Select Media</Text>
								</TouchableOpacity>
							</View>

							<View style={styles.fileNameContainer}>
								<Text style={{
									color: hasError ? 'red' : '#4D8733',
									fontFamily: 'Poppins-Regular',
									fontSize: rs(10.5)
								}}>
									{keys + (fieldRequired ? ' *' : '')}
								</Text>
								<Text
									style={styles.fileName}
									numberOfLines={1}
									ellipsizeMode="middle"
								>
									{imageUris[keys] ? imageUris[keys].split('/').pop() : 'No file chosen'}
								</Text>
							</View>
						</View>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			case 'Checkbox':
				return (
					<View key={index} style={styles.inputGroup}>
						<View style={styles.switchContainer}>
							<Text style={[
								styles.switchLabel,
								hasError && { color: 'red' }
							]}>
								{keys + (fieldRequired ? ' *' : '')}
							</Text>
							<Switch
								value={formData[keys] === true || formData[keys] === 'true'}
								onValueChange={(value) => handleInputChange(keys, value)}
								color="#4D8733"
							/>
						</View>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);

			default:
				return (
					<View key={index} style={styles.inputGroup}>
						<TextInput
							ref={(ref) => (inputRefs.current[keys] = ref)}
							label={keys + (fieldRequired ? ' *' : '')}
							value={formData[keys] || ''}
							onChangeText={(text) => handleInputChange(keys, text)}
							underlineColor={hasError ? 'red' : '#B9BDCF'}
							activeUnderlineColor={hasError ? 'red' : '#4D8733'}
							textColor='black'
							style={commonInputStyles}
							error={hasError}
						/>
						{hasError && <Text style={errorMessageStyle}>{errors[keys]}</Text>}
					</View>
				);
		}
	}, [formData, errors, handleInputChange, showPicker, selectImageFromGallery, imageUris, tableAccess, accordionStates, toggleAccordion, showDateRangePicker]);

	// console.log('tableAccess : ', tableAccess)

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#F4FAF4" />
			<View style={styles.header}>
				<Text style={styles.usersText}>Tables</Text>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Feather name="chevron-left" size={rs(20)} color="black" />
					<Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
						{__ID}
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.formContainer}
				contentContainerStyle={styles.formScrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.form}>
					{allInputData.map((item, index) => {
						const keys = item?.key;
						const datatype = item?.value?.dataType;
						const fieldRequired = item?.value?.required;
						const newKeys = String(keys);
						const matchCondition = globalPermission[`${newKeys}`];
						// console.log('item : ', item)

						if (matchCondition?.editAccess) {
							if (item?.value?.hidden) {
								return null;
							}

							return renderInputFields(keys, datatype, fieldRequired, index);
						}
						return null;
						return null;
					})}
				</View>
			</ScrollView>

			<DatePicker
				modal
				mode="date"
				open={datePickerOpen}
				date={tempDate || new Date()}
				onConfirm={handlePickerConfirm}
				onCancel={() => {
					setDatePickerOpen(false);
					setCurrentField(null);
				}}
			/>

			<DatePicker
				modal
				mode="time"
				open={timePickerOpen}
				date={tempDate || new Date()}
				onConfirm={handlePickerConfirm}
				onCancel={() => {
					setTimePickerOpen(false);
					setCurrentField(null);
				}}
			/>


			<TouchableOpacity
				style={[styles.footer, isEmptyForm && styles.disabledButton]}
				onPress={handleSave}
				disabled={isEmptyForm || isSubmitting}
			>
				<View style={styles.saveBtn}>
					{isSubmitting ? (
						<ActivityIndicator color="#FFFFFF" size="small" />
					) : (
						<Text style={styles.saveBtnText}>Save</Text>
					)}
				</View>
			</TouchableOpacity>
		</SafeAreaView>
	);
};

export default MainEditUser;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: Platform.OS === 'ios' ? rs(40) : rs(10),
		marginBottom: rs(10),
		paddingHorizontal: rs(15),
	},
	backButton: {
		width: '50%',
		flexDirection: 'row',
		alignItems: 'center',
	},
	usersText: {
		color: '#848486',
		fontSize: rf(14),
		fontFamily: 'Poppins-Regular',
		marginRight: rs(2),
	},
	headerTitle: {
		color: '#222327',
		fontSize: rf(16),
		fontFamily: 'Poppins-Medium',
		marginLeft: rs(2),
	},
	formContainer: {
		flex: 1,
	},
	formScrollContent: {
		flexGrow: 1,
		paddingBottom: rs(20),
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
		marginBottom: rs(15),
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
		flexDirection: 'row',
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
		flexDirection: 'row',
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
		borderBottomWidth: 1,
		borderBottomColor: '#B9BDCF',
	},
	accordionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: rs(10),
	},
	accordionTitleContainer: {
		flex: 1,
		marginRight: rs(10),
	},
	accordionLabel: {
		fontSize: rf(12),
		color: '#848486',
		fontFamily: 'Poppins-Regular',
	},
	accordionLabelSelected: {
		color: '#4D8733',
	},
	accordionSelectedValue: {
		fontSize: rf(14),
		color: '#222327',
		fontFamily: 'Poppins-Regular',
		marginTop: rs(2),
		flex: 1, // Add this
	},
	// Add this new style for the clear icon button
	clearIconButton: {
		// paddingLeft: rs(6),
		// paddingVertical: rs(2), // Add some vertical padding for better touch area
		height: rs(30),
		width: rs(30),
		borderRadius: rs(15),
		backgroundColor: '#F4FAF4',
		justifyContent: 'center',
		alignItems: 'center',
	},

	accordionBody: {
		overflow: 'hidden',
	},
	accordionScrollContent: {
		paddingVertical: rs(5),
	},
	accordionItem: {
		paddingVertical: rs(10),
		paddingHorizontal: rs(15),
	},
	accordionItemSelected: {
		backgroundColor: '#F4FAF4',
	},
	accordionItemText: {
		fontSize: rf(14),
		color: '#222327',
		fontFamily: 'Poppins-Regular',
	},
	accordionItemTextSelected: {
		color: '#4D8733',
		fontFamily: 'Poppins-Medium',
	},
	dateTimeContainer: {
		gap: rs(10),
	},
	timeInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	dateRangeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: rs(10),
		gap: rs(10),
	},
	dateRangeButton: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: rs(8),
		paddingHorizontal: rs(10),
		borderWidth: 1,
		borderColor: '#B9BDCF',
		borderRadius: rs(5),
		backgroundColor: '#F7F7F7',
	},
	dateRangeButtonText: {
		color: '#222327',
		fontSize: rf(14),
		fontFamily: 'Poppins-Regular',
	},
	dateRangeSeparator: {
		color: '#848486',
		fontSize: rf(16),
		fontFamily: 'Poppins-Medium',
	},
	switchContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: rs(10),
		borderBottomWidth: 0.6,
		borderBottomColor: '#B9BDCF',
	},
	switchLabel: {
		color: '#222327',
		fontSize: rf(15),
		fontFamily: 'Poppins-Regular',
		flex: 1,
	},
	fileButtonIcon: {
		marginRight: rs(6),
	},
});

