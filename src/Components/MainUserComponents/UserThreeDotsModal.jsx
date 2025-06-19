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
	responsiveFontSize,
	responsiveHeight,
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
		navigation.navigate('NewNotification');
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
					<TouchableWithoutFeedback>
						<View style={styles.modalContent}>
							<View style={styles.optionsContainer}>
								<TouchableOpacity style={styles.option} onPress={handleRaiseTicket}>
									<UserIconSvg width={responsiveFontSize(1.7)} height={responsiveFontSize(1.7)} />
									<Text style={styles.optionText}>Raise Ticket</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.option} onPress={handleWhatsNew}>
									<NotificationSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)}/>
									<Text style={styles.optionText}>What's New</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.option}
									onPress={() => setModalVisible(true)}
								>
									<LogOutSvg width={responsiveFontSize(1.7)} height={responsiveFontSize(1.7)} />
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
	  alignItems: 'flex-end',
	},
	modalContent: {
	  borderWidth: 1,
	  borderColor: '#E1EADE',
	  backgroundColor: '#FFFFFF',
	  borderRadius: 14,
	  padding: 15,
	  elevation: 1,
	  width: '50%',
	  position: 'absolute',
	  top:responsiveHeight(10),
	  right:10,
	},
	optionsContainer: {
	  gap: 10,
	},
	option: {
	  flexDirection: 'row',
	  gap: 10,
	  alignItems: 'center',
	},
	optionText: {
	  fontSize: responsiveFontSize(1.8),
	  color: 'black',
	  fontFamily: 'Poppins-Regular',
	},
  });
  
