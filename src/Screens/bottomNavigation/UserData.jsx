import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import CardContent from '../../Components/CardContent';
import { useGlobalContext } from '../../Context/GlobalContext';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const currentURL = "https://secure.ceoitbox.com/";
const socket = io(currentURL, { autoConnect: false });

const UserData = () => {
  const { getUsers, users } = useGlobalContext();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getUsers();
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Call fetchData once when the component mounts
    fetchData();
  }, [getUsers]);

  const getUserInfo = async () => {
    const storedUser = await AsyncStorage.getItem('loginUser');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  useEffect(() => {
    const initializeSocket = async () => {
      const loginUser = await getUserInfo();

      if (!loginUser) return;

      socket.connect();

      socket.emit("userConnected", {
        userID: loginUser.body._id,
        userName: loginUser.body.userName,
        email: loginUser.body.email,
        createdBy: loginUser?.body.createdBy,
        isAdmin: loginUser.body.isAdmin,
        role: loginUser.body.role,
      });

      const handleGetOnlineUsers = (val) => {
        const onlineUsersArray = Object.values(val);
        setOnlineUsers(onlineUsersArray);
      };

      if (loginUser.body.isAdmin || loginUser.body.role === "ADMIN") {
        socket.on("getOnlineUsers", handleGetOnlineUsers);
      }

      const handleReconnect = () => {
        socket.emit("userConnected", {
          userID: loginUser.body._id,
          userName: loginUser.body.userName,
          email: loginUser.body.email,
          createdBy: loginUser?.body.createdBy,
          isAdmin: loginUser.body.isAdmin,
          role: loginUser.body.role,
        });
      };

      socket.on("connect", handleReconnect);

      return () => {
        socket.off("getOnlineUsers", handleGetOnlineUsers);
        socket.disconnect();
      };
    };

    initializeSocket();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          // Find online user that matches the current user's _id
          const onlineUser = onlineUsers.find((online) => online.userID === item._id);
          return (
            <View style={styles.card}>
              <CardContent 
                data={item} // Pass full user data
                onlineUser={onlineUser ? onlineUser : null}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default UserData;

const styles = StyleSheet.create({
  container: {
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
});
