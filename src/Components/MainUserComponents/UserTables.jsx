import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import LogOut from '../../Components/LogOut';
import UserTableCard from './UserTableCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../Context/GlobalContext';
import axios from 'axios';

const UserTables = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tableAccess, setTableAccess] = useState(null);
  const { getDataByToken, getTables, data, setData } = useGlobalContext();

  const handleLogout = () => {
    // console.log('Logging out...');
    setModalVisible(false); // Hide the modal after logging out
  };

  const handleCancel = () => {
    setModalVisible(false);
  };
  // response.data.forEach((item, index) => {
  //     console.log(`Entry for TableData ${index + 1}:`);
  //     console.log(JSON.stringify(item, null, 2)); // Indentation of 2 spaces
  //   });

  // console.log('getTableData',response.data);
  // console.log('getTableByToken info ', data);
  // data.forEach((item, index) => {
  //   console.log(`Entry for tableAccess ${index + 1}:`);
  //   console.log(JSON.stringify(item, null, 2)); // Indentation of 2 spaces
  // });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getTables(); 
        const tokenData = await getDataByToken();
  
        if (tokenData) {
          setTableAccess(tokenData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          if (tableAccess) {
            const matchingTableAccess = tableAccess.find((accessItem) => accessItem._id === item._id);

            if (matchingTableAccess) {
              return (
                <View style={styles.card}>
                  <UserTableCard
                    data={item}
                    setModalVisible={setModalVisible}
                    tableAccess={matchingTableAccess?.userFieldSettings}
                  />
                </View>
              );
            }
          }
          
          return null;
        }}
      />



      {modalVisible && (
        <LogOut
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          handleLogout={handleLogout}
          handleCancel={handleCancel}
        />
      )}
    </View>
  );
};

export default UserTables;

const styles = StyleSheet.create({
  container: {
    marginBottom: 60,
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    elevation: 3,
    marginBottom: 20,
    // marginHorizontal:20,
    marginTop:5,
    alignSelf:'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerOpen: {
    marginVertical: 7,
    borderBottomWidth: 1,
    borderColor: '#BDC3D4',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: 'black',
    lineHeight: 32,
  },
  iconButton: {
    backgroundColor: '#EEF5ED',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    width: 35,
    height: 39,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEFF6',
  },
  noBorder: {
    borderBottomWidth: 0, // No border for the specific row
  },
  rowLabel: {
    width: '50%',
    color: '#222327',
    fontSize: responsiveFontSize(1.7),
    fontFamily: 'Poppins',
    fontWeight: '400',
  },
  rowValue: {
    flex: 1,
    color: '#578356',
    fontSize: responsiveFontSize(1.5),
    fontFamily: 'Poppins',
    fontWeight: '400',
  },
});
