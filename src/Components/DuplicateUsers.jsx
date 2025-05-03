import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Feather from 'react-native-vector-icons/Feather';
import { useGlobalContext } from '../Context/GlobalContext';

const DuplicateUsers = ({ modalVisible, setModalVisible, handleDelete, handleCancel,duplicateUser ,setDuplicateUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {showToast} = useGlobalContext()
  
  // console.log('userdata',duplicateUser)

  const hideModal = () => setModalVisible(false);

  useEffect(() => {
      setName(duplicateUser?.userName || '');
      setEmail(duplicateUser?.email || '');
      setPassword(duplicateUser?.password || '');
      
    }, [duplicateUser]);

    const handleSave = async () => {

      setIsLoading(true);
      if(duplicateUser.email === email){
        showToast(
          { type: 'ERROR', message: 'User with same Email ID already exists' }
        )
        setIsLoading(false);
        return;
      }
      try {
        const data = await AsyncStorage.getItem('loginUser');
        const parsedData = JSON.parse(data);
        const token = parsedData?.token;
  
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
          tablesAccess:duplicateUser.tablesAccess,
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

            <ScrollView contentContainerStyle={styles.form}>
              <View style={styles.inputGroup}>
                <TextInput
                  label={'Name'}
                  value={name}
                  onChangeText={setName}
                  underlineColor='#B9BDCF'
                  activeUnderlineColor='#B9BDCF'
                  style={styles.input}
                />
              </View>
              <View style={styles.inputGroup}>
                {/* <Text style={styles.label}>Email*</Text> */}
                <TextInput
                  label={'Email'}
                  value={email}
                  onChangeText={setEmail}
                  underlineColor='#B9BDCF'
                  activeUnderlineColor='#B9BDCF'
                  style={styles.input}
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
            </ScrollView>

            <View style={styles.btnContainer}>
              <TouchableOpacity onPress={handleCancel}>
                <View style={styles.btnContainer1}>
                  <Text style={styles.btnContainer1Text}>Cancel</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <View style={styles.btnContainer2}>
                {isLoading ? <ActivityIndicator size={16} color='white' /> : <Text style={styles.btnContainer2Text}>Create</Text>}
                  
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
    padding: 25,
    marginHorizontal: 40,
    borderRadius: 20,
    width: responsiveWidth(90),
    elevation: 5,
  },
  backdrop: {
    flex: 1,
    // justifyContent: 'center',
    paddingTop: responsiveHeight(13),
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  topHeader: {
    marginTop: 10,
  },
  topHeaderText: {
    fontSize: responsiveFontSize(2.5),
    color: 'black',
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  textContainer: {
    marginTop: 5,
  },
  textContainerText: {
    fontSize: responsiveFontSize(2),
    color: '#767A8D',
    fontWeight: '400',
    fontFamily: 'Poppins',
  },
  form: {
    backgroundColor: '#FFF',
    marginVertical: 25,
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    backgroundColor:'white',
    color: 'black',
    fontSize: responsiveFontSize(2),
    flex:1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 5,
  },
  eyeIcon: {
    padding: 5,
  },

  btnContainer: {
    marginVertical: 25,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 20,
  },
  btnContainer1: {
    // width: responsiveWidth(25),
    borderWidth: 1,
    borderColor: '#767A8D',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer1Text: {
    fontSize: 16,
    color: '#767A8D',
    textAlign: 'center',
  },
  btnContainer2: {
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4D8733',
  },
  btnContainer2Text: {
    fontSize: 16,
    color: 'white',
    letterSpacing: 0.5,
  }
});
