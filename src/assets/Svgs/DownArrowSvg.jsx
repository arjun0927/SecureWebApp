import React from 'react';
import { Svg, Path } from 'react-native-svg';

const DownArrowSvg = ({width,height}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M10.5 1.5L6 5.5L1.5 1.5"
        stroke="#222327"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default DownArrowSvg;
