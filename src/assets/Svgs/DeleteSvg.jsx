import React from 'react';
import { Svg, Path } from 'react-native-svg';

const TrashIcon = ({ strokeColor = "black", fillColor = "black", secondaryStrokeColor = "white" , width , height }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M1.94397 4.72107H13.2676"
        stroke={strokeColor}
        strokeWidth="1.58928"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.0092 4.72107V13.5283C12.0092 14.1574 11.3801 14.7865 10.751 14.7865H4.46009C3.831 14.7865 3.2019 14.1574 3.2019 13.5283V4.72107"
        fill={fillColor}
      />
      <Path
        d="M5.08911 4.72108V3.46289C5.08911 2.8338 5.7182 2.20471 6.34729 2.20471H8.86366C9.49275 2.20471 10.1218 2.8338 10.1218 3.46289V4.72108"
        fill={fillColor}
      />
      <Path
        d="M6.3479 7.86646V11.641"
        stroke={secondaryStrokeColor}
        strokeWidth="1.19196"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.86365 7.86646V11.641"
        stroke={secondaryStrokeColor}
        strokeWidth="1.19196"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default TrashIcon;
