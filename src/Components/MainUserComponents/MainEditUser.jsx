import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useGlobalContext } from '../../Context/GlobalContext';
import { TextInput } from 'react-native-paper';
import DropdownAccordion from './DropdownAccordion';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FrameSvg from '../../assets/Svgs/FrameSvg';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale factor for responsive sizing
const scaleFactor = SCREEN_WIDTH / 375; // Base scale on standard iPhone width

// Responsive sizing functions
const rs = (size) => size * scaleFactor; // Responsive size
const rf = (size) => Math.round(size * scaleFactor); // Responsive font size

const MainEditUser = ({ route }) => {
  const { id, fieldData, __ID, userItem, typeInfo } = route.params;
  const navigation = useNavigation();
  const { showToast, getAllTableData } = useGlobalContext();
  
  const [initialData, setInitialData] = useState({});
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUri, setImageUri] = useState('');
  const [datePickerField, setDatePickerField] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const inputRefs = useRef({});

  // Initialize form data from userItem
  useEffect(() => {
    const initialValues = fieldData.reduce((acc, field) => {
      acc[field] = userItem?.[field] || '';
      return acc;
    }, {});
    setInitialData(initialValues);
    setFormData(initialValues);
    
    // Set image URI if there's a file in the user data
    for (const field in initialValues) {
      const dataType = typeInfo?.[field]?.dataType;
      if (dataType === 'File' && initialValues[field]) {
        setImageUri(initialValues[field]);
        break;
      }
    }
  }, [fieldData, userItem, typeInfo]);

  // Memoize form modification check to prevent unnecessary re-renders
  const isFormModified = useMemo(() => {
    return JSON.stringify(initialData) !== JSON.stringify(formData);
  }, [initialData, formData]);

  // Optimize input change handler with useCallback
  const handleInputChange = useCallback((field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  // Optimize save handler with useCallback
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
      const token = await AsyncStorage.getItem('token');

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

      if (response.data.status === 200) {
        // Fetch updated data
        await getAllTableData(id);

        showToast({
          type: 'SUCCESS',
          message: 'Data saved successfully'
        });
      }
    } catch (error) {
      console.error('Error saving data:', error.response?.data || error.message);
      
      showToast({
        type: 'ERROR',
        message: error.response?.data?.message || 'Failed to save data'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, initialData, isFormModified, isSubmitting, id, __ID, getAllTableData, showToast]);

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
        mediaType: 'photo',
        quality: 0.5,
      });

      if (response.didCancel || response.errorCode) return;

      // Process only when we have valid response data
      if (response.assets?.[0]?.uri) {
        const sourceUri = response.assets[0].uri;
        setImageUri(sourceUri);
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
    if (fieldName === '__ID') return null;
    
    const dataType = typeInfo?.[fieldName]?.dataType;
    const dropdownItems = typeInfo?.[fieldName]?.dropdownItems;

    // Common text input styles
    const commonInputStyles = {
      fontSize: rf(16),
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
              underlineColor="#B9BDCF"
              activeUnderlineColor="#4D8733"
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
            <DropdownAccordion
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
            <TouchableOpacity
              onPress={() => selectImageFromGallery(field)}
              style={styles.fileInputButton}
            >
              <Text style={styles.fileButtonText}>Choose File</Text>
            </TouchableOpacity>
            <View style={styles.fileNameContainer}>
              <Text
                style={styles.fileName}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {imageUri ? imageUri.split('/').pop() : 'No file chosen'}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  }, [formData, typeInfo, handleInputChange, showDatePicker, selectImageFromGallery, imageUri]);

  // Create a memoized list of form fields
  const formFields = useMemo(() => {
    return fieldData.map((fieldName, index) => (
      <View key={`field-${index}`} style={styles.inputGroup}>
        {renderInputField(fieldName, fieldName)}
      </View>
    ));
  }, [fieldData, renderInputField]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4FAF4" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? rs(20) : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
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
          <View style={styles.iconWrapper}>
            <FrameSvg />
          </View>
        </View>

        {/* Form */}
        <ScrollView
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
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4FAF4',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? rs(40) : rs(20),
    marginBottom: rs(10),
    paddingHorizontal: rs(15),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    width: '60%',
  },
  iconWrapper: {
    height: rs(32),
    width: rs(32),
    backgroundColor: '#C6FF96',
    borderRadius: rs(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
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
    fontSize: rf(14),
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    paddingVertical: rs(10),
    backgroundColor: '#F4FAF4',
  },
  saveBtn: {
    backgroundColor: '#4D8733',
    paddingVertical: rs(15),
    width: '45%',
    alignSelf: 'center',
    borderRadius: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: rs(50),
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
});

export default MainEditUser;