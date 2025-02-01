import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

const DropdownAccordion = ({ field, dropdownItems, formData, handleInputChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <List.Accordion
      title={selectedItem ? selectedItem : field}
      left={(props) => <List.Icon {...props} />}
      expanded={expanded}
      onPress={() => setExpanded(!expanded)}
      style={[
        styles.accordion,
        !expanded && styles.accordionCollapsed,
      ]}
    >
      <View style={styles.dropdownContainer}>
        {dropdownItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dropdownItem}
            onPress={() => {
              setSelectedItem(item);  // Set the selected item
              handleInputChange(field, item);  // Update the form data with the selected value
              setExpanded(false);  // Close the accordion
            }}
          >
            <Text style={styles.dropdownText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </List.Accordion>
  );
};

const styles = StyleSheet.create({
  accordion: {
    borderColor: '#B9BDCF',
    backgroundColor:'white',
    color:'black',
    borderBottomWidth: 1,
  },
  accordionCollapsed: {
    borderBottomWidth: 0.5,
  },
  dropdownContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation:5,
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  dropdownText: {
    fontSize: 18,
    color: '#333',
  },
});

export default DropdownAccordion;
