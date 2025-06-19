import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { responsiveFontSize, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions';
import DeleteSvg from '../assets/Svgs/DeleteSvg';
import DownArrowSvg from '../assets/Svgs/DownArrowSvg';
import TopArrowSvg from '../assets/Svgs/TopArrowSvg';
import { useNavigation } from '@react-navigation/native';
import DeleteModal from './MainUserComponents/DeleteModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useGlobalContext } from '../Context/GlobalContext';
import getToken from './getToken';


const TableCardContent = ({ item, tableAccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { showToast, data, setData, globalFieldSettings, } = useGlobalContext();
  const id = item?._id;
  // console.log('id : ', id)
  const tableInfo = globalFieldSettings.filter((item) => item._id === id);
  const role = tableInfo[0]?.role;

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const navigation = useNavigation();

  // console.log('data : ', data)

  const deleteSingleTable = async () => {
    try {
      setTableLoader(true);
      const token = await getToken();
      const id = item?._id;
      const response = await axios.delete(
        `https://secure.ceoitbox.com/api/deleteTable/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // console.log('response.data : ', response.data)
        const updatedData = data.filter(item => item._id !== id);
        setData(updatedData);
        setTableLoader(false);
        showToast({
          type: 'SUCCESS',
          message: 'Table Deleted Successfully'
        });
        setModalVisible(false);
      }
    } catch (error) {
      setTableLoader(false);
      console.error('Error deleting table:', error);
    } finally {
      setTableLoader(false);
    }
  };


  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={toggleOpen}>
        <View style={[styles.header]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.navigate('AllUserData', { id: item?._id, tableAccess: tableAccess, tableName: item?.tableName, item: item })}>
              <Text numberOfLines={1} ellipsizeMode='tail' style={styles.title}>{item?.tableName}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <>
              {
                role === 'ADMIN' && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setModalVisible(true)}
                  >
                    <DeleteSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)} />
                  </TouchableOpacity>
                )
              }
              {
                role === 'USER' && tableInfo[0]?.deletePermission && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setModalVisible(true)}
                  >
                    <DeleteSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)} />
                  </TouchableOpacity>
                )
              }
            </>
            <TouchableOpacity onPress={toggleOpen} style={styles.toggleButton}>
              {isOpen ? <DownArrowSvg width={responsiveFontSize(1.6)} height={responsiveFontSize(1.6)} /> : <TopArrowSvg width={responsiveFontSize(1.6)} height={responsiveFontSize(1.6)} />}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>


      {isOpen && (
        <View>
          <View style={styles.headerOpen}></View>
          <View style={styles.dataRow}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.rowLabel}>Tab Name</Text>
            <Text style={styles.rowValue}>{item?.spreadsheetsName}</Text>
          </View>
          <View style={[styles.dataRow, styles.noBorder]}>
            <Text style={styles.rowLabel}>Unique Field</Text>
            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.rowValue}>{item?.uniqueField}</Text>
          </View>
        </View>
      )}
      {modalVisible && (
        <DeleteModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          handleDelete={() => deleteSingleTable()}
          handleCancel={() => setModalVisible(false)}
          deleteLoader={tableLoader}
        />
      )}
    </View>
  );
};

export default TableCardContent;

const styles = StyleSheet.create({
  header: {
    width: '100%',
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
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor:'red',
    gap: 8,
  },
  headerRight: {
    width: '20%',
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor:'green',
    gap: 5,
  },
  title: {
    fontFamily: 'Montserrat-Medium',
    fontSize: responsiveFontSize(1.7),
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
    borderBottomWidth: 0,
  },
  rowLabel: {
    width: '50%',
    color: '#222327',
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Poppins-Regular',
  },
  rowValue: {
    flex: 1,
    color: '#578356',
    fontSize: responsiveFontSize(1.5),
    fontFamily: 'Poppins-Regular',
  },
});
