const EmailRegex = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email) ? true : false;
  };
  
  export default EmailRegex;
  