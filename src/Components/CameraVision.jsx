import React, { useEffect, useRef, useState } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	Modal,
	Image,
	Text,
} from "react-native";
import {
	Camera,
	useCameraDevice,
} from "react-native-vision-camera";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ActivityIndicator } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

function CameraVision() {
	const [permission, setPermission] = useState(false);
	const [cameraType, setCameraType] = useState("back");
	const [capturedImage, setCapturedImage] = useState(null);
	const [previewVisible, setPreviewVisible] = useState(false);
	const route = useRoute();
	const navigation = useNavigation()


	const { field, setImageUris, onImageSelected } = route.params


	const camera = useRef(null);
	const device = useCameraDevice(cameraType);

	useEffect(() => {
		(async () => {
			const cameraPermission = await Camera.requestCameraPermission();
			const audioPermission = await Camera.requestMicrophonePermission();
			setPermission(
				cameraPermission === "granted" && audioPermission === "granted"
			);
		})();
	}, []);

	const cameraTypeChange = () => {
		setCameraType((prev) => (prev === "back" ? "front" : "back"));
	};

	const takePhoto = async () => {
		if (camera.current) {
			const photo = await camera.current.takePhoto();
			setCapturedImage("file://" + photo.path);
			setPreviewVisible(true);
		}
	};

	const handleDelete = () => {
		setCapturedImage(null);
		setPreviewVisible(false);
	};

	const handleSelect = () => {
		// console.log("Selected image: ", capturedImage);
		onImageSelected(capturedImage);
		setImageUris(prev => ({
			...prev,
			[field]: capturedImage
		}));
		setPreviewVisible(false);
		navigation.goBack()
		
	};

	if (device == null || !permission) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator color="green" size={"large"} />
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			<Camera
				ref={camera}
				style={StyleSheet.absoluteFill}
				device={device}
				isActive={true}
				photo={true}
			/>

			{/* Shutter Button */}
			<TouchableOpacity onPress={takePhoto} style={styles.shutterButton}>
				<Icon name="camera-outline" size={32} color="#fff" />
			</TouchableOpacity>

			{/* Flip Camera */}
			<TouchableOpacity onPress={cameraTypeChange} style={styles.flipButton}>
				<Icon name="camera-reverse-outline" size={28} color="#fff" />
			</TouchableOpacity>

			{/* Captured Image Preview Modal */}
			<Modal visible={previewVisible} transparent animationType="fade">
				<View style={styles.modalContainer}>
					<View style={styles.imageContainer}>
						<Image
							source={{ uri: capturedImage }}
							style={styles.capturedImage}
							resizeMode="cover"
						/>

						<View style={styles.buttonRow}>
							<TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
								<MaterialIcons name="delete-outline" color={'red'} size={23} />
							</TouchableOpacity>
							<TouchableOpacity onPress={handleSelect} style={styles.actionButton}>
								<AntDesign name={'check'} color={'green'} size={23} />
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	shutterButton: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderWidth: 3,
		borderColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		bottom: 30,
		left: width * 0.415,
	},
	flipButton: {
		position: "absolute",
		top: 20,
		right: 20,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	imageContainer: {
		width: width * 0.8,
		height: height * 0.6,
		backgroundColor: "#000",
		borderRadius: 12,
		borderWidth: 3,
		borderColor: "#fff",
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
	},
	capturedImage: {
		width: "100%",
		height: "85%",
	},
	buttonRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 10,
		backgroundColor: "#111",
	},
	actionButton: {
		paddingVertical: 8,
		paddingHorizontal: 20,
		backgroundColor: "#fff",
		borderRadius: 8,
	},
	buttonText: {
		color: "#000",
		fontWeight: "bold",
	},
});

export default CameraVision;
