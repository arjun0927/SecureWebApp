import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DeleteSvg from '../assets/Svgs/DeleteSvg';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { UIActivityIndicator } from 'react-native-indicators';
import { checkBooleanCondition, checkDateCondition, checkNumberCondition, checkStringCondition, convertToNumber } from './ConditionalFormatting';

// Get screen dimensions for responsive calculations
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Scale factor for responsive font sizing
const scaleFactor = SCREEN_WIDTH / 375; // Based on standard iPhone width

// Responsive sizing functions
const rs = (size) => size * scaleFactor; // Responsive size
const rf = (size) => Math.round(size * scaleFactor); // Responsive font size
const regex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})\/view\?usp=drivesdk/;

// Row data component to reduce re-renders
const DataRow = React.memo(
  ({ field, value, isLast, setVisible, setImageUri, tableAccess }) => {
    if (field === '__ID') return null;

    // console.log('tableAccess : ', tableAccess?.[field]);
    // console.log('field : ', field)

    const fieldConfig = tableAccess?.[field] || {};
    // console.log('fieldConfig : ',fieldConfig)
    const formattingRules = tableAccess?.[field]?.conditionalFormatting || [];

    // console.log('formatting Rules : ', formattingRules)
    
    // Base styles - initialize only for CELL scope
    let cellStyle = {};
    let textStyle = {};
    
    // Value that will be used for condition checking
    let checkValue = value;
    let dataType = fieldConfig?.dataType?.toLowerCase();

    // console.log('data type : ', dataType)
    
    if (dataType === 'number') {
      checkValue = convertToNumber(value);
    } else if (dataType === 'date' && value) {
      checkValue = new Date(value);
    } else if (dataType === 'boolean') {
      checkValue = Boolean(value);
    } else if (dataType === 'text' ){
      checkValue = value ; 
    }
    
    for (const rule of formattingRules) {
      const { condition, value: expectedValue, actions, scope, dataType: ruleDataType } = rule;
      let conditionMet = false;
      
      switch (ruleDataType) {
        case 'number':
          conditionMet = checkNumberCondition(
            convertToNumber(checkValue), 
            condition, 
            convertToNumber(expectedValue)
          );
          break;
        case 'Text':
          conditionMet = checkStringCondition(
            (checkValue || "").toString().toLowerCase(), 
            condition, 
            (expectedValue || "").toString().toLowerCase()
          );
          break;
        case 'boolean':
          conditionMet = checkBooleanCondition(checkValue, condition);
          break;
        case 'date':
          conditionMet = checkDateCondition(checkValue, condition, new Date(expectedValue));
          break;
        default:
          // Default to string comparison if data type is unspecified
          conditionMet = checkStringCondition(
            (checkValue || "").toString().toLowerCase(), 
            condition, 
            (expectedValue || "").toString().toLowerCase()
          );
          break;
      }

      if (conditionMet) {
        // Only apply styling if scope is CELL, ignore ROW scope
        if (scope === 'CELL') {
          if (actions.backgroundColor) {
            cellStyle.backgroundColor = actions.backgroundColor;
          }
          
          if (actions.bold) textStyle.fontWeight = 'bold';
          if (actions.italic) textStyle.fontStyle = 'italic';
          if (actions.underline) textStyle.textDecorationLine = 'underline';
          if (actions.textColor) textStyle.color = actions.textColor;
        }
        
        break;
      }
    }

    const combinedTextStyle = [
      styles.rowValue,
      textStyle,
    ];

    const isImageUrl = /\.(jpeg|jpg|gif|png|svg)$/i.test(value);
    const isDriveUrl = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})\/view\?usp=drivesdk/.test(value);

    return (
      <View style={[styles.dataRow, isLast && styles.noBorder]}>
        <Text
          style={styles.rowLabel}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {field}
        </Text>

        {isImageUrl || isDriveUrl ? (
          <TouchableOpacity
            onPress={() => {
              setVisible(true);
              setImageUri(value);
            }}
            style={{ flex: 1 }}
          >
            <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
              Click here
            </Text>
          </TouchableOpacity>
        ) : (
          <Text 
            style={[combinedTextStyle, cellStyle]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {value}
          </Text>
        )}
      </View>
    );
  }
);

