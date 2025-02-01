import React from 'react';
import Svg, { Path } from 'react-native-svg';

const LogOutSvg = ({ width = 17, height = 16, fill = "none", strokeColor = "#222327", strokeWidth = 1.23 }) => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 17 16" fill={fill}>
      <Path
        d="M6.375 14H3.54167C3.16594 14 2.80561 13.8595 2.53993 13.6095C2.27426 13.3594 2.125 13.0203 2.125 12.6667V3.33333C2.125 2.97971 2.27426 2.64057 2.53993 2.39052C2.80561 2.14048 3.16594 2 3.54167 2H6.375"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.3335 11.3334L14.8752 8.00002L11.3335 4.66669"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.875 8H6.375"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default LogOutSvg;
