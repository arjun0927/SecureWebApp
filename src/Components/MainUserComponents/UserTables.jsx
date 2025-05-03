import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import UserTableCard from './UserTableCard';
import { useGlobalContext } from '../../Context/GlobalContext';
import { UIActivityIndicator } from 'react-native-indicators';

const UserTables = ({ navigation }) => {
  const [tableAccess, setTableAccess] = useState(null);
  const [tableLoader, setTableLoader] = useState(false);
  const { getDataByToken, getTables, data, setData } = useGlobalContext();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setTableLoader(true);
        await getTables();
        const tokenData = await getDataByToken();
        if (tokenData) {
          setTableLoader(false);
        }

        if (tokenData) {
          setTableAccess(tokenData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);


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
              if (tableAccess) {
                const matchingTableAccess = tableAccess.find((accessItem) => accessItem._id === item._id);

                if (matchingTableAccess) {
                  return (
                    <View style={styles.card}>
                      <UserTableCard
                        data={item}
                        tableAccess={matchingTableAccess?.userFieldSettings}
                      />
                    </View>
                  );
                }
              }
              return null;
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                {/* <View style={styles.emptyIcon} /> */}
                <Text style={styles.emptyText}>No Data Found</Text>
              </View>
            )}
          />

        )
      }
    </View>
  );
};

export default UserTables;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 60,
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    elevation: 3,
    marginBottom: 20,
    // marginHorizontal:20,
    marginTop: 5,
    alignSelf: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF5ED', // Placeholder for an icon
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#999',
  },

});
