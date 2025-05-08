import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const HeaderSvg = ({width, height}) => {
  return (
    <View>
      <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 94 110" fill="none">
        <Path
          d="M89.6579 46.1196V60.8175C89.6579 62.5255 89.3824 64.226 88.7353 65.8066C83.8593 77.7169 70.9724 98.5723 50.5745 105.345C48.6274 105.991 46.5366 106.091 44.5569 105.553C33.5473 102.561 14.179 91.6361 4.37003 65.7641C3.78081 64.2099 3.51465 62.55 3.51465 60.8879V20.1885C3.51465 14.5819 6.66868 9.45479 12.0963 8.0496C27.904 3.95712 56.9479 1.56353 80.2097 7.85816C86.0485 9.43813 89.6579 14.9992 89.6579 21.0479V30.093"
          stroke="url(#paint0_linear)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <Path
          d="M46.8367 52.1294V70.4098"
          stroke="#008309"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <Circle
          cx="46.5863"
          cy="39.6087"
          r="12.5208"
          stroke="url(#paint1_linear)"
          strokeWidth="7"
        />
        <Defs>
          <LinearGradient id="paint0_linear" x1="35" y1="35" x2="93" y2="110" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#008309" />
            <Stop offset="1" stopColor="#B4D33B" />
          </LinearGradient>
          <LinearGradient id="paint1_linear" x1="68.5" y1="52" x2="30.5" y2="18" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#008309" />
            <Stop offset="1" stopColor="#77B82A" />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default HeaderSvg;

