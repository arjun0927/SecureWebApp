import React, { useEffect, useContext, createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

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

  // Function to fetch table data by token

  const getAllTableData = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${Base_URL}/getTableData/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // console.log('context API response:', response.data); // Debugging log

      if (response?.data) {
        setTypeInfo(response?.data?.tableSettingsData?.fieldSettings);
        setUserData(response?.data?.sheetData || []);
      } else {
        console.error('No table access data found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getDataByToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
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
        return response.data.tablesAccess;
      } else {
        console.error('No table access data found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const showToast = ({ type, message }) => {
    if (type === 'SUCCESS' || type === 'ERROR' || type === 'INFO' || type === 'WARNING') {
      Toast.show({
        type: type.toLowerCase(),
        position: 'top',
        text1: message,
        text1Style: { color: 'black', fontSize: 18, fontWeight: 'bold' },
        visibilityTime: 3000,
        autoHide: true,
      });
    } else {
      console.warn('Invalid toast type passed');
    }
  };

  const getTables = async () => {
    try {
      const loginuser_Id = await AsyncStorage.getItem('userId');
      // console.log(loginuser_Id);

      const token = await AsyncStorage.getItem('token');
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

      const token = await AsyncStorage.getItem('token');
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
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </GlobalContext.Provider>
  );
};
