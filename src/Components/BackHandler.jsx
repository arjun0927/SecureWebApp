import { BackHandler } from 'react-native';
import { useEffect } from 'react';

const BackHandler = () => {
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);
};

export default BackHandler;