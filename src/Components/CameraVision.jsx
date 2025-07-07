import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { Camera, useCameraDevices, CameraPermissionStatus, useCameraPermission, useCameraDevice } from "react-native-vision-camera";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";

function CameraVision() {
	const [permission, setPermission] = useState();
	// const devices = useCameraDevices();
	// const device = devices.back();
	const device = useCameraDevice('back')
  const { hasPermission } = useCameraPermission()
	// console.log('device ',device)
	const navigation = useNavigation();
	const route = useRoute();
	const field = route.params?.field;

	// useEffect(() => {
	// 	(async () => {
	// 		const status = await Camera.requestCameraPermission();
	// 		setPermission(status);
	// 	})();
	// }, []);

	// if (permission !== "authorized") {
	// 	return <View><Button title="Request Camera Permission" onPress={async () => {
	// 		const status = await Camera.requestCameraPermission();
	// 		setPermission(status);
	// 	}} /></View>;
	// }
	const checkCameraPermission = async() => {
		const cameraPermission = await Camera.requestCameraPermission();
		const audioPermission = await Camera.requestMicrophonePermission();
		console.log('camera permissions : ',cameraPermission , audioPermission)
	}
	useEffect(()=>{
		checkCameraPermission();
	},[])

	if (device == null) return (
		<View style={{flex:1, justifyContent:'center',alignItems: 'center'}} >
			<ActivityIndicator color="green" size={'large'} />
		</View>
	);

	// // Implement your photo capture logic here
	// const takePhoto = async () => {
	// 	// ... take photo logic, get photoUri
	// 	// navigation.navigate('UserAddNewData', { photoUri, field });
	// 	// or use navigation.goBack() and listen for params in UserAddNewData
	// };

	return (
		<View style={{ flex: 1 }}>
			<Camera
				style={StyleSheet.absoluteFill}
				device={device}
				isActive={true}
			/>
			{/* <Button title="Take Photo" onPress={takePhoto} /> */}
			{/* <Text>camera</Text> */}
		</View>
	);
}

export default CameraVision;