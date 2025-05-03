import axios from "axios";

const checkValidLogin = async({email, password , otp}) => {

	const apiUrl = `https://secure.ceoitbox.com/api/checkValidlogin` ;

	const {data} = await axios.post(apiUrl, {
		email: email,
		password:password,
		otp:otp,
	});
	// console.log("data", data);

	return data

}

export default checkValidLogin;

