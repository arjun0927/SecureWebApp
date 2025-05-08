import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const EmailSvg = ({width,height}) => {
    return (
        <View style={styles.iconContainer}>
            <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 15 14" fill="none">
                <Path
                    d="M12.3916 2.3335H3.05827C2.41394 2.3335 1.8916 2.85583 1.8916 3.50016V10.5002C1.8916 11.1445 2.41394 11.6668 3.05827 11.6668H12.3916C13.0359 11.6668 13.5583 11.1445 13.5583 10.5002V3.50016C13.5583 2.85583 13.0359 2.3335 12.3916 2.3335Z"
                    stroke="gray"
                    strokeWidth="0.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M13.5583 4.0835L8.32577 7.4085C8.14568 7.52133 7.93745 7.58117 7.72494 7.58117C7.51242 7.58117 7.30419 7.52133 7.1241 7.4085L1.8916 4.0835"
                    stroke="gray"
                    strokeWidth="0.85"
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

export default EmailSvg;
