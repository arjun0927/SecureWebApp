import React from 'react';
import Svg, { Path } from 'react-native-svg';

const NoDataSvg = () => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="17" height="18" viewBox="0 0 17 18" fill="none">
      <Path
        d="M8.49996 16.0788C12.412 16.0788 15.5833 12.9075 15.5833 8.9955C15.5833 5.08349 12.412 1.91217 8.49996 1.91217C4.58794 1.91217 1.41663 5.08349 1.41663 8.9955C1.41663 12.9075 4.58794 16.0788 8.49996 16.0788Z"
        stroke="#6D8C6C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 11.8288V8.99548"
        stroke="#6D8C6C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 6.16217H8.50875"
        stroke="#6D8C6C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default NoDataSvg;
