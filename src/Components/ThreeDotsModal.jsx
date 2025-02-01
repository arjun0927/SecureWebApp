import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Modal,
	TouchableOpacity,
	TouchableWithoutFeedback,
} from 'react-native';
import {
	responsiveHeight,
	responsiveFontSize,
} from 'react-native-responsive-dimensions';
import UserIconSvg from '../assets/Svgs/UserIconSvg';
import NotificationSvg from '../assets/Svgs/NotificationSvg';
import LogOutSvg from '../assets/Svgs/LogOutSvg';
import { useNavigation } from '@react-navigation/native';

const ThreeDotsModal = ({ visible, onClose }) => {
	const navigation = useNavigation()
	const handleRaiseTicket = () => {
		navigation.navigate('RaiseTicket');
		onClose();
	};

	const handleWhatsNew = () => {
		navigation.navigate('Notification');
		onClose();
	};

	const handleLogout = () => {
		onClose();
	};
	return (
		<Modal
			visible={visible}
			transparent
			animationType='fade'
			onRequestClose={onClose}
		>
			{/* Backdrop */}
			<TouchableWithoutFeedback onPress={onClose}>
				<View style={styles.backdrop}>
					{/* Modal Content */}
					<TouchableWithoutFeedback>
						<View style={styles.modalContent}>
							<View style={styles.optionsContainer}>
								<TouchableOpacity style={styles.option} onPress={handleRaiseTicket}>
									<UserIconSvg />
									<Text style={styles.optionText}>Raise Tickets</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.option} onPress={handleWhatsNew}>
									<NotificationSvg />
									<Text style={styles.optionText}>What's New</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.option} onPress={handleLogout}>
									<LogOutSvg />
									<Text style={styles.optionText}>Log Out</Text>
								</TouchableOpacity>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

export default ThreeDotsModal;

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		alignItems: 'flex-end',
		marginTop: responsiveHeight(9.4),
	},
	modalContent: {
		borderWidth: 1,
		borderColor: '#E1EADE',
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		padding: 15,
		elevation: 10,
		width: '55%',
	},
	optionsContainer: {
		gap: 20,
		// marginVertical:10,
	},
	option: {
		flexDirection: 'row',
		gap: 10,
		alignItems: 'center',
	},
	optionText: {
		fontSize: responsiveFontSize(2),
		color: 'black',
		fontFamily: 'Poppins',
		fontWeight: '400',
	},
});
