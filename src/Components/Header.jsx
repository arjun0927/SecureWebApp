import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import HeaderSvg from '../assets/Svgs/HeaderSvg'
import { responsiveFontSize } from 'react-native-responsive-dimensions'

const Header = () => {
	return (
		<View>
			<View style={styles.header}>
				<HeaderSvg width={responsiveFontSize(4)} height={responsiveFontSize(4)} />
			</View>
			<View style={styles.textContainer}>
				<Text style={styles.text1}>WELCOME TO</Text>
				<Text style={styles.text2}>Secure WebApp</Text>
			</View>
		</View>
	)
}

export default Header

const styles = StyleSheet.create({
	header: {
		alignSelf: 'flex-end',
		marginTop: 20,
		marginHorizontal: 20,
	},
	textContainer: {
		marginHorizontal:20,
	},
	text1: {
		fontSize: responsiveFontSize(3.5),
		lineHeight: responsiveFontSize(4),
		color: '#222327',
		fontFamily: 'Poppins-SemiBold',
	},
	text2: {
		fontSize: responsiveFontSize(2.1),
		lineHeight: responsiveFontSize(2.6),
		color: '#61A443',
		fontFamily: 'Montserrat-Medium',
	},

})