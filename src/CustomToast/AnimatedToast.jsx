import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Dimensions, View, Image } from 'react-native';
import Animated, {
	useSharedValue,
	withTiming,
	useAnimatedStyle,
	Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const AnimatedToast = ({ message, duration = 3000, type = 'INFO' }) => {
	const translateY = useSharedValue(70); // Initial value to match toast height
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(true); // Set toast visible initially
	}, []);

	useEffect(() => {
		if (visible) {
			// Animate toast in
			translateY.value = withTiming(-70, {
				duration: 200,
				easing: Easing.out(Easing.ease),
			});

			// Animate toast out after duration
			setTimeout(() => {
				translateY.value = withTiming(70, {
					duration: 300,
					easing: Easing.in(Easing.ease),
				});
				setVisible(false);
			}, duration);
		}
	}, [visible]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: translateY.value }],
		};
	});

	const getColor = () => {
		switch (type) {
			case 'SUCCESS':
				return '#bcf7cc';
			case 'ERROR':
				return '#f7bcbc';
			case 'WARNING':
				return '#f7d6bc';
			default:
				return '#bcc9f7';
		}
	};

	const getIcon = () => {
		switch (type) {
			case 'SUCCESS':
				return require('../assets/images/success.png');
			case 'ERROR':
				return require('../assets/images/error.png');
			case 'WARNING':
				return require('../assets/images/warning.png');
			default:
				return require('../assets/images/info.png');
		}
	};

	return (
		<Animated.View style={[styles.toastContainer, animatedStyle]}>
			<View style={[styles.sideBar, { backgroundColor: getColor() }]} />
			<View style={[styles.circle, { backgroundColor: getColor() }]}>
				<Image source={getIcon()} style={styles.toastIcon} />
			</View>
			<Text style={styles.toastText}>{message}</Text>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	toastContainer: {
		position: 'absolute',
		bottom: 20,
		width: width - 20,
		height: 70,
		alignItems: 'center',
		backgroundColor: '#ffffff',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		zIndex: 1000,
		flexDirection: 'row',
		borderRadius: 8,
		overflow: 'hidden',
		alignSelf: 'center',
	},
	toastText: {
		color: '#000',
		textAlign: 'center',
		marginLeft: 10,
		fontSize: 16,
	},
	sideBar: {
		width: 5,
		height: '100%',
		borderRadius: 10,
	},
	circle: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginLeft: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	toastIcon: {
		width: 16,
		height: 16,
	},
});

export default AnimatedToast;
