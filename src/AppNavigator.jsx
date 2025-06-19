import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import Splace from './Screens/Splace';
import OnboardScreen from './Screens/OnboardScreen';
import UserPermission from './Screens/UserPermission';
import AdminLogin from './Screens/AdminLogin';
import UserLogin from './Screens/UserLogin';
import BottomNavigation from './Screens/bottomNavigation/BottomNavigation';
import AddNewUsers from './Components/AddNewUsers';
import EditUser from './Components/EditUser';
import DuplicateUsers from './Components/DuplicateUsers';
import Notification from './Components/Notification';
import AllTableData from './Components/AllTableInfo/AllTableData';
import TablesAddNewData from './Components/AllTableInfo/TablesAddNewData';
import EditTables from './Components/AllTableInfo/EditTables';
import MainUserLogin from './Screens/MainUserLogin.jsx/MainUserLogin';
import UserMainScreen from './Screens/MainUserLogin.jsx/UserMainScreen';
import AllUserData from './Components/MainUserComponents/AllUserData';
import UserAddNewData from './Components/MainUserComponents/UserAddNewData';
import MainEditUser from './Components/MainUserComponents/MainEditUser';
import MainUserOtpScreen from './Screens/MainUserLogin.jsx/MainUserOtpScreen';
import UserRaiseTicket from './Components/MainUserComponents/UserRaiseTicket';
import UserThreeDotsModal from './Components/MainUserComponents/UserThreeDotsModal';
import NewNotification from './Components/NewNotification';
import VideoPlayerScreen from './Components/VideoPlayerScreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {

	const animationType = 'default';
	
	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name='SplaceScreen' component={Splace} options={{ headerShown: false, animation:animationType }} />
				<Stack.Screen name='OnboardScreen' component={OnboardScreen} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='UserPermission' component={UserPermission} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='AdminLogin' component={AdminLogin} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='UserLogin' component={UserLogin} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='BottomNavigation' component={BottomNavigation} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='AddNewUsers' component={AddNewUsers} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='EditUser' component={EditUser} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='NewNotification' component={NewNotification} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='AllTableData' component={AllTableData} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='TablesAddNewData' component={TablesAddNewData} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='EditTables' component={EditTables} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='MainUserLogin' component={MainUserLogin} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='UserMainScreen' component={UserMainScreen} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='AllUserData' component={AllUserData} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='UserAddNewData' component={UserAddNewData} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='MainEditUser' component={MainEditUser} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='MainUserOtpScreen' component={MainUserOtpScreen} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='UserRaiseTicket' component={UserRaiseTicket} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='UserThreeDotsModal' component={UserThreeDotsModal} options={{ headerShown: false, animation: animationType }} />
				<Stack.Screen name='VideoPlayerScreen' component={VideoPlayerScreen} options={{ headerShown: false, animation: animationType }} />
			</Stack.Navigator>
		</NavigationContainer>
	)
}

export default AppNavigator