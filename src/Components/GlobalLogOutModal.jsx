import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';  // Only use Paper components where needed
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import NoDataSvg2 from '../assets/Svgs/NoDataSvg2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useGlobalContext } from '../Context/GlobalContext';

const GlobalLogOutModal = ({ modalVisible, setModalVisible, handleCancel,onClose }) => {
	const navigation = useNavigation();
	
	const { showToast, data, setData , users, setUsers } = useGlobalContext();
	const hideModal = () => setModalVisible(false);

	const logOut = async () => {
			try {
				setData([]);
				setUsers([]);
				await AsyncStorage.removeItem('loginInfo');
				await AsyncStorage.removeItem('loginUser');
				await AsyncStorage.removeItem('userId');
				navigation.replace('UserPermission');
				// console.log('table data : ',data)
				// console.log('userData : ',users)
				showToast({
					type: 'SUCCESS',
					message: 'Logout successfully',
				});
			} catch (error) {
				console.error('Logout error:', error);
			}
		};
	
		const handleLogout = async () => {
			await logOut();
			onClose();
		};

	return (
		<View style={styles.container}>
			<Modal
				visible={modalVisible}
				transparent={true}
				animationType="fade"
				onRequestClose={hideModal}
			>
				<View style={styles.backdrop}>
					<View style={styles.modalContent}>
						<View style={styles.iconBox}>
							<NoDataSvg2 width={responsiveFontSize(12)} height={responsiveWidth(12)}/>
							<Text style={styles.iconBoxText}>
								Are You Sure?
							</Text>
						</View>
						<View style={styles.modalMidTextContainer}>
							<Text style={styles.modalMidText}>Are you sure you that you really want to Logout?</Text>
						</View>
						<View style={styles.btnContainer}>
							<TouchableOpacity onPress={handleCancel}>
								<View style={styles.btnContainer1}>
									<Text style={styles.btnContainer1Text}>Cancel</Text>
								</View>
							</TouchableOpacity>
							<TouchableOpacity onPress={handleLogout}>
								<View style={styles.btnContainer2}>
									<Text style={styles.btnContainer2Text}>Yes</Text>
								</View>
							</TouchableOpacity>

						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default GlobalLogOutModal;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9f9f9',
	},

	modalContent: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 30,
		width: responsiveWidth(90),
		elevation: 10,
	},
	backdrop: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.2)',  
	},
	iconBox: {
		alignItems: 'center',
		flexDirection: 'column',
		gap: 5,
	},
	iconBoxText: {
		textAlign: 'center',
		fontSize: responsiveFontSize(2.5),
		color: '#222327',
		fontFamily: 'Poppins-Medium',
	},
	modalMidTextContainer: {
		width: responsiveWidth(60),
		alignSelf: 'center',
		marginVertical:10,
	},
	modalMidText: {
		fontSize: responsiveFontSize(1.7),
		textAlign: 'center',
		fontFamily:'Poppins-Regular',
		color: '#767A8D',
	},
	btnContainer: {
		alignSelf: 'center',
		flexDirection: 'row',
		gap: 20,
		marginBottom: 10,
	},
	btnContainer1: {
		width: responsiveWidth(25),
		borderWidth: 1,
		borderColor: '#767A8D',
		borderRadius: 10,
		paddingHorizontal: 10,
		height: responsiveHeight(4.49),
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnContainer1Text: {
		color: '#767A8D',
		fontSize: responsiveFontSize(1.8),
		fontFamily: 'Poppins-Medium',
	},
	btnContainer2: {
		width: responsiveWidth(30),
		borderRadius: 10,
		paddingHorizontal: 10,
		height: responsiveHeight(4.5),
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#4D8733',
	},
	btnContainer2Text: {
		color: 'white',
		fontFamily: 'Poppins-Medium',
		fontSize: responsiveFontSize(1.8),
	}
});
