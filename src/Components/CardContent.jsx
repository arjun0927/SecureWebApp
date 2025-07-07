import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import DeleteSvg from '../assets/Svgs/DeleteSvg';
import DownArrowSvg from '../assets/Svgs/DownArrowSvg';
import TopArrowSvg from '../assets/Svgs/TopArrowSvg';
import CopySvg from '../assets/Svgs/CopySvg';
import EditSvg from '../assets/Svgs/EditSvg';
import { useNavigation } from '@react-navigation/native';
import DuplicateUsers from './DuplicateUsers';
import OnlineIndicator from '../assets/Svgs/OnlineIndicator';
import DeleteModal from './MainUserComponents/DeleteModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../Context/GlobalContext';
import getToken from './getToken';


const CardContent = ({ data, onlineUser, isConnected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [duplicateUserModal, setDuplicateUserModal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [duplicateUser, setDuplicateUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(data?.blockUser);
  const { showToast , users , setUsers , onlineUsers } = useGlobalContext();

  const handleDelete = () => {
    setDuplicateUserModal(false);
  };

  const handleCancel = () => {
    setDuplicateUserModal(false);
  };

  const navigation = useNavigation();

  // console.log('isConnected : ',isConnected)


  const deleteUser = async () => {
    try {
      setDeleteLoader(true);
      const loginInfo = await AsyncStorage.getItem('loginInfo');
      const parsedData = JSON.parse(loginInfo);
      const token = parsedData?.token;
      const deleteUserId = data?._id;
      const response = await axios.delete(
        ` https://secure.ceoitbox.com/api/users/${deleteUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data) {
        const updatedUsers = users.filter(user => user._id !== deleteUserId);
        setUsers(updatedUsers);
        setDeleteLoader(false);

        showToast({
          type: 'SUCCESS',
          message: 'User Deleted Successfully'
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const newData = data;

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const duplicateUserFuntion = () => {
    setDuplicateUserModal(true);
    setDuplicateUser(data);
  }


  const handleBlockUser = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.put(
        `https://secure.ceoitbox.com/api/users/${data._id}`,
        { blockUser: !isBlocked },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        const updatedUsers = users.map(user => user._id === data._id ? response.data : user);
        setUsers(updatedUsers);
        const currentStatus = response?.data?.blockUser;
        setIsBlocked(currentStatus);
        showToast({
          type: 'SUCCESS',
          message: isBlocked ? 'User Unblocked Successfully' : 'User Blocked Successfully',
        });
      }
    } catch (error) {
      console.error(`Error ${isBlocked ? 'unblocking' : 'blocking'} user:`, error);
      showToast({
        type: 'ERROR',
        message: `Failed to ${isBlocked ? 'Unblock' : 'Block'} User`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getOnlineStatus = () => {
    if (!isConnected) return false; // Socket is not connected
    return !!onlineUser; // User is online if found in onlineUsers array
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleOpen}>
        <View style={[styles.header]}>
          <View style={styles.headerLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={styles.title}>{data.userName}</Text>
              {/* <View style={{ marginTop: 2 }}>
                {getOnlineStatus() ? <OnlineIndicator /> : <View />}
              </View> */}
            </View>
            <Text style={styles.email}>{data.email}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setModalVisible(true)}
            >
              <DeleteSvg width={responsiveFontSize(2.2)} height={responsiveFontSize(2.2)} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleOpen} style={styles.toggleButton}>
              {isOpen ? <DownArrowSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)} /> : <TopArrowSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)} />}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View>
          <View style={styles.headerOpen}></View>
          <View style={styles.dataRow}>
            <Text style={styles.rowLabel} ellipsizeMode='tail' numberOfLines={1}>Table Access</Text>
            <FlatList
              data={data.tablesAccess}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.rowValue} ellipsizeMode='tail' numberOfLines={1}>{item.tableName}</Text>
              )}
            />
          </View>

          <View style={[styles.dataRow]}>
            <Text style={styles.rowLabel}>Password</Text>
            <Text style={styles.rowValue} ellipsizeMode='tail' numberOfLines={1}>{data.password}</Text>
          </View>
          <View style={styles.lastRow}>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity onPress={() => duplicateUserFuntion(data)}>
                <View style={styles.iconButton}>
                  <CopySvg width={responsiveFontSize(1.6)} height={responsiveFontSize(1.6)} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('EditUser', { editData: newData })}>
                <View style={styles.iconButton}>
                  <EditSvg width={responsiveFontSize(1.6)} height={responsiveFontSize(1.6)} />
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleBlockUser} disabled={loading}>
              <View style={styles.blockBtn}>
                <Text style={styles.blockBtnText}>
                  {isBlocked ? 'Unblock User' : 'Block User'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <DuplicateUsers
        modalVisible={duplicateUserModal}
        setModalVisible={setDuplicateUserModal}
        handleDelete={handleDelete}
        handleCancel={handleCancel}
        duplicateUser={duplicateUser}
        setDuplicateUser={setDuplicateUser}
      />

      {modalVisible && (
        <DeleteModal
          modalVisible={modalVisible}
          deleteLoader={deleteLoader}
          setModalVisible={setModalVisible}
          handleDelete={() => deleteUser()}
          handleCancel={() => setModalVisible(false)}
          contentType={'user'}
        />
      )}
    </View>
  );
};

export default CardContent;


const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerOpen: {
    marginTop: responsiveHeight(1.5),
    marginBottom: 5,
    borderBottomWidth: 1,
    borderColor: '#BDC3D4',
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(5),
  },
  title: {
    fontFamily: 'Montserrat-Medium',
    fontSize: responsiveFontSize(1.9),
    color: 'black',
  },
  email: {
    fontFamily: 'Montserrat-Medium',
    fontSize: responsiveFontSize(1.4),
    color: '#578356',
  },
  iconButton: {
    backgroundColor: '#EEF5ED',
    width: responsiveWidth(7),
    height: responsiveWidth(7),
    borderRadius: responsiveWidth(3.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveWidth(1),
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: responsiveHeight(0.7),
    paddingHorizontal: responsiveWidth(1),
    borderBottomWidth: 1,
    borderBottomColor: '#EEEFF6',
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
  blockBtn: {
    borderWidth: 1,
    borderColor: '#B8EAB4',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockBtnText: {
    fontSize: responsiveFontSize(1.6),
    color: '#587555',
    fontFamily: 'Montserrat-SemiBold',
  },
  lastRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    width: responsiveWidth(1.5),
    height: responsiveHeight(0.3),
    borderRadius: responsiveWidth(0.75),
    marginLeft: responsiveWidth(1),
  },
});
