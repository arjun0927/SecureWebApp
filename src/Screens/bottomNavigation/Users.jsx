import React, { useState, useEffect } from 'react';
import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	BackHandler,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
} from 'react-native';
import ThreeDotsSvg from '../../assets/Svgs/ThreeDotsSvg';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import TableIcon from '../../assets/Svgs/TableIcon';
import TableData from './TableData';
import UserThreeDotsModal from '../../Components/MainUserComponents/UserThreeDotsModal';
import AnimatedTableSearchBar from '../../Components/MainUserComponents/AnimatedTableSearchBar';
import AddUsersSvg from '../../assets/Svgs/AddUsersSvg';
import UserData from './UserData';
import AnimatedUsersSearchBar from '../../Components/AnimatedUsersSearchBar';

const Users = ({ navigation }) => {
	const [modalVisible, setModalVisible] = useState(false);

	// useEffect(() => {
	// 	const backAction = () => {
	// 		if (navigation.isFocused()) {
	// 			BackHandler.exitApp();
	// 			return true;
	// 		} else {
	// 			navigation.goBack();
	// 			return true;
	// 		}
	// 	};

	// 	const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

	// 	return () => backHandler.remove();
	// }, []);

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

					<AnimatedUsersSearchBar/>
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
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
						<TableIcon fillColor="#4D8733" strokeColor="white" width={responsiveFontSize(3)}
							height={responsiveFontSize(3)} />
						<Text style={styles.tableHeadingText}>List of Tables</Text>
					</View>
					<TouchableOpacity
						onPress={() => navigation.navigate('AddNewUsers')}
						activeOpacity={0.7}
					>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
							<AddUsersSvg
								width={responsiveFontSize(3)}
								height={responsiveFontSize(3)}
							/>
							<Text style={styles.tableHeadingText2}>Add New User</Text>
						</View>
					</TouchableOpacity>
				</View>
				<UserData />
				{
					modalVisible && (
						<UserThreeDotsModal
							visible={modalVisible}
							onClose={() => setModalVisible(false)}
						/>
					)
				}
			</View>

		</SafeAreaView>
	);
};

export default Users;

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
		paddingHorizontal: 20,
		gap: 15,
	},
	leftHeader: {
		flexDirection: 'row', // Left header with logo and text
		gap: responsiveWidth(2),
		alignItems: 'center', // Aligning the content vertically in the center
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
		gap: 15,
	},
	iconContainerCircle: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	keyboardAvoidingContainer: {
		flex: 1,
	},
	mainContainer: {
		flex: 1,
		backgroundColor: '#FFF',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	mainContainerTop: {
		flexDirection: 'row',
		gap: 5,
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal:20,
		paddingTop:15
	},
	tableHeadingText: {
		color: 'black',
		fontSize: responsiveFontSize(2),
		fontFamily: 'Poppins-Medium',
		marginTop:3,
	},
	tableHeadingText2: {
		color: 'black',
		fontSize: responsiveFontSize(2),
		fontFamily: 'Poppins-Medium',
	},
});




