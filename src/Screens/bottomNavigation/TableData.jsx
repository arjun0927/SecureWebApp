import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, FlatList, View, Keyboard } from 'react-native';
import TableCardContent from '../../Components/TableCardContent';
import { useGlobalContext } from '../../Context/GlobalContext';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import { UIActivityIndicator } from 'react-native-indicators';

const TableData = ({ navigation }) => {
  const [tableAccess, setTableAccess] = useState(null);
  const [tableLoader, setTableLoader] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { getTables, data, getDataByToken, getUsers } = useGlobalContext();

  const isDataEqual = (prevData, newData) => {
    return JSON.stringify(prevData) === JSON.stringify(newData);
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTableLoader(true);
        const tables = await getTables();
        const tokenData = await getDataByToken();
        setTableLoader(false);

        if (!isDataEqual(data, tables)) {
          // Handle any action if needed
        }

        if (!isDataEqual(tableAccess, tokenData)) {
          setTableAccess(tokenData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);




  return (
    <View style={[styles.container, keyboardVisible && styles.containerKeyboardVisible]}>
      {
        tableLoader ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <UIActivityIndicator size={responsiveHeight(4)} color="#578356" />
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            keyExtractor={(item, index) => index}
            renderItem={({ item }) => {
              const matchingTableAccess = tableAccess?.find(
                (accessItem) => accessItem._id === item._id
              );
              if (matchingTableAccess) {

                return (
                  <View style={styles.card}>
                    <TableCardContent
                      item={item}
                      tableAccess={item?.fieldSettings}
                    />
                  </View>
                );
              }
              return null;
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Data Found</Text>
              </View>
            )}
          />
        )
      }

    </View>
  );
};

export default TableData;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: responsiveHeight(10),
    paddingTop: 10
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
  },
  emptyText: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins-Medium',
    color: 'black',
    marginTop: 20,
  },
});
