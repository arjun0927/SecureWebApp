import {
	StyleSheet,
	Text,
	TextInput,
	View,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	BackHandler,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize } from 'react-native-responsive-dimensions';


const RaiseTicket = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [issueType, setIssueType] = useState('');

	const navigation = useNavigation();

	const handleSave = () => {
		console.log('Saved');
	};

	const isFormValid = name && email;

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity
						style={{ flexDirection: 'row' }}
						onPress={() => navigation.goBack()}
					>
						<Feather name="chevron-left" size={24} color="black" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Raise Tickets</Text>
				</View>

				<ScrollView contentContainerStyle={styles.form}>
					<View style={styles.inputGroup}>
						<Text style={styles.label1}>Customer Name*</Text>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
						/>
					</View>
					<View style={styles.inputGroup}>
						<Text style={styles.label1}>Customer Email*</Text>
						<TextInput
							style={styles.input}
							value={email}
							onChangeText={setEmail}
						/>
					</View>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Phone</Text>
						<TextInput
							style={styles.input}
							value={password}
							onChangeText={setPassword}

						/>
					</View>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Issue Statement</Text>
						<TextInput
							style={styles.input}
							value={issueType}
							onChangeText={setIssueType}
						/>
					</View>
					{/* <View>
						<TextInput
							label="Email"
							value={email}
							onChangeText={text => setEmail(text)}
						/>
					</View> */}
					<View style={styles.uploadProblemContainer}>
						<View>
							<Text style={styles.uploadProblemContainerText}>Upload Problem Screenshot</Text>
						</View>
						<View>
							<Feather name={'upload'} size={23} color={'#578356'} />
						</View>
					</View>
					<View style={styles.accordionContainer}>
						<TouchableOpacity>
							<View style={styles.accordionHeader}>
								<Text style={styles.accordionHeaderText}>
									Priority Level
								</Text>

								<Feather
									name="chevron-down"
									color="black"
									size={23}
									style={{ marginRight: 5 }}
								/>
							</View>
						</TouchableOpacity>
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
						<Text style={styles.saveBtnText}>Submit</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
};

export default RaiseTicket;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 20,
		marginBottom:10,
		marginHorizontal:10,
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
	uploadProblemContainer: {
		// backgroundColor: 'red',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 35,
		paddingVertical: 15,
		borderWidth: 1,
		borderColor: '#767A8D',
		borderRadius: 10,
		marginTop:10,
	},
	uploadProblemContainerText: {
		color: '#767A8D',
		fontSize: responsiveFontSize(2),
		fontWeight: '400',
		fontFamily: 'Poppins',
	},
	accordionContainer: {
		marginBottom: 15,
	},
	accordionHeader: {
		paddingHorizontal: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop:25,
		borderColor: '#B9BDCF',
		borderBottomWidth: 1,
		paddingBottom:20,
	},
	accordionHeaderText: {
		fontSize: responsiveFontSize(2),
		fontWeight: '400',
	},
	accordionContent: {
		paddingTop: 10,
		borderWidth: 0.5,
		borderColor: '#DEE0EA',
		marginTop: 10,
		borderRadius: 15,
		paddingHorizontal: 10,
	},
	accordionItem: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderColor: '#EEEFF6',
	},
	accordionItemText: {
		fontSize: 16,
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
		letterSpacing:0.5,
	},
});