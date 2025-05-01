import React, { useState, useCallback, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import ThreeDotsSvg from '../../assets/Svgs/ThreeDotsSvg';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import TableIcon from '../../assets/Svgs/TableIcon';
import TableData from './TableData';
import UserThreeDotsModal from '../../Components/MainUserComponents/UserThreeDotsModal';
import AnimatedTableSearchBar from '../../Components/MainUserComponents/AnimatedTableSearchBar';

const TableScreen = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
	const backAction = () => {
		if (navigation.isFocused()) {
			// Allow back action to exit only if on the Home screen
			BackHandler.exitApp();
			return true;
		} else {
			navigation.goBack();
			return true;
		}
	};

	const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

	return () => backHandler.remove();
}, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Image
            style={styles.img}
            source={require('../../assets/images/headerLogo.png')}
          />
          <View>
            <Text style={styles.text1}>Secure</Text>
            <Text style={styles.text1}>Web App</Text>
          </View>
        </View>

        {/* Row for icons */}
        <View style={styles.iconContainer}>
          <AnimatedTableSearchBar />
          <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
            <View
              style={[
                styles.iconContainerCircle,
                modalVisible && {
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  elevation: 4,
                  backgroundColor: '#FFF',
                },
              ]}
            >
              <ThreeDotsSvg />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Container */}
      <View style={styles.mainContainer}>
        <View style={styles.mainContainerTop}>
          <TableIcon fillColor="#4D8733" strokeColor="white" />
          <Text style={styles.tableHeadingText}>List of Tables</Text>
        </View>
        <TableData />
        {modalVisible && (
          <UserThreeDotsModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />
        )}
      </View>
    </View>
  );
};

export default TableScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0FFD3',
  },
  header: {
    height: '11%',
    backgroundColor: '#E0FFD3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  text1: {
    fontSize: responsiveFontSize(2.3),
    color: '#222327',
    fontWeight: 'bold',
    lineHeight: 22.05,
  },
  img: {
    width: 40,
    height: 40,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainerCircle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mainContainer: {
    height:'89%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  mainContainerTop: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  tableHeadingText: {
    color: 'black',
    fontSize: responsiveFontSize(2.4),
    fontWeight: '500',
  },
});
