import { Image, StyleSheet, Text, TouchableOpacity, View, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';
import SearchSvg from '../../assets/Svgs/SearchSvg';
import ThreeDotsSvg from '../../assets/Svgs/ThreeDotsSvg';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import TableIcon from '../../assets/Svgs/TableIcon';
import UserTables from '../../Components/MainUserComponents/UserTables';
import AnimatedTableSearchBar from '../../Components/MainUserComponents/AnimatedTableSearchBar';
import UserThreeDotsModal from '../../Components/MainUserComponents/UserThreeDotsModal';


const UserMainScreen = ({ navigation }) => {
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
			{/* Header */}
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
							}
						]}>
							<ThreeDotsSvg width={responsiveFontSize(2.5)} height={responsiveFontSize(2.5)} />
						</View>
					</TouchableOpacity>

				</View>
			</View>

			{/* Main Container */}
			<View style={styles.mainContainer}>
				<View style={styles.mainContainerTop}>
					<TableIcon fillColor="#4D8733" strokeColor="white" width={responsiveFontSize(2.1)} height={responsiveFontSize(2.1)} />
					<Text style={styles.tableHeadingText}>List of Tables</Text>
				</View>
				<UserTables />
			</View>

			{
				modalVisible && (
					<UserThreeDotsModal
						visible={modalVisible}
						onClose={() => setModalVisible(false)}
					/>
				)
			}
		</View>
	);
};

export default UserMainScreen;

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
		width:'100%',
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
		justifyContent: 'flex-start',
		paddingHorizontal:20,
		paddingTop:15
	  },
	  tableHeadingText: {
			color: 'black',
			fontSize: responsiveFontSize(2),
			fontFamily: 'Poppins-Medium',
			marginTop:3,
		},
});
