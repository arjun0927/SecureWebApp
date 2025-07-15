import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Modal, Portal } from "react-native-paper";
import { responsiveFontSize, responsiveWidth } from "react-native-responsive-dimensions";
import NoDataSvg2 from '../assets/Svgs/NoDataSvg2';


const AdminLoginErrorModal = ({ errorModalText, setErrorModal }) => {
	return (
		<Portal>
			<Modal
				visible={true}
				dismissable={false} 
				contentContainerStyle={styles.container}
			>
				<View style={styles.iconBox}>
				<NoDataSvg2 width={responsiveFontSize(12)} height={responsiveWidth(12)}/>
					<Text style={styles.iconBoxText}>
						Unauthorized Access
					</Text>
				</View>
				<View style={styles.modalMidTextContainer}>
					<Text style={styles.modalMidText}>
						{errorModalText}
					</Text>
				</View>
				<View style={styles.btnContainer}>

					<TouchableOpacity onPress={() => setErrorModal(false)} >
						<View style={styles.btnContainer2}>
							<Text style={styles.btnContainer2Text}>OK</Text>
						</View>
					</TouchableOpacity>
				</View>
			</Modal>
		</Portal>
	)
}


export default AdminLoginErrorModal;

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		padding: 20,
		width: responsiveWidth(90),
		alignSelf: 'center',
		borderRadius: 30,
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
		marginVertical: 15,
	},
	modalMidText: {
		fontSize: responsiveFontSize(1.9),
		textAlign: 'center',
		color: '#767A8D',
		fontFamily: 'Poppins-Regular'
	},
	btnContainer: {
		alignSelf: 'center',
		flexDirection: 'row',
		// alignSelf:'flex-end',
		// marginRight:20,
	},

	btnContainer2: {
		borderRadius: 10,
		paddingHorizontal: responsiveWidth(6),
		paddingVertical: 6,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#4D8733',
	},
	btnContainer2Text: {
		color: 'white',
		fontFamily: 'Poppins-Medium',
		fontSize: responsiveFontSize(2),
	}
});