const TableRowActions = React.memo(({
  index,
  handleCircleSelect,
  isSelected,
  onEdit,
  onDelete
}) => {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.leftCardHeader}>
        <TouchableOpacity
          onPress={() => handleCircleSelect(index)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View>
            {isSelected ? (
              <View style={styles.selectedCircle}>
                <AntDesign name='checkcircle' size={responsiveFontSize(2)} color={'#4D8733'} />
              </View>
            ) : (
              <Feather name='circle' size={responsiveFontSize(2)} color={'black'} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.rightCardHeader}>
        <TouchableOpacity
          onPress={onEdit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.headerRightIcon}>
            <MaterialIcons name={'edit'} size={responsiveFontSize(2)} color={'black'} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.headerRightIcon}>
            <DeleteSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Separate component for the "View More/Less" button
const ViewMoreButton = React.memo(({
  isExpanded,
  onToggle,
  show
}) => {
  if (!show) return null;

  return (
    <TouchableOpacity
      onPress={onToggle}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.viewMoreContainer}>
        <Feather
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          color="#4D8733"
          size={rs(20)}
          style={{ marginRight: 5 }}
        />
        <Text style={styles.viewMoreContainerText}>
          {isExpanded ? 'View Less' : 'View More'}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// Optimized TableRow component
const TableRow = React.memo(({
  item,
  index,
  initialFieldsToShow,
  expandedIndex,
  toggleAccordion,
  fieldData,
  handleCircleSelect,
  selectedIndices,
  handleEdit,
  handleDeletePress,
  setVisible,
  setImageUri,
  tableAccess,
}) => {
  // Determine which fields to display
  const fieldsToDisplay = expandedIndex === index
    ? fieldData
    : fieldData.slice(0, initialFieldsToShow);

  // Check if there are more fields to show
  const hasMoreFields = fieldData.length > initialFieldsToShow;

  // Check if the current row is selected
  const isSelected = selectedIndices.includes(index);
  // console.log({ tableAccess })
  return (
    <View style={styles.form}>
      <TableRowActions
        index={index}
        handleCircleSelect={handleCircleSelect}
        isSelected={isSelected}
        onEdit={() => handleEdit(item, index)}
        onDelete={() => handleDeletePress(index)}
      />

      <View style={styles.headerLine} />

      <View>
        {fieldsToDisplay.map((field, fieldIndex) => {
          return <DataRow
            key={field}
            field={field}
            value={item[field]}
            isLast={fieldIndex === fieldsToDisplay.length - 1}
            setVisible={setVisible}
            setImageUri={setImageUri}
            tableAccess={tableAccess}
          />
        })}
      </View>

      <ViewMoreButton
        isExpanded={expandedIndex === index}
        onToggle={() => toggleAccordion(index)}
        show={hasMoreFields}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  return (
    prevProps.item === nextProps.item &&
    prevProps.expandedIndex === nextProps.expandedIndex &&
    prevProps.selectedIndices.includes(prevProps.index) ===
    nextProps.selectedIndices.includes(nextProps.index)
  );
});

// Main component for the optimized FlatList
const EnhancedFlatlist = ({
  data,
  fieldData,
  expandedIndex,
  toggleAccordion,
  selectedIndices,
  handleCircleSelect,
  handleEdit,
  handleDeletePress,
  setVisible,
  setImageUri,
  initialFieldsToShow,
  loadingMore,
  onEndReached,
  tableAccess,
}) => {

  // console.log('kfdjsalkjdf', tableAccess)

  // Empty list component - memoized
  const ListEmptyComponent = React.useCallback(() => (
    <View style={styles.emptyContainer}>
      <Feather name="database" size={rs(50)} color="#CCC" />
      <Text style={styles.emptyText}>No data found</Text>
    </View>
  ), []);

  // Footer with loading indicator - memoized
  const renderFooter = React.useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <UIActivityIndicator color={'#4D8733'} size={rs(20)} />
      </View>
    );
  }, [loadingMore]);

  // Extract ID for key with fallback - optimized
  const keyExtractor = React.useCallback((item) =>
    (item.__ID?.toString() || String(Math.random())),
    []);

  const renderItem = React.useCallback(({ item, index }) => (
    <TableRow
      item={item}
      index={index}
      initialFieldsToShow={initialFieldsToShow}
      expandedIndex={expandedIndex}
      toggleAccordion={toggleAccordion}
      fieldData={fieldData}
      handleCircleSelect={handleCircleSelect}
      selectedIndices={selectedIndices}
      handleEdit={handleEdit}
      handleDeletePress={handleDeletePress}
      setVisible={setVisible}
      setImageUri={setImageUri}
      tableAccess={tableAccess}
    />
  ), [
    expandedIndex,
    toggleAccordion,
    fieldData,
    initialFieldsToShow,
    handleCircleSelect,
    selectedIndices,
    handleEdit,
    handleDeletePress,
    setVisible,
    setImageUri,
    tableAccess,
  ]);

  // Optimize FlatList rendering with constant item heights
  const getItemLayout = React.useCallback((_, index) => ({
    length: rs(200),
    offset: rs(200) * index,
    index,
  }), []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      contentContainerStyle={
        data.length === 0 ? { flex: 1 } : { paddingBottom: rs(20) }
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default EnhancedFlatlist;

const styles = StyleSheet.create({
  form: {
    backgroundColor: '#FFF',
    borderRadius: rs(15),
    padding: rs(15),
    borderColor: '#ECF3E9',
    borderWidth: 1,
    marginVertical: rs(8),
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCardHeader: {
    flexDirection: 'row',
    gap: rs(10),
    width: '65%',
    alignItems: 'center',
  },
  rightCardHeader: {
    flexDirection: 'row',
    gap: rs(10),
    alignItems: 'center',
  },
  headerRightIcon: {
    backgroundColor: '#EEF5ED',
    borderRadius: rs(15),
    width: rs(30),
    height: rs(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(15),
    backgroundColor: '#E7F4E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLine: {
    marginTop: rs(12),
    marginBottom: rs(5),
    borderBottomWidth: 1,
    borderColor: '#BDC3D4',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: rs(10),
    paddingHorizontal: rs(5),
    borderBottomWidth: 1,
    borderBottomColor: '#EEEFF6',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    flex: 1,
    color: '#222327',
    fontSize: rf(13),
    fontFamily: 'Poppins-Regular',
  },
  rowValue: {
    flex: 1,
    color: '#767A8D',
    fontSize: rf(13),
    fontFamily: 'Poppins-Regular',
  },
  viewMoreContainer: {
    flexDirection: 'row',
    paddingHorizontal: rs(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: rs(10),
  },
  viewMoreContainerText: {
    color: '#4D8733',
    fontSize: rf(14),
    fontFamily: 'Poppins-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(40),
  },
  emptyText: {
    marginTop: rs(15),
    fontSize: rf(16),
    color: '#666',
    fontFamily: 'Poppins-Medium',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rs(10),
  },
});





// import { Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Animated, TextInput, FlatList } from 'react-native'
// import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react'
// import { useNavigation } from '@react-navigation/native';
// import Feather from 'react-native-vector-icons/Feather'
// import { useGlobalContext } from '../../Context/GlobalContext';
// import AddUsersSvg from '../../assets/Svgs/AddUsersSvg';
// import SearchSvg from '../../assets/Svgs/SearchSvg';
// import DeleteSvg2 from '../../assets/Svgs/DeleteSvg2';
// import DeleteSvg from '../../assets/Svgs/DeleteSvg';
// import { UIActivityIndicator } from 'react-native-indicators';
// import { responsiveFontSize } from 'react-native-responsive-dimensions';
// import AntDesign from 'react-native-vector-icons/AntDesign'
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // Scale factor for responsive font sizing
// const scaleFactor = SCREEN_WIDTH / 375; // Based on standard iPhone width

// // Responsive sizing functions
// const rs = (size) => size * scaleFactor; // Responsive size
// const rf = (size) => Math.round(size * scaleFactor); // Responsive font size

// const AllUserData = ({ route }) => {
// 	const animation = useRef(new Animated.Value(0)).current;
// 	const addButtonOpacity = useRef(new Animated.Value(1)).current;
// 	const [selectedIndices, setSelectedIndices] = useState([]);
// 	const [modalVisible, setModalVisible] = useState(false);
// 	const [expandedIndex, setExpandedIndex] = useState(null);
// 	const [loading, setLoading] = useState(false);
// 	const [loadingMore, setLoadingMore] = useState(false);
// 	const [fieldData, setFieldData] = useState([]);
// 	const [selectedIndex, setSelectedIndex] = useState(null);
// 	const [isSearchVisible, setSearchVisible] = useState(false);
// 	const [deleteTableLoader, setDeleteTableLoader] = useState(false);
// 	const [searchTerm, setSearchTerm] = useState('');
// 	const [imageUri, setImageUri] = useState('');
// 	const [visible, setVisible] = useState(false);
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const [index, setIndex] = useState(0);
// 	const [flatlistData, setFlatlistData] = useState([]);
// 	const [hasMoreData, setHasMoreData] = useState(true);
// 	const [deleteSelected, setDeleteSelected] = useState(false);
// 	const searchInputRef = useRef(null);
// 	const {
// 		showToast,
// 		getAllTableData,
// 		userData,
// 		typeInfo,
// 		setUserData,
// 	} = useGlobalContext();
// 	const { id, tableAccess, tableName } = route.params;

// 	useEffect(() => {

// 		const fetchData = async () => {

// 			try {
// 				setLoading(true);
// 				await getAllTableData(id);
// 			} catch (error) {
// 				console.error('Error fetching data:', error);
// 				showToast({
// 					type: 'ERROR',
// 					message: 'Failed to load data'
// 				});
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		fetchData();
// 	}, [id, getAllTableData, showToast]);

// 	useEffect(() => {
// 		const values = 20 * (20 * index);
// 		const renderData = userData.slice(0, values);
// 		setFlatlistData(renderData);

// 	}, [userData, index]);



// 	const toggleSearch = useCallback(() => {
// 		if (isSearchVisible) {
// 			// Hide search bar
// 			Animated.parallel([
// 				Animated.timing(animation, {
// 					toValue: 0,
// 					duration: 300,
// 					useNativeDriver: false,
// 				}),
// 				Animated.timing(addButtonOpacity, {
// 					toValue: 1,
// 					duration: 300,
// 					useNativeDriver: false,
// 				}),
// 			]).start(() => {
// 				setSearchVisible(false);
// 				setSearchTerm('');
// 			});
// 		} else {
// 			// Show search bar
// 			setSearchVisible(true);
// 			Animated.parallel([
// 				Animated.timing(animation, {
// 					toValue: 1,
// 					duration: 300,
// 					useNativeDriver: false,
// 				}),
// 				Animated.timing(addButtonOpacity, {
// 					toValue: 0,
// 					duration: 150,
// 					useNativeDriver: false,
// 				}),
// 			]).start(() => {
// 				// Focus search input after animation completes
// 				if (searchInputRef.current) {
// 					searchInputRef.current.focus();
// 				}
// 			});
// 		}
// 	}, [isSearchVisible, animation, addButtonOpacity]);

// 	// Focus search input when it becomes visible
// 	useEffect(() => {
// 		if (isSearchVisible && searchInputRef.current) {
// 			searchInputRef.current.focus();
// 		}
// 	}, [isSearchVisible]);

// 	const filteredData = useMemo(() => {
// 		if (!searchTerm.trim()) return userData.slice(0, 20);

// 		return flatlistData.filter(item => {
// 			if (!item) return false;
// 			return Object.entries(item).some(([key, value]) => {
// 				if (key === '__ID') return false;

// 				if (value == null) return false;
// 				return String(value).toLowerCase().includes(searchTerm.toLowerCase());
// 			});
// 		});
// 	}, [userData, searchTerm, flatlistData]);

// 	const ListEmptyComponent = React.useCallback(() => (
// 		<View style={styles.emptyContainer}>
// 			<Feather name="database" size={rs(50)} color="#CCC" />
// 			<Text style={styles.emptyText}>No data found</Text>
// 		</View>
// 	), []);

// 	// Footer with loading indicator - memoized
// 	const renderFooter = React.useCallback(() => {
// 		if (!loadingMore) return null;

// 		return (
// 			<View style={styles.footerLoader}>
// 				<UIActivityIndicator color={'#4D8733'} size={rs(20)} />
// 			</View>
// 		);
// 	}, [loadingMore]);

// 	// Calculate search width based on animation value
// 	const searchWidth = animation.interpolate({
// 		inputRange: [0, 1],
// 		outputRange: [0, SCREEN_WIDTH - rs(130)],
// 	});

// 	const navigation = useNavigation();

// 	const renderItem = ({ item }) => (
// 		<View>
// 			<View style={styles.cardHeader}>
// 				<View style={styles.leftCardHeader}>
// 					<TouchableOpacity
// 						// onPress={() => handleCircleSelect(index)}
// 						onPress={() => setDeleteSelected(!true)}
// 						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
// 					>
// 						<View>
// 							{deleteSelected ? (
// 								<View style={styles.selectedCircle}>
// 									<AntDesign name='checkcircle' size={responsiveFontSize(2)} color={'#4D8733'} />
// 								</View>
// 							) : (
// 								<Feather name='circle' size={responsiveFontSize(2)} color={'black'} />
// 							)}
// 						</View>
// 					</TouchableOpacity>
// 				</View>
// 				<View style={styles.rightCardHeader}>
// 					<TouchableOpacity
// 						// onPress={onEdit}
// 						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
// 					>
// 						<View style={styles.headerRightIcon}>
// 							<MaterialIcons name={'edit'} size={responsiveFontSize(2)} color={'black'} />
// 						</View>
// 					</TouchableOpacity>
// 					<TouchableOpacity
// 						// onPress={onDelete}
// 						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
// 					>
// 						<View style={styles.headerRightIcon}>
// 							<DeleteSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)} />
// 						</View>
// 					</TouchableOpacity>
// 				</View>
// 			</View>
// 			<View style={styles.headerLine} />
// 			<View>
// 				<View style={[styles.dataRow, isLast && styles.noBorder]}>
// 					<Text
// 						style={styles.rowLabel}
// 						numberOfLines={1}
// 						ellipsizeMode="tail"
// 					>
// 						{field}
// 					</Text>

// 					{isImageUrl || isDriveUrl ? (
// 						<TouchableOpacity
// 							onPress={() => {
// 								setVisible(true);
// 								setImageUri(value);
// 							}}
// 							style={{ flex: 1 }}
// 						>
// 							<Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
// 								Click here
// 							</Text>
// 						</TouchableOpacity>
// 					) : (
// 						<Text
// 							style={[combinedTextStyle, cellStyle]}
// 							numberOfLines={1}
// 							ellipsizeMode="tail"
// 						>
// 							{value}
// 						</Text>
// 					)}
// 				</View>
// 			</View>
// 		</View>
// 	)



// 	return (
// 		<SafeAreaView style={styles.container}>
// 			<StatusBar backgroundColor={'#F4FAF4'} barStyle={'dark-content'} />

// 			{/* Header with table name */}
// 			<View style={styles.header}>
// 				<Text style={styles.usersText}>Table</Text>
// 				<TouchableOpacity
// 					style={styles.backButton}
// 					onPress={() => navigation.goBack()}
// 					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
// 				>
// 					<Feather name="chevron-left" size={rs(22)} color="black" />
// 					<Text style={styles.headerTitle}>{tableName}</Text>
// 				</TouchableOpacity>
// 			</View>

// 			{/* Actions bar with fixed height */}
// 			<View style={styles.actionsBar}>
// 				<View style={{ flexDirection: 'row', }}>
// 					<TouchableOpacity
// 						style={styles.iconButton}
// 						onPress={toggleSearch}
// 						hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
// 					>
// 						<SearchSvg width={rs(20)} height={rs(20)} />
// 					</TouchableOpacity>

// 					<Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
// 						{isSearchVisible && (
// 							<TextInput
// 								ref={searchInputRef}
// 								style={styles.searchInput}
// 								placeholder="Search..."
// 								placeholderTextColor="#888"
// 								value={searchTerm}
// 								onChangeText={setSearchTerm}
// 								numberOfLines={1}
// 								ellipsizeMode="tail"
// 							/>
// 						)}
// 					</Animated.View>
// 				</View>

// 				<View style={{ flexDirection: 'row', }}>
// 					<TouchableOpacity
// 						onPress={() => setModalVisible(true)}
// 						style={styles.iconButton}
// 					>
// 						<DeleteSvg2
// 							strokeColor={'#4D8733'}
// 							fillColor={'#4D8733'}
// 							width={rs(22)}
// 							height={rs(22)}
// 						/>
// 					</TouchableOpacity>

// 					<Animated.View style={{ opacity: addButtonOpacity }}>
// 						<TouchableOpacity
// 							onPress={() => navigation.navigate('UserAddNewData', {
// 								id: id,
// 								typeInfo: typeInfo
// 							})}
// 							hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
// 							style={styles.addButton}
// 						>
// 							<AddUsersSvg width={rs(20)} height={rs(20)} />
// 							<Text style={styles.addButtonText}>Add New Data</Text>
// 						</TouchableOpacity>
// 					</Animated.View>
// 				</View>
// 			</View>

// 			<FlatList
// 				data={filteredData}
// 				renderItem={renderItem}
// 				ListEmptyComponent={ListEmptyComponent}
// 				ListFooterComponent={renderFooter}
// 				onEndReached={() => setIndex(index + 1)}
// 				onEndReachedThreshold={0.5}
// 				// contentContainerStyle={
// 				// 	data.length === 0 ? { flex: 1 } : { paddingBottom: rs(20) }
// 				// }
// 				showsVerticalScrollIndicator={false}
// 			/>

// 		</SafeAreaView>
// 	);
// };

// export default AllUserData;

// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 		backgroundColor: '#F4FAF4',
// 	},
// 	header: {
// 		flexDirection: 'row',
// 		alignItems: 'center',
// 		marginTop: Platform.OS === 'ios' ? rs(40) : rs(10),
// 		marginBottom: rs(10),
// 		paddingHorizontal: rs(15),
// 	},
// 	backButton: {
// 		flexDirection: 'row',
// 		alignItems: 'center',
// 	},
// 	usersText: {
// 		color: '#848486',
// 		fontSize: rf(14),
// 		fontFamily: 'Poppins-Regular',
// 		marginRight: rs(2),
// 	},
// 	headerTitle: {
// 		color: '#222327',
// 		fontSize: rf(16),
// 		fontFamily: 'Poppins-Medium',
// 		marginLeft: rs(2),
// 	},

// 	actionsBar: {
// 		flexDirection: 'row',
// 		paddingHorizontal: rs(15),
// 		height: rs(50),
// 		gap: rs(10),
// 		marginVertical: rs(5),
// 	},

// 	leftSection: {
// 		flexDirection: 'row',
// 		alignItems: 'center',
// 		flex: 1, // Take available space
// 	},

// 	// Right side of actions bar
// 	rightSection: {
// 		flexDirection: 'row',
// 		alignItems: 'center',
// 		justifyContent: 'flex-end',
// 	},

// 	// Icons with consistent styling
// 	iconButton: {
// 		width: rs(40),
// 		height: rs(40),
// 		borderRadius: rs(8),
// 		backgroundColor: '#FFF',
// 		elevation: 3,
// 		shadowColor: '#000',
// 		shadowOffset: { width: 0, height: 1 },
// 		shadowOpacity: 0.1,
// 		shadowRadius: 2,
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		borderWidth: 0.6,
// 		borderColor: '#EBE7F3',
// 		marginRight: rs(10),
// 	},

// 	// Search container with fixed height
// 	searchContainer: {
// 		height: rs(40),
// 		justifyContent: 'center',
// 		overflow: 'hidden', // Prevents content from showing during animation
// 	},

// 	// Search input with appropriate text styling
// 	searchInput: {
// 		height: '100%',
// 		width: '100%',
// 		backgroundColor: '#FFF',
// 		fontSize: rf(14),
// 		fontFamily: 'Poppins-Regular',
// 		borderRadius: rs(8),
// 		paddingHorizontal: rs(15),
// 		borderColor: '#DDD',
// 		borderWidth: 1,
// 		includeFontPadding: false, // Helps with text vertical alignment
// 		textAlignVertical: 'center', // Center text vertically
// 	},

// 	addButton: {
// 		flexDirection: 'row',
// 		alignItems: 'center',
// 		justifyContent: 'center',
// 		paddingHorizontal: rs(10),
// 		paddingVertical: rs(8),
// 		backgroundColor: '#FFF',
// 		borderColor: '#4D8733',
// 		borderWidth: 1,
// 		borderRadius: rs(10),
// 		height: rs(40),
// 	},

// 	addButtonText: {
// 		fontSize: rf(14),
// 		color: 'black',
// 		fontFamily: 'Poppins-Medium',
// 		marginLeft: rs(5),
// 	},
// 	form: {
// 		backgroundColor: '#FFF',
// 		borderRadius: rs(15),
// 		padding: rs(15),
// 		borderColor: '#ECF3E9',
// 		borderWidth: 1,
// 		marginVertical: rs(8),
// 		width: '90%',
// 		alignSelf: 'center',
// 		shadowColor: '#000',
// 		shadowOffset: { width: 0, height: 2 },
// 		shadowOpacity: 0.05,
// 		shadowRadius: 3,
// 		elevation: 1,
// 	},
// 	cardHeader: {
// 		flexDirection: 'row',
// 		justifyContent: 'space-between',
// 		alignItems: 'center',
// 	},
// 	leftCardHeader: {
// 		flexDirection: 'row',
// 		gap: rs(10),
// 		width: '65%',
// 		alignItems: 'center',
// 	},
// 	rightCardHeader: {
// 		flexDirection: 'row',
// 		gap: rs(10),
// 		alignItems: 'center',
// 	},
// 	headerRightIcon: {
// 		backgroundColor: '#EEF5ED',
// 		borderRadius: rs(15),
// 		width: rs(30),
// 		height: rs(30),
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 	},
// 	selectedCircle: {
// 		width: rs(30),
// 		height: rs(30),
// 		borderRadius: rs(15),
// 		backgroundColor: '#E7F4E3',
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 	},
// 	headerLine: {
// 		marginTop: rs(12),
// 		marginBottom: rs(5),
// 		borderBottomWidth: 1,
// 		borderColor: '#BDC3D4',
// 	},
// 	dataRow: {
// 		flexDirection: 'row',
// 		paddingVertical: rs(10),
// 		paddingHorizontal: rs(5),
// 		borderBottomWidth: 1,
// 		borderBottomColor: '#EEEFF6',
// 	},
// 	noBorder: {
// 		borderBottomWidth: 0,
// 	},
// 	rowLabel: {
// 		flex: 1,
// 		color: '#222327',
// 		fontSize: rf(13),
// 		fontFamily: 'Poppins-Regular',
// 	},
// 	rowValue: {
// 		flex: 1,
// 		color: '#767A8D',
// 		fontSize: rf(13),
// 		fontFamily: 'Poppins-Regular',
// 	},
// 	viewMoreContainer: {
// 		flexDirection: 'row',
// 		paddingHorizontal: rs(20),
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		marginTop: rs(10),
// 	},
// 	viewMoreContainerText: {
// 		color: '#4D8733',
// 		fontSize: rf(14),
// 		fontFamily: 'Poppins-Medium',
// 	},
// 	emptyContainer: {
// 		flex: 1,
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		padding: rs(40),
// 	},
// 	emptyText: {
// 		marginTop: rs(15),
// 		fontSize: rf(16),
// 		color: '#666',
// 		fontFamily: 'Poppins-Medium',
// 	},
// 	footerLoader: {
// 		flexDirection: 'row',
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		paddingVertical: rs(10),
// 	},
// });