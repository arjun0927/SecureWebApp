import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
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


const CardContent = ({ data , onlineUser}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [duplicateUserModal, setDuplicateUserModal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false);
  const [duplicateUser, setDuplicateUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(data.isBlocked);
  const { showToast , getUsers } = useGlobalContext();

  // console.log('onlineUser',onlineUser)

  // console.log('tableAccess',data.tablesAccess)
  // data.tablesAccess.forEach((item, index) => {
  //   console.log(`Entry for tableAccess ${index + 1}:`);
  //   console.log(JSON.stringify(item, null, 2));
  // });
  // console.log('data',data)

  const handleDelete = () => {
    // console.log("Duplicate users deleted");
    setDuplicateUserModal(false);
  };

  const handleCancel = () => {
    // console.log("Delete action canceled");
    setDuplicateUserModal(false);
  };

  const navigation = useNavigation();


  const deleteUser = async () => {
    try {
      // setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(
        ` https://secure.ceoitbox.com/api/users/${data._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log('deleteApi response',response.data)
      if (response.data) {
        // setIsLoading(false)

        await getUsers();

        showToast({
          type: 'SUCCESS',
          message: 'User Deleted Successfully'
        });
        return response.data;
      }

      // console.log('deleteApi response',data._id)
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
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `https://secure.ceoitbox.com/api/users/${data._id}`,
        { blockUser: !isBlocked }, // Toggle block status
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setIsBlocked(!isBlocked); // Update state
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

  return (
    <View>
      <TouchableOpacity onPress={toggleOpen}>
        <View style={[styles.header]}>
          <View style={styles.headerLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={styles.title}>{data.userName}</Text>
              <View style={{ marginTop: 2 }}>
                {onlineUser ? <OnlineIndicator /> : <View />}
              </View>
            </View>
            <Text style={styles.email}>{data.email}</Text>
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
            <Text style={styles.rowLabel}>Table Access</Text>
            <FlatList
              data={data.tablesAccess}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.rowValue}>{item.tableName}</Text>
              )}
            />
          </View>

          <View style={[styles.dataRow]}>
            <Text style={styles.rowLabel}>Password</Text>
            <Text style={styles.rowValue}>{data.password}</Text>
          </View>
          <View style={styles.lastRow}>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity onPress={() => duplicateUserFuntion(data)}>
                <View style={styles.iconButton}>
                  <CopySvg />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('EditUser', { editData: newData })}>
                <View style={styles.iconButton}>
                  <EditSvg />
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
          setModalVisible={setModalVisible}
          handleDelete={() => deleteUser()}
          handleCancel={() => setModalVisible(false)}
        // isLoading={isLoading}
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
    marginTop: 10,
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
    gap: 5,
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: 'black',
    lineHeight: 32,
  },
  email: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#578356',
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
  blockBtn: {
    borderWidth: 1,
    borderColor: '#B8EAB4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockBtnText: {
    fontSize: responsiveFontSize(1.8),
    color: '#587555',
    fontWeight: '600',
  },
  lastRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
