import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import axios from 'axios';
import { useGlobalContext } from '../Context/GlobalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddNewUsers = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTables, setSelectedTables] = useState([]); // For multiple table selections
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigation = useNavigation();
  const { getTables, data, showToast, getUsers } = useGlobalContext();

  useEffect(() => {
    const fetchAccordionData = async () => {
      await getTables(); // Fetch tables from API
    };
    fetchAccordionData();
  }, []);

  const handleTableSelect = (table) => {
    // Toggle table selection
    if (selectedTables.includes(table)) {
      setSelectedTables((prev) => prev.filter((t) => t !== table));
      setIsAccordionOpen(false)
    } else {
      setSelectedTables((prev) => [...prev, table]);
      setIsAccordionOpen(false)
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
      const token = await AsyncStorage.getItem('token');

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
        askOTP: true,
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

      if (response.data) {
        await getUsers();
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.usersText}>Users</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Feather name="chevron-left" size={24} color="black" />
            <Text style={styles.headerTitle}>Add New User</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form}>

          {/* {['Name*', 'Email*', 'Password*'].map((label, index) => (
            <View key={index} style={styles.inputGroup}>
              <TextInput
                label={label}
                value={label === 'Name*' ? name : label === 'Email*' ? email : password}
                secureTextEntry={label === 'Password*'}
                onChangeText={(text) =>
                  label === 'Name*'
                    ? setName(text)
                    : label === 'Email*'
                      ? setEmail(text)
                      : setPassword(text)
                }
                underlineColor="#B9BDCF"
                activeUnderlineColor="#B9BDCF"
                textColor="black"
                style={styles.input}
              />
            </View>
          ))} */}
          <View style={styles.inputGroup}>
            <TextInput
              label="Name*"
              value={name}
              onChangeText={setName}
              underlineColor="#B9BDCF"
              activeUnderlineColor="#B9BDCF"
              textColor="black"
              style={styles.input}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <TextInput
              label="Email*"
              value={email}
              onChangeText={setEmail}
              underlineColor="#B9BDCF"
              activeUnderlineColor="#B9BDCF"
              textColor="black"
              style={styles.input}
            />
          </View>

          {/* Password Input with Eye Icon */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordContainer}>
              <TextInput
                label={'Password'}
                value={password}
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

          {/* Accordion for Multiple Table Selection */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity onPress={() => setIsAccordionOpen(!isAccordionOpen)}>
              <View style={styles.accordionHeader}>
                <Text style={styles.accordionHeaderText}>
                  <View style={styles.selectedTableContainer}>
                    {selectedTables.length > 0 ? (
                      selectedTables.map((table, index) => (
                        <View key={index} style={styles.selectedTableItem}>
                          <Text style={styles.selectedTableText}>{table.tableName}</Text>
                          <TouchableOpacity
                            onPress={() => {
                              const updatedTables = selectedTables.filter((t) => t !== table);
                              setSelectedTables(updatedTables);
                            }}
                            style={styles.clearButton}
                          >
                            <Feather name="x" size={18} color="black" />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.accordionHeaderText}>Select Tables</Text>
                    )}
                  </View>


                </Text>
                <Feather
                  name={isAccordionOpen ? 'chevron-down' : 'chevron-right'}
                  size={23}
                  color="black"
                />
              </View>
            </TouchableOpacity>

            {isAccordionOpen && (
              <View
                style={{
                  backgroundColor: 'white',
                  marginTop: 10,
                  borderRadius: 5,
                  paddingLeft: 5,
                  width: '95%',
                  height: 170,
                  alignSelf: 'center',
                  elevation: 1,
                }}
              >
                <FlatList
                  data={data}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleTableSelect(item)}
                      style={styles.accordionItem}
                    >
                      <Text
                        style={[
                          styles.accordionItemText,
                          selectedTables.includes(item) && styles.selectedItemText,
                        ]}
                      >
                        {item.tableName}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={isFormValid && !isLoading ? handleSave : null}
            disabled={!isFormValid || isLoading}
            style={[styles.saveBtn, { opacity: isFormValid && !isLoading ? 1 : 0.5 }]}
          >
            <Text style={styles.saveBtnText}>
              {isLoading ? <ActivityIndicator size={25} color="white" /> : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    fontWeight: '400',
  },
  headerTitle: {
    color: '#222327',
    fontSize: responsiveFontSize(2.3),
    fontWeight: '500',
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
  passwordContainer: {
		flex:1,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 5,
	},
	eyeIcon: {
		padding: 5,
	},
  inputGroup: {
    marginBottom: 15,
  },
  input: {
		height: 40,
		color: 'black',
		fontSize: responsiveFontSize(2),
		backgroundColor: 'white',
		flex:1,
	},
  accordionContent: {
    paddingTop: 10,
    borderWidth: 0.5,
    borderColor: '#DEE0EA',
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 10,
  },

  accordionContainer: {
    marginBottom: 15,
    marginTop: 10
  },
  accordionHeader: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionHeaderText: {
    color: 'black',
    fontSize: responsiveFontSize(2),
    fontWeight: '400',
  },
  selectedTableContainer: {
    // paddingVertical: 2,
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    flexWrap: 'wrap'
  },
  selectedTableItem: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#E9EAF1',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 0.7,
    borderColor: '#D4D6DF'
  },
  selectedTableText: {
    fontSize: responsiveFontSize(1.5),
  },
  accordionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#EEEFF6',
  },
  accordionItemText: {
    fontSize: 16,
    marginLeft: 5,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  selectedItemText: {
    color: '#4D8733',
    fontWeight: '600',
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
    fontSize: responsiveFontSize(2.3),
    fontWeight: '600',
  },
});
