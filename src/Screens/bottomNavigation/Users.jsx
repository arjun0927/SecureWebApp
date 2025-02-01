import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import SearchSvg from '../../assets/Svgs/SearchSvg';
import ThreeDotsSvg from '../../assets/Svgs/ThreeDotsSvg';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import TableIcon from '../../assets/Svgs/TableIcon';
import UserData from './UserData';
import AddUsersSvg from '../../assets/Svgs/AddUsersSvg';
import ThreeDotsModal from '../../Components/ThreeDotsModal';
import UserThreeDotsModal from '../../Components/MainUserComponents/UserThreeDotsModal';
import AnimatedUsersSearchBar from '../../Components/AnimatedUsersSearchBar';

const Users = ({navigation}) => {
	const [modalVisible, setModalVisible] = useState(false);

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.leftHeader}>
					<Image style={styles.img} source={require('../../assets/images/headerLogo.png')} />
					<View>
						<Text style={styles.text1}>Secure</Text>
						<Text style={styles.text1}>Web App</Text>
					</View>
				</View>

				{/* Row for icons */}
				<View style={styles.iconContainer}>
					{/* <SearchSvg /> */}
					<AnimatedUsersSearchBar/>
					<TouchableOpacity onPress={() => setModalVisible(!modalVisible)} >
						<View style={[
							styles.iconContainerCircle,
							modalVisible && {
								justifyContent: 'center',
								alignItems: 'center',
								width: 40,
								height: 40,
								borderRadius: 20,
								elevation: 1,
								backgroundColor: '#FFF', elevation: 5
							} 
						]}>
							<ThreeDotsSvg />
						</View>
					</TouchableOpacity>

				</View>
			</View>

			{/* Main Container */}
			<View style={styles.mainContainer}>
				<View style={styles.mainContainerTop}>
					<View style={styles.insideMainContainer}>
						<TableIcon fillColor="#4D8733" strokeColor="white" />
						<Text style={styles.tableHeadingText}>List of Tables</Text>
					</View>
					<TouchableOpacity onPress={()=> navigation.navigate('AddNewUsers')}>
						<View style={styles.insideMainContainer}>
							<AddUsersSvg />
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

		</View>
	);
};

export default Users;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#E0FFD3', // Overall background color
	},
	header: {
		height: '11%',
		backgroundColor: '#E0FFD3',
		flexDirection: 'row', // Row layout for header items
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	leftHeader: {
		flexDirection: 'row', // Left header with logo and text
		gap: 10,
		alignItems: 'center', // Aligning the content vertically in the center
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
		alignItems:'center',
		gap: 15,
	},
	mainContainer: {
		flex: 1,
		backgroundColor: '#FFF',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		// padding: 20,
	},
	mainContainerTop: {
		flexDirection: 'row',
		gap: 10,
		alignItems: 'center',
		justifyContent: 'space-between',
		// marginBottom: 30,
		padding:20
	},
	insideMainContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 5,
		alignItems: 'center',
	},
	tableHeadingText: {
		color: 'black',
		fontSize: responsiveFontSize(2.4),
		fontWeight: '500',
	},
	tableHeadingText2: {
		color: 'black',
		fontSize: responsiveFontSize(2),
		fontWeight: '500',
	},
});
