import React from 'react';
import { Svg, Path } from 'react-native-svg';

const TopArrowSvg = ({width, height}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M10.5 5.5L6 1.5L1.5 5.5"
        stroke="#222327"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default TopArrowSvg;
