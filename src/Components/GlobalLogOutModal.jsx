import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';  // Only use Paper components where needed
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NoDataSvg2 from '../assets/Svgs/NoDataSvg2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useGlobalContext } from '../Context/GlobalContext';

const GlobalLogOutModal = ({ modalVisible, setModalVisible, handleCancel,onClose }) => {
	const navigation = useNavigation();
	
	const { showToast } = useGlobalContext();
	const hideModal = () => setModalVisible(false);

	const logOut = async () => {
			try {
				await AsyncStorage.removeItem('loginInfo');
				await AsyncStorage.removeItem('loginUser');
				await AsyncStorage.removeItem('userId');
				navigation.replace('UserPermission');
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
							<NoDataSvg2 />
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
		padding: 25,
		marginHorizontal: 40,
		borderRadius: 30,
		width: responsiveWidth(90),
		elevation: 10,
	},
	backdrop: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.2)',  // Dim background effect
	},
	iconBox: {
		alignItems: 'center',
		flexDirection: 'column',
		gap: 5,
	},
	iconBoxText: {
		textAlign: 'center',
		fontSize: responsiveFontSize(2.7),
		color: '#222327',
		fontFamily: 'Poppins',
		fontWeight: '400',
	},
	modalMidTextContainer: {
		width: responsiveWidth(55),
		alignSelf: 'center',
		marginTop: 15,
	},
	modalMidText: {
		fontSize: responsiveFontSize(1.7),
		textAlign: 'center',
		color: '#767A8D',
		fontWeight: '400',
	},
	btnContainer: {
		marginTop: 25,
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
		paddingVertical: 7,
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnContainer1Text: {
		color: '#767A8D',
		textAlign: 'center',
		fontSize: 16,
	},
	btnContainer2: {
		width: responsiveWidth(30),
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 7,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#4D8733',
	},
	btnContainer2Text: {
		color: 'white',
		fontSize: 17,
	}
});
