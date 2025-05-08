import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const LockSvg = ({width, height}) => {
    return (
        <View style={styles.iconContainer}>
            <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 15 15" fill="none">
                <Path
                    d="M11.8084 6.88477H3.64176C2.99743 6.88477 2.4751 7.4071 2.4751 8.05143V12.1348C2.4751 12.7791 2.99743 13.3014 3.64176 13.3014H11.8084C12.4528 13.3014 12.9751 12.7791 12.9751 12.1348V8.05143C12.9751 7.4071 12.4528 6.88477 11.8084 6.88477Z"
                    stroke="gray"
                    strokeWidth="0.846734"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M4.80859 6.88477V4.55143C4.80859 3.77788 5.11588 3.03602 5.66287 2.48904C6.20985 1.94206 6.95171 1.63477 7.72526 1.63477C8.49881 1.63477 9.24067 1.94206 9.78766 2.48904C10.3346 3.03602 10.6419 3.77788 10.6419 4.55143V6.88477"
                    stroke="gray"
                    strokeWidth="0.846734"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    // iconContainer: {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // },
});

export default LockSvg;
