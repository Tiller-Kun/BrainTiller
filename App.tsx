import React, { useState, useEffect } from 'react';
import { Modal, Text, TextInput, View, Button, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Keyboard, Alert, PermissionsAndroid, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalendarPicker from 'react-native-calendar-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SendSMS from 'react-native-sms';
import DateTimePicker from '@react-native-community/datetimepicker';

const defaultStyles = StyleSheet.create({
  container: {
    flex: 2, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'lightcyan',
  },
  padContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'lightcyan',
    padding: 15,
  },
});

function ScheduleScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loggedDate, setLoggedDate] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    saveEvents();
  }, [events]);

  const loadEvents = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('events');
      if (storedEvents !== null) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.error('Error loading events from AsyncStorage:', error);
    }
  };

  const saveEvents = async () => {
    try {
      await AsyncStorage.setItem('events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to AsyncStorage:', error);
    }
  };

  const dateChange = (date) => {
    setModalVisible(true);
    setEventTitle('');
    setEventStartTime('');
    setEventEndTime('');
    setLoggedDate(date);
  };

  const addEvent = () => {
    const newEvent = {
      title: eventTitle,
      start: eventStartTime,
      end: eventEndTime,
      date: loggedDate.format('MMMM DD, YYYY'),
    };

    setEvents([...events, newEvent]);
    setModalVisible(false);
  };

  const cancelEvent = () => {
    setModalVisible(false);
  };

  const deleteEvent = (index) => {
    const removeEvents = [...events];
    removeEvents.splice(index, 1);
    setEvents(removeEvents);
  };

  return (
    <View style={defaultStyles.container}>
      <Text style={{ color: 'black', marginBottom: 40, textAlign: 'center', }}>Click the Month, Date, or Year to Start!</Text>
      <CalendarPicker onDateChange={dateChange} />
      
      <Modal visible={modalVisible} >
        <Text style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', }}>BrainTiller ~ Build Your Schedule Here! </Text>
        <TextInput style={defaultStyles.padContainer} placeholder="Title" value={eventTitle} onChangeText={(text) => setEventTitle(text)} />
        <TextInput style={defaultStyles.padContainer} placeholder="Start Time" value={eventStartTime} onChangeText={(text) => setEventStartTime(text)} />
        <TextInput style={defaultStyles.padContainer} placeholder="End Time" value={eventEndTime} onChangeText={(text) => setEventEndTime(text)} />
        <Button title="Add" onPress={addEvent} />
        <Button title="Cancel" onPress={cancelEvent}/>
      </Modal>
            {events.map((event, index) => (
        <View key={index}>
          <Text style={{ color: 'black', marginTop: 10, }}>{event.date}, {event.title}, {event.start}-{event.end}</Text>
          <TouchableOpacity onPress={() => deleteEvent(index)} style={{ padding: 2, alignItems: 'center', }}>
              <Ionicons name="trash-outline" size={18} color="red" />
            </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function ToDoScreen() {
  const [doItems, setDoItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    loadToDoItems();
  }, []);

  useEffect(() => {
    saveToDoItems();
  }, [doItems]);

  const loadToDoItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem('toDoItems');
      if (storedItems !== null) {
        setDoItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Error loading to-do items from AsyncStorage:', error);
    }
  };

  const saveToDoItems = async () => {
    try {
      await AsyncStorage.setItem('toDoItems', JSON.stringify(doItems));
    } catch (error) {
      console.error('Error saving to-do items to AsyncStorage:', error);
    }
  };

  const toggleChecked = (index) => {
    const tempItems = [...doItems];
    tempItems[index].checked = !tempItems[index].checked;
    setDoItems(tempItems);
  };

  const deleteItem = (index) => {
    const tempItems = [...doItems];
    tempItems.splice(index, 1);
    setDoItems(tempItems);
  };

  const addNewItem = () => {
    if (newItemText !== '') {
      const newID = doItems.length + 1;
      const newItem = { id: newID, text: newItemText, checked: false };
      setDoItems([...doItems, newItem]);
      setNewItemText('');
      Keyboard.dismiss();
    }
  };

  return (
    <View style={toDoStyles.container}>
      <ScrollView>
        {doItems.map((item, index) => (
          <TouchableOpacity key={item.id} style={toDoStyles.itemContainer} onPress={() => toggleChecked(index)}>
            <Ionicons name={item.checked ? 'checkbox-outline' : 'square-outline'} size={24} color={item.checked ? 'green' : 'black'} />
            <Text style={toDoStyles.itemText}>{item.text}</Text>
            <TouchableOpacity onPress={() => deleteItem(index)}>
              <Ionicons name="close-outline" size={24} color="red" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={toDoStyles.inputContainer}>
          <TextInput style={toDoStyles.input} placeholder="Add Items To Do" value={newItemText} onChangeText={(text) => setNewItemText(text)} onSubmitEditing={addNewItem} />
          <TouchableOpacity style={toDoStyles.addButton} onPress={addNewItem}>
            <Text style={toDoStyles.addButtonLabel}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const toDoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightcyan',
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemText: {
    color: 'black',
    marginLeft: 10,
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: 'turquoise',
    padding: 10,
    borderRadius: 5,
  },
  addButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});

function GPSScreen(){
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              setLatitude(position.coords.latitude);
              setLongitude(position.coords.longitude);
            },
            error => {
              setError(error.message);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
          );
        } else {
          setError('Location permission denied.');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    retrieveScheduledTime();
  }, []);

  const handleTimePicker = () => {
    if (scheduledTime === null) {
      setTimePickerVisible(true);
    }
  };

  const handleTimeConfirm = time => {
    if (time instanceof Date) {
      setScheduledTime(time);
    }
    setTimePickerVisible(false);
  };

  const handleTimeCancel = () => {
    setTimePickerVisible(false);
  };

  const handleStop = async () => {
    try {
      await AsyncStorage.removeItem('phoneNumber');
      setPhoneNumber('');
      setScheduledTime(null);
      Alert.alert('Success!', 'You have been unsubscribed from scheduled messages! Add a phone number and time to reschedule sending again.');
    } catch (error) {
      console.warn(error);
    }
  };

  const sendScheduledMessage = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: 'SMS Permission',
          message: 'BrainTiller needs access to send SMS messages so we can send you the location of your loved ones!',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const googleMapsTemplate = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        const messageBody = `Latitude: ${latitude}, Longitude: ${longitude}. Location on Google Maps: ${googleMapsTemplate}`;
        SendSMS.send(
          {
            body: messageBody,
            recipients: [phoneNumber],
          },
          (completed, cancelled, error) => {
            if (completed) {
              Alert.alert('Success', 'SMS sent successfully!');
              storeScheduledTime();
            } else if (cancelled) {
              Alert.alert('Cancelled', 'SMS sending cancelled!');
            } else if (error) {
              Alert.alert('Error', 'Failed to send SMS!');
            }
          },
        );
      } else {
        Alert.alert('Cannot send Location', 'SMS permission denied!');
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const storeScheduledTime = async () => {
    try {
      const currentTime = new Date();
      const nextScheduledTime = new Date(
        scheduledTime.getTime() + 864000000 //24 hours in miliseconds
      );
      if (nextScheduledTime >= currentTime) {
        setScheduledTime(nextScheduledTime);
        await AsyncStorage.setItem('scheduledTime', nextScheduledTime.toString());
      } else {
        setScheduledTime(null);
        await AsyncStorage.removeItem('scheduledTime');
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const retrieveScheduledTime = async () => {
    try {
      const storedScheduledTime = await AsyncStorage.getItem('scheduledTime');
      if (storedScheduledTime !== null) {
        setScheduledTime(new Date(storedScheduledTime));
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <View style={GPSStyles.container}>
      {latitude !== null && longitude !== null ? (
        <View style={GPSStyles.container}>
          <Text style={{color: 'black'}} >{latitude}, {longitude}</Text>
          <TextInput style={GPSStyles.inputBorder} placeholder="Enter phone number" value={phoneNumber} onChangeText={text => setPhoneNumber(text)} />
          {scheduledTime ? (
            <Text style={GPSStyles.input}>
              Scheduled Time: {scheduledTime.toLocaleString()}
            </Text>
          ) : null}
          <TouchableOpacity style={GPSStyles.addButton} onPress={handleTimePicker} >
            <Text style={GPSStyles.addButtonLabel}>{scheduledTime ? 'Scheduled!' : 'Schedule?'}</Text>
          </TouchableOpacity>
          {isTimePickerVisible && (
            <DateTimePicker mode="time" display="clock" value={scheduledTime || new Date()} onChange={(event, time) => handleTimeConfirm(time)} onCancel={handleTimeCancel} />
          )}
          <TouchableOpacity style={GPSStyles.addButton} onPress={sendScheduledMessage} disabled={!phoneNumber || !scheduledTime} >
            <Text style={GPSStyles.addButtonLabel}>Send Location with Scheduled Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={GPSStyles.addButton} onPress={handleStop} >
            <Text style={GPSStyles.addButtonLabel}>Stop or Reschedule</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={GPSStyles.input}>{error || 'GPS Loading Location...'}</Text>
      )}
    </View>
  );
};

const GPSStyles = StyleSheet.create({
  container: {
    color: 'black',
    flex: 2, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'lightcyan',
    textAlign: 'center',
  },
  input: {
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  inputBorder: {
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 5,
    borderColor: 'black',
    padding: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: 'turquoise',
    padding: 10,
    borderRadius: 5,
    marginTop: 4,
    marginBottom: 4,
  },
  addButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});

function WellnessScreen() {
  const [listMeds, setListMeds] = useState([]);
  const [newMedText, setNewMedText] = useState('Medicines: '); 
  const [listDocs, setListDocs] = useState([]);
  const [newDocText, setNewDocText] = useState('Doctor Appointments: ');

  useEffect(() => {
    loadMedicines();
  }, []);
  
  useEffect(() => {
    saveMedicines();
  }, [listMeds]);
  
  useEffect(() => {
    loadDoctorAppointments();
  }, []);
  
  useEffect(() => {
    saveDoctorAppointments();
  }, [listDocs]);
  
  const loadMedicines = async () => {
    try {
      const storedMeds = await AsyncStorage.getItem('medicines');
      if (storedMeds !== null) {
        setListMeds(JSON.parse(storedMeds));
      }
    } catch (error) {
      console.error('Error loading medicines from AsyncStorage:', error);
    }
  };
  
  const saveMedicines = async () => {
    try {
      await AsyncStorage.setItem('medicines', JSON.stringify(listMeds));
    } catch (error) {
      console.error('Error saving medicines to AsyncStorage:', error);
    }
  };
  
  const loadDoctorAppointments = async () => {
    try {
      const storedDocs = await AsyncStorage.getItem('doctorAppointments');
      if (storedDocs !== null) {
        setListDocs(JSON.parse(storedDocs));
      }
    } catch (error) {
      console.error('Error loading doctor appointments from AsyncStorage:', error);
    }
  };
  
  const saveDoctorAppointments = async () => {
    try {
      await AsyncStorage.setItem('doctorAppointments', JSON.stringify(listDocs));
    } catch (error) {
      console.error('Error saving doctor appointments to AsyncStorage:', error);
    }
  };

  const deleteMed = (index) => {
    const tempMed = [...listMeds];
    tempMed.splice(index, 1);
    setListMeds(tempMed);
  };

  const deleteDoc = (index) => {
    const tempDoc = [...listDocs];
    tempDoc.splice(index, 1);
    setListDocs(tempDoc);
  };  

  const addMed = () => {
    if (newMedText !== '') {
      const newMedID = listMeds.length + 1;
      const newMed = { id: newMedID, text: newMedText,};
      setListMeds([...listMeds, newMed]);
      setNewMedText('Medicines: '); 
      Keyboard.dismiss();
    }
  };

  const addDoc = () => {
    if (newDocText !== '') {
      const newDocID = listDocs.length + 1;
      const newDoc = { id: newDocID, text: newDocText,};
      setListDocs([...listDocs, newDoc]);
      setNewDocText('Doctor Appointments: '); 
      Keyboard.dismiss();
    }
  };

  return (
    <View style={wellnessStyles.container}>
      <ScrollView>
        {listMeds.map((med, index) => (
          <TouchableOpacity key={med.id} style={wellnessStyles.wellContainer} onPress={() => deleteMed(index)}>
            <Ionicons name="medical" size={24} color="red" />
            <Text style={wellnessStyles.wellText}>{med.text}</Text>
          </TouchableOpacity>
        ))}
        <View style={wellnessStyles.inputContainer}>
          <TextInput style={wellnessStyles.input} value={newMedText} onChangeText={(text) => setNewMedText(text)} onSubmitEditing={addMed}/>
          <TouchableOpacity style={wellnessStyles.addButton} onPress={addMed}>
            <Text style={wellnessStyles.addButtonLabel}>+</Text>
          </TouchableOpacity>
        </View>
        {listDocs.map((doc, index) => (
          <TouchableOpacity key={doc.id} style={wellnessStyles.wellContainer} onPress={() => deleteDoc(index)}>
            <Ionicons name="bandage" size={24} color="red" />
            <Text style={wellnessStyles.wellText}>{doc.text}</Text>
          </TouchableOpacity>
        ))}
        <View style={wellnessStyles.inputContainer}>
          <TextInput style={wellnessStyles.input} value={newDocText} onChangeText={(text) => setNewDocText(text)} onSubmitEditing={addDoc} />
          <TouchableOpacity style={wellnessStyles.addButton} onPress={addDoc}>
            <Text style={wellnessStyles.addButtonLabel}>+</Text>
          </TouchableOpacity>
        </View>
        <Text>Click Red Symbols to Delete!</Text>
      </ScrollView>
    </View>
  );
};

const wellnessStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightcyan',
    padding: 10,
  },
  wellContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  wellText: {
    color: 'black',
    marginLeft: 10,
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: 'turquoise',
    padding: 10,
    borderRadius: 5,
  },
  addButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});

function GameScreen() {
  const icons = ['pizza-outline', 'person-outline', 'time-outline', 'heart-outline', 'glasses-outline', 'book-outline', 'bicycle-outline', 'bulb-outline', 'american-football-outline', 'balloon-outline', 'boat-outline', 'car-outline', 'cash-outline', 'ear-outline', 'fish-outline', 'home-outline', 'snow-outline', 'leaf-outline', 'water-outline', 'umbrella-outline', 'shirt-outline', 'bed-outline', 'camera-outline', 'eye-outline', 'bus-outline', 'earth-outline', 'boat-outline', 'brush-outline', 'build-outline', 'phone-portrait-outline']
  const [randomIcon, setRandomIcon] = useState('');

  const checkPress = () => {
    const randomIndex = Math.floor(Math.random() * icons.length);
    const selectedIcon = icons[randomIndex];
    setRandomIcon(selectedIcon);
  };

  return (
    <View style={defaultStyles.container}>
      <Text style={{color: 'black', textAlign: 'center', marginBottom: 40, fontSize: 20, padding: 10,  }}>Name the Symbol Out Loud and then Press the Button.</Text>
      <Button title="Press for Item!" onPress={checkPress} />
      <Ionicons style={{marginTop: 40, }} name={randomIcon} size={75} color="turquoise" />
    </View>
  );
}

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Schedule') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'To Do List') {
          iconName = focused ? 'list-circle' : 'list-circle-outline';
        } else if (route.name === 'GPS') {
          iconName = focused ? 'location' : 'location-outline';
        } else if (route.name === 'Wellness') {
          iconName = focused ? 'medkit' : 'medkit-outline';
        } else if (route.name === 'Symbol Game') {
          iconName = focused ? 'game-controller' : 'game-controller-outline';
        }

        // You can return any component that you like here!
        return <Ionicons name={iconName} size={size} color={color} />;
      },})}>
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="To Do List" component={ToDoScreen} />
      <Tab.Screen name="GPS" component={GPSScreen} />
      <Tab.Screen name="Wellness" component={WellnessScreen} />
      <Tab.Screen name="Symbol Game" component={GameScreen} />
    </Tab.Navigator>
  );
}

const loadingStyles = {
  text1: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
  },
  text2: {
    color: 'black',
    fontSize: 13,
  },
  heart: {
    marginTop: 45,
  }
};

function LoadingScreen() {
  const [isLoading, checkIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkIsLoading(false);
    }, 3500); 

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={defaultStyles.container}>
        <Text style={loadingStyles.text1}>Welcome to BrainTiller!</Text>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={loadingStyles.text2}>Fight Alzheimer's and Dementia.</Text>
        <Text style={loadingStyles.text2}>Improve Cognitive Wellness!</Text>
        <Ionicons style={loadingStyles.heart} name="heart-circle-outline" size={40} color="red" />
      </View>
    );
  } else {
    return (
      <NavigationContainer>
        <MyTabs/>
      </NavigationContainer>
    );
  }
}

export default function App() {
  return (
    <LoadingScreen />
  );
}