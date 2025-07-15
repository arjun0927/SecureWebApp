import React, { useEffect, useContext, createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast, { BaseToast } from 'react-native-toast-message';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { View } from 'react-native';

// Create Context
const GlobalContext = createContext();

const Base_URL = 'https://secure.ceoitbox.com/api/';

// Custom hook for accessing the context
export const useGlobalContext = () => useContext(GlobalContext);

// Provider Component
export const GlobalProvider = ({ children }) => {
  const [userData, setUserData] = useState([]);
  const [typeInfo, setTypeInfo] = useState(null);
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [globalFieldSettings, setGlobalFieldSettings] = useState([]);

  // Function to fetch table data by token

  const getToken = async () => {
    try {
      const data = await AsyncStorage.getItem('loginInfo');
      // console.log('loginInfo:', data); // Debugging log
      const parsedData = JSON.parse(data);
      const token = parsedData?.token; // Extract the token from the parsed data
      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  }

  const getAllTableData = async (id) => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${Base_URL}/getTableData/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // console.log('context API response:', response.data); // Debugging log

      if (response?.data) {
        setTypeInfo(response?.data?.tableSettingsData?.fieldSettings);
        setUserData(response?.data?.sheetData || []);
        return response?.data
      } else {
        console.error('No table access data found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getDataByToken = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${Base_URL}/getDataByToken`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.tablesAccess) {
        // console.log('context api response ',response.data.tablesAccess)
        
        setGlobalFieldSettings(response?.data?.tablesAccess)
        return response.data.tablesAccess;
      } else {
        console.error('No table access data found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const showToast = ({ type, message }) => {
    Toast.show({
      type: type.toLowerCase(),
      position: 'top',
      text1: message,
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 30, 
    });
  };

  const toastConfig = {
    success: ({ text1 }) => (
      <BaseToast
        style={{ 
          borderLeftColor: 'green', 
          backgroundColor: '#FFF',
          height: 'auto', // Allow dynamic height
          minHeight: 60,
          paddingVertical: 10,
          width: '90%', 
          alignItems:'center',
          alignSelf: 'center',
        }}
        contentContainerStyle={{ 
          flexDirection: 'row', 
          alignItems: 'flex-start', // Changed to flex-start for better alignment
          flex: 1,
          paddingHorizontal: 10,
        }}
        text1={text1}
        text1Style={{ 
          color: 'black', 
          fontSize: responsiveFontSize(2.1), 
          fontFamily: 'Poppins-Medium',
          flex: 1, 
          flexWrap: 'wrap', // Enable text wrapping
          textAlign: 'left',
          // lineHeight: responsiveFontSize(2.8), // Add line height for better readability
        }}
        text1NumberOfLines={0} // Allow unlimited lines
        renderLeadingIcon={() => (
          <View style={{ 
            alignItems: 'center', 
            flexDirection: 'row', 
            marginLeft:10
          }}>
            <MaterialIcons name="check-circle" size={responsiveFontSize(3.3)} color="green" />
          </View>
        )}
      />
    ),
    error: ({ text1 }) => (
      <BaseToast
        style={{ 
          borderLeftColor: 'red', 
          backgroundColor: '#FFF',
          height: 'auto',
          minHeight: 60,
          paddingVertical: 12,
          width: '90%',
          alignSelf: 'center',
        }}
        contentContainerStyle={{ 
          flexDirection: 'row', 
          alignItems: 'flex-start',
          flex: 1,
          paddingHorizontal: 10,
        }}
        text1={text1}
        text1Style={{ 
          color: 'black', 
          fontSize: responsiveFontSize(2.1), 
          fontFamily: 'Poppins-Medium',
          flex: 1,
          flexWrap: 'wrap',
          textAlign: 'left',
          // lineHeight: responsiveFontSize(2.8),
        }}
        text1NumberOfLines={0}
        renderLeadingIcon={() => (
          <View style={{ 
            alignItems: 'center', 
            flexDirection: 'row', 
            marginLeft:10
          }}>
            <MaterialIcons name="error" size={responsiveFontSize(3.3)} color="red" />
          </View>
        )}
      />
    ),
    warning: ({ text1 }) => (
      <BaseToast
        style={{ 
          borderLeftColor: 'orange', 
          backgroundColor: '#FFF',
          height: 'auto',
          minHeight: 60,
          paddingVertical: 12,
          width: '90%',
          alignSelf: 'center',
        }}
        contentContainerStyle={{ 
          flexDirection: 'row', 
          alignItems: 'flex-start',
          flex: 1,
          paddingHorizontal: 10,
        }}
        text1={text1}
        text1Style={{ 
          color: 'black', 
          fontSize: responsiveFontSize(2.1), 
          fontWeight: 'bold',
          flex: 1,
          flexWrap: 'wrap',
          textAlign: 'left',
          // lineHeight: responsiveFontSize(2.8),
        }}
        text1NumberOfLines={0}
        renderLeadingIcon={() => (
          <View style={{ 
            alignItems: 'center', 
            flexDirection: 'row', 
            marginLeft:10
          }}>
            <MaterialIcons name="warning" size={responsiveFontSize(3.3)} color="orange" />
          </View>
        )}
      />
    ),
  };

  const getTables = async () => {
    try {
      const loginuser_Id = await AsyncStorage.getItem('userId');
      // console.log(loginuser_Id);

      const token = await getToken();
      // console.log(token);
      const response = await axios.get(
        `https://secure.ceoitbox.com/api/getTables/${loginuser_Id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log('response',response.data);

      if (response.data) {
        setData(response.data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  const getUsers = async () => {
    try {
      const loginuser_Id = await AsyncStorage.getItem('userId');
      // console.log(loginuser_Id);

      const token = await getToken();
      // console.log(token);
      const response = await axios.get(
        `https://secure.ceoitbox.com/api/getUsers?userID=${loginuser_Id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log('response',response.data);
      if (response.data) {
          // console.log('data', response.data)
          // response.data.forEach((item, index) => {
          //   console.log(`Entry for tableAccess ${index + 1}:`);
          //   console.log(JSON.stringify(item, null, 2));
          // });
          setUsers(response.data)
        }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const TableData = async(id)=> {
    try {
      const token = await getToken();
      const response = await axios.get(
        `https://secure.ceoitbox.com/api//getTableData/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Table Data response',response.data);
      // if (response.data) {
          
      //   }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  // Debugging State Updates
  // useEffect(() => {
  //   if (userData.length > 0) {
  //     console.log('Updated userData:', userData);
  //   }
  // }, [userData]);

  // useEffect(() => {
  //   if (typeInfo) {
  //     console.log('Updated typeInfo:', typeInfo);
  //   }
  // }, [typeInfo]);

  const value = {
    getDataByToken,
    getAllTableData,
    userData,
    setUserData,
    setTypeInfo,
    typeInfo,
    showToast,
    getTables,
    data,
    setData,
    getUsers,
    setUsers,
    users,
    TableData,
    globalFieldSettings,
    setGlobalFieldSettings,
    toastConfig
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
      <Toast config={toastConfig} />
    </GlobalContext.Provider>
  );
};
