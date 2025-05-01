import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { List } from 'react-native-paper';

const DropdownAccordion = ({ field, dropdownItems, formData, handleInputChange, maxHeight = 200 }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState(formData[field] || null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // console.log('formData', formData);

  // Handle screen size changes for responsiveness
  useEffect(() => {
    const updateLayout = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const dimensionsListener = Dimensions.addEventListener('change', updateLayout);

    // Clean up
    return () => {
      // Modern React Native uses return value from addEventListener for cleanup
      if (dimensionsListener?.remove) {
        dimensionsListener.remove();
      }
    };
  }, []);

  // Set initial selected value from formData
  useEffect(() => {
    if (formData[field]) {
      setSelectedItem(formData[field]);
    }
  }, [formData, field]);

  // Calculate dropdown height based on available items, with a maximum
  const calculatedHeight = Math.min(
    dropdownItems.length * 44, 
    maxHeight
  );

  // Responsive styles based on screen width
  const getContainerStyle = () => {
    if (screenWidth < 480) {
      return { width: '100%' }; // Full width on small screens
    } else if (screenWidth < 768) {
      return { width: '90%' }; // 90% width on medium screens
    } else {
      return { width: '80%' }; // 80% width on larger screens
    }
  };

  return (
    <View style={[styles.container, getContainerStyle()]}>
      <List.Accordion
        title={selectedItem ? selectedItem : field}
        // left={(props) => <List.Icon {...props} icon="menu-down" />}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        style={[
          styles.accordion,
          !expanded && styles.accordionCollapsed,
        ]}
        titleStyle={styles.accordionTitle}
      >
        <View style={[styles.dropdownContainer, { maxHeight: calculatedHeight }]}>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            {dropdownItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  selectedItem === item && styles.selectedItem
                ]}
                onPress={() => {
                  setSelectedItem(item);           // Set the selected item
                  handleInputChange(field, item);  // Update the form data
                  setExpanded(false);              // Close the accordion
                }}
              >
                <Text style={styles.dropdownText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </List.Accordion>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginBottom: 10,
    zIndex: 999,
  },
  accordion: {
    borderColor: '#B9BDCF',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderRadius: 4,
  },
  accordionTitle: {
    color: 'black',
  },
  accordionCollapsed: {
    borderBottomWidth: 0.5,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    overflow: 'hidden',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  selectedItem: {
    backgroundColor: '#F1FFEC',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
});

export default DropdownAccordion;