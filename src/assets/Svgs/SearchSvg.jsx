import React from 'react';
import Svg, { Path } from 'react-native-svg';

const SearchSvg = () => {
  return (
    <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <Path 
        d="M10.0833 17.4167C14.1334 17.4167 17.4167 14.1334 17.4167 10.0833C17.4167 6.03324 14.1334 2.75 10.0833 2.75C6.03324 2.75 2.75 6.03324 2.75 10.0833C2.75 14.1334 6.03324 17.4167 10.0833 17.4167Z"
        stroke="#222327"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path 
        d="M19.25 19.25L15.3083 15.3083"
        stroke="#222327"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SearchSvg;
