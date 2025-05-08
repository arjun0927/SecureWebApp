import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';

const ImageModal = ({ visible, onClose, imageUri }) => {
	const [error, setError] = useState('');

	const getValidImageUri = (uri) => {
		if (!uri) return null;

		if (uri.includes("drive.google.com")) {
			const fileId = uri.match(/d\/([^/]+)/)?.[1];

			if (fileId) {
				return `https://drive.google.com/thumbnail?id=${fileId}`;
			}
		}

		return uri;
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<TouchableOpacity style={styles.closeButtonContainer} onPress={onClose}>
					<AntDesign name="close" size={responsiveFontSize(4)} color="white" />
				</TouchableOpacity>
				<View style={styles.modalView}>
					{imageUri ? (
						<View style={styles.imageContainer}>
							{error ? (
								<Text style={styles.errorText}>Failed to load image</Text>
							) : (
								<Image
									source={{ uri: getValidImageUri(imageUri) }}
									style={styles.image}
									resizeMode="cover"
									onError={() => setError('Failed to load image')}
								/>
							)}
						</View>
					) : (
						<Text style={styles.errorText}>No Image URL found</Text>
					)}
				</View>

			</View>
		</Modal>
	);
};

export default ImageModal;

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	modalView: {
		width: '90%',
		height: '60%',
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 10,
		position: 'relative',
	},

	closeButtonContainer: {
		alignSelf: 'flex-end',
		marginVertical: 10,
		marginRight: 20,
		// zIndex: 10,
	},


	imageContainer: {
		flex: 1,
		borderRadius: 10,
		overflow: 'hidden',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	errorText: {
		color: 'red',
		textAlign: 'center',
		marginTop: '50%',
		fontSize: responsiveFontSize(3),
	},
});
