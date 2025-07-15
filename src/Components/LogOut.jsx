import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';  
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import NoDataSvg2 from '../assets/Svgs/NoDataSvg2';

const LogOut = ({ modalVisible, setModalVisible }) => {
  const hideModal = () => setModalVisible(false);

  return (
    <View style={styles.container}>
      <Modal
        visible={modalVisible}
        transparent={true}  // To make the background dim
        animationType="fade" // Adds fade-in/out effect
        onRequestClose={hideModal} // For Android back button
      >
        <View style={styles.backdrop}>
          <View style={styles.modalContent}>
            <View style={styles.iconBox}>
              {/* <MaterialCommunityIcons name={'alert-circle-outline'} size={60} color={'#4D8733'} /> */}
              <NoDataSvg2/>
              <Text style={styles.iconBoxText}>
                Are You Sure?
              </Text>
            </View>
            <View style={styles.modalMidTextContainer}>
              <Text style={styles.modalMidText}>Are you sure you that you really want to delete this Table?</Text>
            </View>
            <View style={styles.btnContainer}>
              <TouchableOpacity onPress={hideModal}>
                <View style={styles.btnContainer1}>
                  <Text style={styles.btnContainer1Text}>Cancel</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={hideModal}>
                <View style={styles.btnContainer2}>
                  <Text style={styles.btnContainer2Text}>Yes! Delete It</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LogOut;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },

  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    marginHorizontal: 40,
    borderRadius: 30,
    width: responsiveWidth(90),
    elevation: 10,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',  // Dim background effect
  },
  iconBox: {
    alignItems: 'center',
    flexDirection:'column',
    gap:5,
  },
  iconBoxText: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.7),
    color: '#222327',
    fontFamily: 'Poppins',
    fontWeight: '400',
  },
  modalMidTextContainer: {
    width: responsiveWidth(55),
    alignSelf: 'center',
    marginTop: 20,
  },
  modalMidText: {
    fontSize: responsiveFontSize(1.7),
    textAlign: 'center',
    color: '#767A8D',
    fontWeight: '400',
  },
  btnContainer: {
    marginTop: 25,
    alignSelf:'center',
    flexDirection:'row',
    gap:20,
    marginBottom:10,
  },
  btnContainer1: {
    width: responsiveWidth(25),
    borderWidth: 1,
    borderColor: '#767A8D',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer1Text: {
    color: '#767A8D',
    textAlign: 'center',
    fontSize:responsiveFontSize(2),
  },
  btnContainer2: {
    width: responsiveWidth(30),
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#4D8733',
  },
  btnContainer2Text: {
    color: 'white',
    fontSize:responsiveFontSize(2),
  }
});
