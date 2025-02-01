import React from 'react';
import Svg, { G, Path, Defs, Filter, FeFlood, FeColorMatrix, FeOffset, FeGaussianBlur, FeComposite, FeBlend, ClipPath, Rect } from 'react-native-svg';

const RadioSelectedCheckbox = () => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <G clipPath="url(#clip0)">
        <G filter="url(#filter0)">
          <Path
            d="M11 20.0005C15.9706 20.0005 20 15.9711 20 11.0005C20 6.02993 15.9706 2.00049 11 2.00049C6.02944 2.00049 2 6.02993 2 11.0005C2 15.9711 6.02944 20.0005 11 20.0005Z"
            fill="#4D8733"
          />
        </G>
        <Path
          d="M7.14307 11.4289L9.7145 14.0003L15.2859 8.85742"
          stroke="white"
          strokeWidth="1.28571"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <Filter id="filter0" x="-0.057143" y="-0.0566547" width="22.1143" height="22.1143" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <FeFlood floodOpacity="0" result="BackgroundImageFix" />
          <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <FeOffset />
          <FeGaussianBlur stdDeviation="1.02857" />
          <FeComposite in2="hardAlpha" operator="out" />
          <FeColorMatrix type="matrix" values="0 0 0 0 0.817337 0 0 0 0 0.792837 0 0 0 0 0.876136 0 0 0 0.77 0" />
          <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </Filter>
        <ClipPath id="clip0">
          <Rect width="20.5714" height="20.5714" fill="white" transform="translate(0.714355 0.714355)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default RadioSelectedCheckbox;
