import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';  
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import NoDataSvg2 from '../../assets/Svgs/NoDataSvg2';

const DeleteModal = ({ modalVisible, setModalVisible, handleDelete, handleCancel , deleteLoader }) => {

  const hideModal = () => setModalVisible(false);

  const handleConfirmDelete = async() => {
    await handleDelete();
    hideModal();
  };

  return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideModal} 
      >
        <View style={styles.backdrop}>
          <View style={styles.modalContent}>
            <View style={styles.iconBox}>
              <NoDataSvg2 />
              <Text style={styles.iconBoxText}>
                Are You Sure?
              </Text>
            </View>
            <View style={styles.modalMidTextContainer}>
              <Text style={styles.modalMidText}>Are you sure you want to delete this table?</Text>
            </View>
            <View style={styles.btnContainer}>
              <TouchableOpacity onPress={handleCancel}>
                <View style={styles.btnContainer1}>
                  <Text style={styles.btnContainer1Text}>Cancel</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmDelete}>
                <View style={styles.btnContainer2}>
                  {
                    deleteLoader ? (
                      <ActivityIndicator size={'small'} color='white'  />
                    ) : (
                      <Text style={styles.btnContainer2Text}>Yes! Delete It</Text>
                    )
                  }
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  );
};

export default DeleteModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  modalContent: {
    padding:20,
    backgroundColor: '#FFF',
    width:responsiveWidth(90),
    borderRadius: 30,
    elevation: 10,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    
  },
  iconBox: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: 5,
  },
  iconBoxText: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.7),
    color: '#222327',
    fontFamily: 'Poppins-Medium',
  },
  modalMidTextContainer: {
    width: responsiveWidth(55),
    alignSelf: 'center',
    marginTop: 10,
  },
  modalMidText: {
    fontSize: responsiveFontSize(1.7),
    textAlign: 'center',
    color: '#767A8D',
    fontFamily:'Poppins-Medium'
  },
  btnContainer: {
    marginTop: 25,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
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
    fontSize: responsiveFontSize(1.7),
    fontFamily:'Poppins-Medium'
  },
  btnContainer2: {
    width: responsiveWidth(30),
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4D8733',
  },
  btnContainer2Text: {
    color: 'white',
    fontSize: responsiveFontSize(1.7),
    fontFamily:'Poppins-Medium'
  }
});
