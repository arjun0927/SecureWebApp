import React, { useState } from 'react';
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
import UserIconSvg from '../../assets/Svgs/UserIconSvg';
import NotificationSvg from '../../assets/Svgs/NotificationSvg';
import LogOutSvg from '../../assets/Svgs/LogOutSvg';
import { useNavigation } from '@react-navigation/native';
import GlobalLogOutModal from '../GlobalLogOutModal';

const UserThreeDotsModal = ({ visible, onClose }) => {
	const [modalVisible, setModalVisible] = useState(false);
	const navigation = useNavigation();

	const handleRaiseTicket = () => {
		navigation.navigate('UserRaiseTicket');
		onClose();
	};

	const handleWhatsNew = () => {
		navigation.navigate('Notification');
		onClose();
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<TouchableWithoutFeedback onPress={onClose}>
				<View style={styles.backdrop}>
					{/* Modal Content */}
					<TouchableWithoutFeedback>
						<View style={styles.modalContent}>
							<View style={styles.optionsContainer}>
								<TouchableOpacity style={styles.option} onPress={handleRaiseTicket}>
									<UserIconSvg />
									<Text style={styles.optionText}>Raise Ticket</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.option} onPress={handleWhatsNew}>
									<NotificationSvg />
									<Text style={styles.optionText}>What's New</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.option}
									onPress={() => setModalVisible(true)}
								>
									<LogOutSvg />
									<Text style={styles.optionText}>Log Out</Text>
								</TouchableOpacity>
							</View>
						</View>
					</TouchableWithoutFeedback>
					{modalVisible && (
						<GlobalLogOutModal
							modalVisible={modalVisible}
							setModalVisible={setModalVisible}
							handleCancel={() => setModalVisible(false)}
							onClose={onClose}
						/>
					)}
				</View>
			</TouchableWithoutFeedback>
		</Modal>

	);
};

export default UserThreeDotsModal;

const styles = StyleSheet.create({
	backdrop: {
	  flex: 1,
	  backgroundColor: 'rgba(0, 0, 0, 0.1)',
	  alignItems: 'flex-end', // Center the modal horizontally
	  paddingTop:'21%',
	  paddingRight:'5%'
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
  
