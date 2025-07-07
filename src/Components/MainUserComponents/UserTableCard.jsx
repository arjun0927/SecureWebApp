import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import DeleteSvg from '../../assets/Svgs/DeleteSvg';
import DownArrowSvg from '../../assets/Svgs/DownArrowSvg';
import TopArrowSvg from '../../assets/Svgs/TopArrowSvg';
import { useNavigation } from '@react-navigation/native';
import DeleteModal from './DeleteModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../Context/GlobalContext';


const UserTableCard = ({ data, tableAccess, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTableLoader, setDeleteTableLoader] = useState(false);
  const { getTables, showToast, globalFieldSettings, } = useGlobalContext()

  const id = data?._id;

  // console.log('id : ', id)

  const tableInfo = globalFieldSettings.filter((item) => item._id === id);
  const globalPermission = tableInfo[0]?.userFieldSettings || {};
  const role = tableInfo[0]?.role;

  // console.log('role : ', role)

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const navigation = useNavigation();

  const deleteSingleTable = async () => {
    try {
      setDeleteTableLoader(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(
        `https://secure.ceoitbox.com/api/deleteTable/${data._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log('delete Response ', response.data)

      if (response.data) {
        await getTables();
        showToast({
          type: 'SUCCESS',
          message: 'Table Deleted Successfully'
        });
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error deleting table:', error);
    } finally {
      setDeleteTableLoader(false);
    }
  };

  return (
    <View>

      <View style={[styles.header]}>
        <TouchableOpacity onPress={() => navigation.navigate('AllUserData', { id: data?._id, tableAccess: tableAccess, tableName: data?.tableName, item: item })}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{data?.tableName}</Text>
          </View>

        </TouchableOpacity>
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
          handleDelete={() => deleteSingleTable()}
          handleCancel={() => setModalVisible(false)}
          setDeleteTableLoader={setDeleteTableLoader}
          deleteTableLoader={deleteTableLoader}
          contentType={'table'}
        />
      )}
    </View>
  );
};

export default UserTableCard;

const styles = StyleSheet.create({

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
    gap: 20,
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7),
    color: 'black',
    lineHeight: 32,
  },
  iconButton: {
    backgroundColor: '#EEF5ED',
    borderRadius: responsiveWidth(3.25),
    width: responsiveWidth(6.5),
    height: responsiveWidth(6.5),
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
    fontWeight: '400',
  },
  rowValue: {
    flex: 1,
    color: '#578356',
    fontSize: responsiveFontSize(1.5),
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
});
