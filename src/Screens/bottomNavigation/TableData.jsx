import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import TableCardContent from '../../Components/TableCardContent';
import { useGlobalContext } from '../../Context/GlobalContext';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import { UIActivityIndicator } from 'react-native-indicators';

const TableData = ({ navigation }) => {
  const [tableAccess, setTableAccess] = useState(null);
  const [tableLoader, setTableLoader] = useState(false);
  const { getTables, data, getDataByToken, getUsers } = useGlobalContext();

  const isDataEqual = (prevData, newData) => {
    return JSON.stringify(prevData) === JSON.stringify(newData);
  };

  // useEffect(() => {
  //   let interval;

  //   const fetchData = async () => {
  //     try {
  //       const tables = await getTables();
  //       const tokenData = await getDataByToken();

  //       if (!isDataEqual(data, tables)) {
  //       }

  //       if (!isDataEqual(tableAccess, tokenData)) {
  //         setTableAccess(tokenData);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();

  //   interval = setInterval(fetchData, 5000);

  //   return () => clearInterval(interval);
  // }, [data, tableAccess]);

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


  useEffect(() => {
    const fetchUser = async () => {
      try {
        await getUsers();

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchUser();
  }, [])

  return (
    <View style={styles.container}>
      {
        tableLoader ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <UIActivityIndicator size={responsiveHeight(4)} color="#578356" />
          </View>
        ) : (
          <FlatList
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
                      data={item}
                      tableAccess={matchingTableAccess?.userFieldSettings}
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
    marginBottom: 65,
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 3,
    marginBottom: 20,
    marginTop: 5,
    alignSelf: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
