import React from 'react';
import { Svg, Path } from 'react-native-svg';

const UserIconSvg = ({ strokeColor = "#222327", strokeWidth = 1.5 }) => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
      <Path
        d="M11.3334 14.875V13.4583C11.3334 12.7069 11.0349 11.9862 10.5036 11.4549C9.9722 10.9235 9.25153 10.625 8.50008 10.625H4.25008C3.49863 10.625 2.77797 10.9235 2.24661 11.4549C1.71526 11.9862 1.41675 12.7069 1.41675 13.4583V14.875"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.37508 7.79167C7.93989 7.79167 9.20842 6.52314 9.20842 4.95833C9.20842 3.39353 7.93989 2.125 6.37508 2.125C4.81027 2.125 3.54175 3.39353 3.54175 4.95833C3.54175 6.52314 4.81027 7.79167 6.37508 7.79167Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5833 14.875V13.4583C15.5828 12.8305 15.3738 12.2207 14.9892 11.7245C14.6046 11.2284 14.0661 10.874 13.4583 10.717"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.3333 2.21704C11.9427 2.37309 12.4829 2.72754 12.8687 3.22451C13.2544 3.72148 13.4638 4.33271 13.4638 4.96183C13.4638 5.59095 13.2544 6.20218 12.8687 6.69915C12.4829 7.19613 11.9427 7.55058 11.3333 7.70662"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default UserIconSvg;
