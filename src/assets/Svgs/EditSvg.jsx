import React from 'react';
import { SvgXml } from 'react-native-svg'; // Importing the SvgXml component to render raw SVG data

const EditSvg = () => {
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M10.6857 2.29666C10.8427 2.1228 11.0368 1.98129 11.2557 1.88114C11.4746 1.78099 11.7136 1.7244 11.9573 1.71497C12.201 1.70554 12.4441 1.74349 12.6712 1.82638C12.8983 1.90928 13.1044 2.03531 13.2763 2.19645C13.4481 2.35758 13.5821 2.55028 13.6695 2.76226C13.757 2.97425 13.796 3.20087 13.7842 3.42768C13.7723 3.65449 13.7098 3.87652 13.6007 4.07961C13.4916 4.2827 13.3382 4.4624 13.1504 4.60725L4.83223 12.4055L1.44336 13.272L2.3676 10.0949L10.6857 2.29666Z" fill="#222327"/>
      <path d="M9.4541 3.45197L11.9187 5.76256" stroke="#EEF5ED" stroke-width="1.84848" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  return <SvgXml xml={svgMarkup} width="15" height="15" />;
};

export default EditSvg;
