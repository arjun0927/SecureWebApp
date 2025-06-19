import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import axios from 'axios';
import { useGlobalContext } from '../Context/GlobalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Backhandler from './Backhandler';
import getToken from './getToken';

const { height } = Dimensions.get('window');

const AddNewUsers = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTables, setSelectedTables] = useState([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigation = useNavigation();
  const { getTables, data, showToast, getUsers, users, setUsers } = useGlobalContext();

  Backhandler();

  useEffect(() => {
    const fetchTables = async () => {
      await getTables();
    };
    fetchTables();
  }, []);

  const handleTableSelect = (table) => {
    if (selectedTables.some(t => t._id === table._id)) {
      setSelectedTables((prev) => prev.filter((t) => t._id !== table._id));
      setIsAccordionOpen(false);
    } else {
      setSelectedTables((prev) => [...prev, table]);
      setIsAccordionOpen(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTables.length) {
      Alert.alert('Error', 'Please select at least one table before saving.');
      return;
    }

    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await getToken();

      // Prepare `tablesAccess` entries for each selected table
      const tablesAccess = selectedTables.map((table) => {
        const userFieldSettings = {};
        for (let field in table.fieldSettings) {
          userFieldSettings[field] = {
            fieldName: field,
            viewAccess: true,
            createAccess: true,
            editAccess: true,
            filters: [],
          };
        }

        return {
          assignToOtherUser: false,
          createPermission: false,
          deletePermission: false,
          deleteTablePermission: false,
          editTablePermission: false,
          role: 'ADMIN',
          rowsPerPage: 10,
          tableName: table.tableName,
          userFieldSettings,
          _id: table._id,
        };
      });

      // Prepare payload for API
      const sendData = {
        allowEveryIP: true,
        allowEveryTime: true,
        askOTP: false,
        blockUser: false,
        createdBy: userId,
        email,
        isAdmin: false,
        networkAccess: [],
        password,
        role: 'ADMIN',
        tablesAccess,
        userName: name,
        workingTimeAccess: [
          { day: 'SUN', accessTime: [], enabled: true },
          { day: 'MON', accessTime: [['09:00', '18:00']], enabled: true },
          { day: 'TUE', accessTime: [['09:00', '18:00']], enabled: true },
          { day: 'WED', accessTime: [['09:00', '18:00']], enabled: true },
          { day: 'THU', accessTime: [['09:00', '18:00']], enabled: true },
          { day: 'FRI', accessTime: [['09:00', '18:00']], enabled: true },
          { day: 'SAT', accessTime: [['09:00', '18:00']], enabled: true },
        ],
      };

      // Make API call
      const response = await axios.post(
        'https://secure.ceoitbox.com/api/createUniqueUsers',
        sendData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.error) {
        showToast({ type: 'ERROR', message: response?.data?.error });
        return;
      }

      if (response?.data) {
        setUsers([...users, response?.data])
        showToast({ type: 'SUCCESS', message: 'User Created Successfully' });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Error', 'Failed to save user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name && email && password && selectedTables.length > 0;

  return (
    <TouchableWithoutFeedback onPress={() => setIsAccordionOpen(false)}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.usersText}>Users</Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.goBack()}
            >
              <Feather name="chevron-left" size={24} color="black" />
              <Text style={styles.headerTitle}>Add New User</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={[{ key: 'form' }]}
            renderItem={() => (
              <View style={styles.form}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <TextInput
                    label={'Name'}
                    value={name}
                    textColor='black'
                    onChangeText={setName}
                    underlineColor='#B9BDCF'
                    activeUnderlineColor='#B9BDCF'
                    style={styles.input}
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <TextInput
                    label={'Email'}
                    value={email}
                    textColor='black'
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    underlineColor='#B9BDCF'
                    activeUnderlineColor='#B9BDCF'
                    style={styles.input}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      label={'Password'}
                      value={password}
                      textColor='black'
                      secureTextEntry={!passwordVisible}
                      onChangeText={setPassword}
                      underlineColor='#B9BDCF'
                      activeUnderlineColor='#B9BDCF'
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() => setPasswordVisible(!passwordVisible)}
                      style={styles.eyeIcon}
                    >
                      <Feather
                        name={passwordVisible ? 'eye' : 'eye-off'}
                        size={18}
                        color="#222327"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Tables Accordion */}
                <View style={styles.accordionContainer}>
                  <TouchableOpacity
                    onPress={() => setIsAccordionOpen(!isAccordionOpen)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accordionHeader}>
                      <View style={styles.selectedTableContainer}>
                        {selectedTables.length > 0 ? (
                          selectedTables.map((table, index) => (
                            <View key={index} style={styles.selectedTableItem}>
                              <Text style={styles.selectedTableText}>{table.tableName}</Text>
                              <TouchableOpacity
                                onPress={() => {
                                  const updatedTables = selectedTables.filter((t) => t._id !== table._id);
                                  setSelectedTables(updatedTables);
                                }}
                                style={styles.clearButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              >
                                <Feather name="x" size={16} color="#666" />
                              </TouchableOpacity>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.accordionHeaderText}>Select Tables</Text>
                        )}
                      </View>
                      <Feather
                        name={isAccordionOpen ? 'chevron-down' : 'chevron-right'}
                        size={20}
                        color="#666"
                      />
                    </View>
                  </TouchableOpacity>

                  {isAccordionOpen && (
                    <View style={styles.accordionContent}>
                      <ScrollView nestedScrollEnabled={true}>
                        {data.map((item) => (
                          <TouchableOpacity
                            key={item._id}
                            onPress={() => handleTableSelect(item)}
                            style={styles.accordionItem}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.accordionItemText,
                                selectedTables.some(t => t._id === item._id) && styles.selectedItemText,
                              ]}
                            >
                              {item.tableName}
                            </Text>

                            {selectedTables.some(t => t._id === item._id) && (
                              <Feather name="check" size={18} color="#4D8733" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                </View>
              </View>
            )}
            keyExtractor={() => 'form'}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={isFormValid && !isLoading ? handleSave : null}
              disabled={!isFormValid || isLoading}
              style={[
                styles.saveBtn,
                { opacity: isFormValid && !isLoading ? 1 : 0.5 }
              ]}
            >
              <Text style={styles.saveBtnText}>
                {isLoading ? <ActivityIndicator size={25} color='white' /> : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default AddNewUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAF4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  usersText: {
    color: '#848486',
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins-Regular',
  },
  headerTitle: {
    color: '#222327',
    fontSize: responsiveFontSize(2.3),
    fontFamily: 'Poppins-Medium',
  },
  form: {
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    width: '90%',
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 10,
  },
  input: {
    height: responsiveHeight(5),
    color: 'black',
    fontSize: responsiveFontSize(1.9),
    fontFamily: 'Poppins-Regular',
    backgroundColor: 'white',
    flex: 1,
  },
  passwordContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    // padding: 5,
  },
  accordionContainer: {
    marginBottom: 15,
    width: '100%',
  },
  accordionHeader: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  accordionHeaderText: {
    fontSize: responsiveFontSize(1.9),
    fontFamily: 'Poppins-Regular',
    flex: 1,
    color: '#222327',
  },
  accordionContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9EAF1',
    maxHeight: 0.2 * height,
    shadowColor: '#000',
    position: 'absolute',
    top: '100%',
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },

  accordionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#EEEFF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionItemText: {
    fontSize: responsiveFontSize(1.5),
    fontFamily: 'Poppins-Regular',
    color: '#222327',
  },
  selectedItemText: {
    color: '#4D8733',
    fontFamily: 'Poppins-Regular',
  },
  selectedTableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  selectedTableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9EAF1',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D4D6DF',
    marginBottom: 4,
  },
  selectedTableText: {
    fontSize: responsiveFontSize(1.5),
    color: '#222327',
    marginRight: 4,
  },
  clearButton: {
    padding: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#4D8733',
    paddingVertical: 13,
    width: '40%',
    alignSelf: 'center',
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(2),
  },
});