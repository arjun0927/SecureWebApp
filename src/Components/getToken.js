
import AsyncStorage from '@react-native-async-storage/async-storage'

const getToken = async() => {
  const data = await AsyncStorage.getItem('loginInfo')
  const parsedData = JSON.parse(data);
  const token = parsedData?.token;
  if (!token) {
	return null
  }
  return token
}

export default getToken