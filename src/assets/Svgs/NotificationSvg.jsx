import React from 'react';
import Svg, { Path } from 'react-native-svg';

const NotificationSvg = ({ width , height , fill = "none", strokeColor = "#383535", strokeWidth = 1.28883 }) => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 21 18" fill={fill}>
      <Path
        d="M0.925293 10.611V8.03339C0.925293 7.3216 1.50232 6.74457 2.21412 6.74457H7.21775C7.31136 6.74457 7.39762 6.69382 7.44308 6.61199L9.38375 3.11877C9.70668 2.5375 10.5915 2.76678 10.5915 3.43173V14.8082C10.5915 15.4557 9.74375 15.6988 9.40061 15.1498L7.44514 12.021C7.39804 11.9457 7.31543 11.8999 7.22655 11.8999H2.21412C1.50232 11.8999 0.925293 11.3228 0.925293 10.611Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M4.14746 11.8999V15.7664M14.4581 4.81135L17.6801 2.2337M15.1025 9.32224H20.2578M14.4581 13.8331L17.6801 17.0552M11.8804 6.74459V6.74459C14.0858 7.37647 14.1649 10.4726 11.9947 11.2163L11.8804 11.2555"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default NotificationSvg;
