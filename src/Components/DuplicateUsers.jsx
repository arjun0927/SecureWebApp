import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Feather from 'react-native-vector-icons/Feather';
import { useGlobalContext } from '../Context/GlobalContext';
import getToken from './getToken';

const DuplicateUsers = ({ modalVisible, setModalVisible, handleDelete, handleCancel, duplicateUser, setDuplicateUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast, users, setUsers } = useGlobalContext()

  // console.log('userdata',duplicateUser)

  const hideModal = () => setModalVisible(false);

  useEffect(() => {
    setName(duplicateUser?.userName || '');
    setEmail(duplicateUser?.email || '');
    setPassword(duplicateUser?.password || '');

  }, [duplicateUser]);

  const handleSave = async () => {

    setIsLoading(true);
    if (duplicateUser.email === email) {
      showToast(
        { type: 'ERROR', message: 'User with same Email ID already exists' }
      )
      setIsLoading(false);
      return;
    }
    try {
      const token = await getToken();

      const sendData = {
        allowEveryIP: duplicateUser.allowEveryIP,
        allowEveryTime: duplicateUser.allowEveryTime,
        askOTP: duplicateUser.askOTP,
        blockUser: duplicateUser.blockUser,
        createdBy: duplicateUser.createdBy,
        email,
        isAdmin: duplicateUser.isAdmin,
        networkAccess: duplicateUser.networkAccess,
        password,
        role: duplicateUser.role,
        tablesAccess: duplicateUser.tablesAccess,
        userName: name,
        workingTimeAccess: duplicateUser.workingTimeAccess,
      };
      // console.log('tableAccess', tablesAccess)
      // console.log('sendData', sendData);

      const response = await axios.post(
        `https://secure.ceoitbox.com/api/createUniqueUsers`,
        sendData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        showToast({ type: 'SUCCESS', message: 'User Created Successfully' });
        // console.log('api response', response.data)
        setUsers([...users, response.data])
        hideModal();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      //   Alert.alert('Error', 'Failed to save user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalContent}>
            <View style={styles.topHeader}>
              <Text style={styles.topHeaderText}>
                Duplicate User
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.textContainerText}>
                You can edit the information of the user below
              </Text>
            </View>

            <ScrollView 
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inputGroup}>
                <TextInput
                  label={'Name'}
                  value={name}
                  textColor='black'
                  onChangeText={setName}
                  underlineColor='#B9BDCF'
                  activeUnderlineColor='#B9BDCF'
                  style={styles.input}
                  outlineColor="#B9BDCF"
                  activeOutlineColor="#4D8733"
                />
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  label={'Email'}
                  value={email}
                  onChangeText={setEmail}
                  underlineColor='#B9BDCF'
                  textColor='black'
                  activeUnderlineColor='#B9BDCF'
                  style={styles.input}
                  // mode="outlined"
                  outlineColor="#B9BDCF"
                  activeOutlineColor="#4D8733"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
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
                    // mode="outlined"
                    textColor='black'
                    outlineColor="#B9BDCF"
                    activeOutlineColor="#4D8733"
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={styles.eyeIcon}
                  >
                    <Feather
                      name={passwordVisible ? 'eye' : 'eye-off'}
                      size={responsiveFontSize(2.2)}
                      color="#222327"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.btnContainer}>
              <TouchableOpacity 
                onPress={handleCancel}
                style={styles.btnWrapper}
              >
                <View style={styles.btnContainer1}>
                  <Text style={styles.btnContainer1Text}>Cancel</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSave}
                style={styles.btnWrapper}
              >
                <View style={styles.btnContainer2}>
                  {isLoading ? 
                    <ActivityIndicator size={responsiveFontSize(2)} color='white' /> 
                    : <Text style={styles.btnContainer2Text}>Create</Text>
                  }
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DuplicateUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: responsiveWidth(5),
    borderRadius: responsiveWidth(5),
    width: responsiveWidth(90),
    maxWidth: 500, // Maximum width for larger screens
    elevation: 5,
    alignSelf: 'center',
    maxHeight: responsiveHeight(90), // Maximum height for the modal
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: responsiveWidth(5),
  },
  topHeader: {
    marginBottom: responsiveHeight(1),
  },
  topHeaderText: {
    fontSize: responsiveFontSize(2.2),
    color: 'black',
    fontFamily: 'Montserrat-Medium',
  },
  textContainer: {
    marginBottom: responsiveHeight(1),
  },
  textContainerText: {
    fontSize: responsiveFontSize(1.8),
    color: '#767A8D',
    fontFamily: 'Montserrat-Regular',
  },
  form: {
    backgroundColor: '#FFF',
    marginVertical: responsiveHeight(2),
    paddingBottom: responsiveHeight(2),
  },
  inputGroup: {
    marginBottom: responsiveHeight(1.5),
  },
  input: {
    height: responsiveHeight(5),
    backgroundColor: 'white',
    color: 'black',
    fontSize: responsiveFontSize(1.8),
    flex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: responsiveWidth(3),
    padding: responsiveWidth(1),
    zIndex: 1,
  },
  btnContainer: {
    marginTop: responsiveHeight(2),
    flexDirection: 'row',
    justifyContent: 'center',
    gap: responsiveWidth(4),
    flexWrap: 'wrap',
  },
  btnWrapper: {
    minWidth: responsiveWidth(30),
  },
  btnContainer1: {
    borderWidth: 1,
    borderColor: '#767A8D',
    borderRadius: responsiveWidth(2.5),
    height: responsiveHeight(4.49),
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer1Text: {
    fontSize: responsiveFontSize(1.8),
    color: '#767A8D',
    fontFamily: 'Montserrat-Medium',
  },
  btnContainer2: {
    borderRadius: responsiveWidth(2.5),
    height: responsiveHeight(4.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4D8733',
    minWidth: responsiveWidth(30),
  },
  btnContainer2Text: {
    fontSize: responsiveFontSize(1.8),
    color: 'white',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: 0.5,
  },
});
