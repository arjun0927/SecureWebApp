import React from 'react';
import { Svg, Path } from 'react-native-svg';

const TableIcon = ({ fillColor = "none", strokeColor = "black" , width , height  }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M20.0177 3.90552H5.29934C4.13809 3.90552 3.19672 4.84689 3.19672 6.00814V20.7265C3.19672 21.8877 4.13809 22.8291 5.29934 22.8291H20.0177C21.1789 22.8291 22.1203 21.8877 22.1203 20.7265V6.00814C22.1203 4.84689 21.1789 3.90552 20.0177 3.90552Z"
        fill={fillColor}
      />
      <Path
        d="M15.8113 3.90527V22.8289"
        stroke={strokeColor}
        strokeWidth="1.57697"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.1197 10.2134H3.19611"
        stroke={strokeColor}
        strokeWidth="1.57697"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.1197 16.521H3.19611"
        stroke={strokeColor}
        strokeWidth="1.57697"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default TableIcon;
