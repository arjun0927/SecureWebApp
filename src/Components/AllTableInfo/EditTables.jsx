import {
	StyleSheet,
	Text,
	TextInput,
	View,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import FrameSvg from '../../assets/Svgs/FrameSvg';
// import { TextInput } from 'react-native-paper';

const EditTables = () => {
	const [name, setName] = useState('Rahul Shinde');
	const [email, setEmail] = useState('rahul12@gmail.com');
	const [mobileNo, setMobileNo] = useState('19823-98236');
	const [photo, setPhoto] = useState('drive.comasjdgahgjww');
	const [file, setFile] = useState('drive.comasjdgahgjww');

	const navigation = useNavigation();



	const handleSave = () => {
		console.log('Saved');
	};

	const isFormValid = name && email;

	return (
		
			<View style={styles.container}>
				<View style={styles.header}>
					<View style={{ flexDirection: 'row' }}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => navigation.goBack()}
						>
							<Text style={styles.usersText}>Tables</Text>
							<Feather name="chevron-left" size={24} color="black" />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Sr.No 123</Text>
					</View>
					<View style={{ marginRight: 10, height: 32, width: 32, backgroundColor: '#C6FF96', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
						<FrameSvg />
					</View>
				</View>

				<ScrollView contentContainerStyle={styles.form}>
					<View style={styles.inputGroup}>
						<Text style={styles.label1}>Name</Text>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
						/>
					</View>
					<View style={styles.inputGroup}>
						<Text style={styles.label1}>Email</Text>
						<TextInput
							style={styles.input}
							value={email}
							onChangeText={setEmail}
						/>
					</View>
					<View style={styles.inputGroup}>
						<Text style={styles.label1}>Mobile No</Text>
						<TextInput
							style={styles.input}
							value={mobileNo}
							onChangeText={setMobileNo}

						/>
					</View>
					<View style={styles.inputGroup}>
						<Text style={styles.label1}>Photo</Text>
						<TextInput
							style={styles.input}
							value={photo}
							onChangeText={setPhoto}
						/>
					</View>
					<View style={styles.inputGroup}>
						<Text style={styles.label1}>File</Text>
						<TextInput
							style={styles.input}
							value={file}
							onChangeText={setFile}
						/>
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<TouchableOpacity
						onPress={isFormValid ? handleSave : null}
						disabled={!isFormValid}
						style={[
							styles.saveBtn,
							{ opacity: isFormValid ? 1 : 0.5 },
						]}
					>
						<Text style={styles.saveBtnText}>Save</Text>
					</TouchableOpacity>
				</View>
			</View>
	);
};

export default EditTables;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 20,
		marginBottom: 10,
		marginHorizontal: 10,
	},
	usersText: {
		color: '#848486',
		fontSize: responsiveFontSize(2),
		fontWeight: '400',
	},
	headerTitle: {
		color: '#222327',
		fontSize: responsiveFontSize(2.3),
		fontWeight: '400',
		marginLeft: 5,
	},
	form: {
		paddingHorizontal: 20,
		backgroundColor: '#FFF',
		borderRadius: 15,
		padding: 15,
		marginHorizontal: 20,
		marginVertical: 10,
	},
	inputGroup: {
		marginBottom: 15,
	},
	label: {
		color: '#222327',
		fontSize: responsiveFontSize(2),
		fontWeight: '400',
	},
	label1: {
		color: '#767A8D',
		fontSize: responsiveFontSize(1.6),
		fontWeight: '400',
	},
	input: {
		height: 40,
		borderColor: '#B9BDCF',
		borderBottomWidth: 1,
		paddingLeft: 10,
		color: 'black',
		fontSize: responsiveFontSize(2.1),
	},
	noBorder: {
		borderWidth: 0,
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 20,
		backgroundColor: '#F4FAF4',
	},
	saveBtn: {
		backgroundColor: '#4D8733',
		paddingVertical: 15,
		width: '40%',
		alignSelf: 'center',
		borderRadius: 10,
		alignItems: 'center',
	},
	saveBtnText: {
		color: '#FCFDFF',
		fontSize: responsiveFontSize(2.4),
		fontWeight: '600',
		letterSpacing: 0.5,
	},
});
