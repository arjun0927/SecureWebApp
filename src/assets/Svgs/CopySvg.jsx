import React from 'react';
import { SvgXml } from 'react-native-svg'; // Importing the SvgXml component to render raw SVG data

const YourSvgComponent = () => {
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
      <g clip-path="url(#clip0_1155_1897)">
        <path d="M10.9395 4.43494H5.78809C5.21908 4.43494 4.75781 4.89621 4.75781 5.46521V10.6166C4.75781 11.1856 5.21908 11.6469 5.78809 11.6469H10.9395C11.5085 11.6469 11.9697 11.1856 11.9697 10.6166V5.46521C11.9697 4.89621 11.5085 4.43494 10.9395 4.43494Z" stroke="#222327" stroke-width="1.03027" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2.69727 8.55603C2.13062 8.55603 1.66699 8.09241 1.66699 7.52576V2.37439C1.66699 1.80774 2.13062 1.34412 2.69727 1.34412H7.84863C8.41528 1.34412 8.87891 1.80774 8.87891 2.37439" stroke="#222327" stroke-width="1.03027" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_1155_1897">
          <rect width="12.3633" height="12.3633" fill="white" transform="translate(0.636719 0.313843)"/>
        </clipPath>
      </defs>
    </svg>
  `;

  return <SvgXml xml={svgMarkup} width="13" height="13" />;
};

export default YourSvgComponent;
