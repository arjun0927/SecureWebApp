import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, Text, Keyboard } from 'react-native';
import CardContent from '../../Components/CardContent';
import { useGlobalContext } from '../../Context/GlobalContext';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import { UIActivityIndicator } from 'react-native-indicators';

const UserData = () => {
    const { getUsers, users } = useGlobalContext();
    const [loader, setLoader] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoader(true);
                await getUsers();
                setLoader(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoader(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const renderItem = useCallback(({ item }) => {
        return (
            <View style={styles.card}>
                <CardContent data={item} />
            </View>
        );
    }, []);

    return (
        <View style={[
            styles.container,
            keyboardVisible && styles.containerKeyboardVisible
        ]}>
            {
                loader ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <UIActivityIndicator size={responsiveHeight(4)} color="#578356" />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item._id.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No Data Found</Text>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                )
            }
        </View>
    );
};

export default UserData;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: responsiveHeight(8),
        paddingTop: 10,
    },
    containerKeyboardVisible: {
        marginBottom: 0,
    },
    card: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        elevation: 3,
        marginBottom: 20,
        marginTop: 0,
        alignSelf: 'center'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-Medium',
        color: 'black',
        marginTop: 20,
    },
});
