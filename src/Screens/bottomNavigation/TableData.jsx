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
            keyExtractor={(item, index) => index.toString()}
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
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    elevation: 3,
    marginTop: 2,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerOpen: {
    marginVertical: 7,
    borderBottomWidth: 1,
    borderColor: '#BDC3D4',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: 'black',
    lineHeight: 32,
  },
  iconButton: {
    backgroundColor: '#EEF5ED',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    width: 35,
    height: 39,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEFF6',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    width: '50%',
    color: '#222327',
    fontSize: responsiveFontSize(1.7),
    fontFamily: 'Poppins',
    fontWeight: '400',
  },
  rowValue: {
    flex: 1,
    color: '#578356',
    fontSize: responsiveFontSize(1.5),
    fontFamily: 'Poppins',
    fontWeight: '400',
  },
});
