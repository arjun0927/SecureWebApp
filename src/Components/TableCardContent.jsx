import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import DeleteSvg from '../assets/Svgs/DeleteSvg';
import DownArrowSvg from '../assets/Svgs/DownArrowSvg';
import TopArrowSvg from '../assets/Svgs/TopArrowSvg';
import { useNavigation } from '@react-navigation/native';
import DeleteModal from './MainUserComponents/DeleteModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useGlobalContext } from '../Context/GlobalContext';


const TableCardContent = ({ data, tableAccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const {showToast} = useGlobalContext();

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const navigation = useNavigation();

  const deleteUser = async() => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(
        `https://secure.ceoitbox.com/api/deleteTable/${data._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log('deleteApi response',response.data)
      if(response.data){
        showToast({
          type:'SUCCESS',
          message:'Table Deleted Successfully'
        })
      }
      // console.log('deleteApi response',data._id)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate('AllTableData', { id: data?._id, tableAccess: tableAccess, tableName: data?.tableName })}>
        <View style={[styles.header]}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{data?.tableName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setModalVisible(true)}
            >
              <DeleteSvg />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleOpen} style={styles.toggleButton}>
              {isOpen ? <DownArrowSvg /> : <TopArrowSvg />}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View>
          <View style={styles.headerOpen}></View>
          <View style={styles.dataRow}>
            <Text style={styles.rowLabel}>Tab Name</Text>
            <Text style={styles.rowValue}>{data?.spreadsheetsName}</Text>
          </View>
          <View style={[styles.dataRow, styles.noBorder]}>
            <Text style={styles.rowLabel}>Unique Field</Text>
            <Text style={styles.rowValue}>{data?.uniqueField}</Text>
          </View>
        </View>
      )}
      {modalVisible && (
        <DeleteModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          handleDelete={() => deleteUser()}
          handleCancel={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

export default TableCardContent;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    elevation: 3,
    marginBottom: 20,
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
    borderBottomWidth: 0,
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
