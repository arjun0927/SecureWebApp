import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

const SplaceBackgroundSvg = (props) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={360}
      height={800}
      viewBox="0 0 360 800"
      fill="none"
      {...props}
    >
      <G style={{ mixBlendMode: 'overlay' }}>
        <Path
          d="M-641 -97H1001V912.614C306.334 1040.44 -52.8744 1044.47 -641 912.614V-97Z"
          fill="#51E449"
        />
      </G>
    </Svg>
  );
};

export default SplaceBackgroundSvg;
