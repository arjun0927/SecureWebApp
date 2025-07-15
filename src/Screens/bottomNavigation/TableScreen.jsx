import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThreeDotsSvg from '../../assets/Svgs/ThreeDotsSvg';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import TableIcon from '../../assets/Svgs/TableIcon';
import TableData from './TableData';
import UserThreeDotsModal from '../../Components/MainUserComponents/UserThreeDotsModal';
import AnimatedTableSearchBar from '../../Components/MainUserComponents/AnimatedTableSearchBar';
import { useFocusEffect } from '@react-navigation/native';

const TableScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);


  // useEffect(() => {
  //   const backAction = () => {
  //     BackHandler.exitApp();
  //     return true;
  //   };

  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  //   return () => backHandler.remove();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = async () => {
        try {
          const loginInfo = await AsyncStorage.getItem('loginInfo');
          const { token } = loginInfo ? JSON.parse(loginInfo) : {};

          if (token) {
            BackHandler.exitApp();
            return true; // Prevent default back action
          } else {
            return false; // Allow default back action (e.g., go to login)
          }
        } catch (error) {
          console.error('Error reading token:', error);
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Image style={styles.img} source={require('../../assets/images/headerLogo.png')} />
          <View>
            <Text style={styles.text1}>Secure</Text>
            <Text style={styles.text1}>Web App</Text>
          </View>
        </View>

        <View style={styles.iconContainer}>

          <AnimatedTableSearchBar />
          <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} >
            <View style={[
              styles.iconContainerCircle,
              modalVisible && {
                justifyContent: 'center',
                alignItems: 'center',
                width: responsiveWidth(8),
                height: responsiveWidth(8),
                borderRadius: responsiveWidth(4),
                elevation: 1,
                backgroundColor: '#FFF',
                elevation: 4,
              }
            ]}>
              <ThreeDotsSvg width={responsiveFontSize(2.5)} height={responsiveFontSize(2.5)} />
            </View>
          </TouchableOpacity>

        </View>
      </View>


      <View style={styles.mainContainer}>
        <View style={styles.mainContainerTop}>
          <TableIcon fillColor="#4D8733" strokeColor="white" width={responsiveFontSize(3)}
            height={responsiveFontSize(3)} />
          <Text style={styles.tableHeadingText}>List of Tables</Text>
        </View>
        <TableData />

      </View>
      {
        modalVisible && (
          <UserThreeDotsModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />
        )
      }

    </SafeAreaView>
  );
};

export default TableScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0FFD3',
  },
  header: {
    height: responsiveHeight(10),
    backgroundColor: '#E0FFD3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    gap: 15,
  },
  leftHeader: {
    flexDirection: 'row',
    gap: responsiveWidth(2),
    alignItems: 'center',
  },
  text1: {
    fontSize: responsiveFontSize(2),
    color: '#222327',
    lineHeight: responsiveFontSize(2.5),
    fontFamily: 'Poppins-SemiBold',
  },
  img: {
    width: responsiveWidth(9),
    height: responsiveWidth(9),
    resizeMode: 'contain',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(3),
  },
  iconContainerCircle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  mainContainerTop: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 15
  },
  tableHeadingText: {
    color: 'black',
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins-Medium',
    marginTop: 3,
  },
});