import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import database from '@react-native-firebase/database';
import {useRoute} from '@react-navigation/native';
import Auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

export default function TaskScreen() {
  const [inputTextValue, setInputTextValue] = useState(null);
  const [list, setList] = useState(null);
  const [isUpdateData, setIsUpdateData] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  const route = useRoute();
  const {email, uid} = route.params;

  const navigation = useNavigation();

  useEffect(() => {
    getDatabase();
  }, []);

  const getDatabase = async () => {
    try {
      const data = await database()
        .ref('tasks')
        .on('value', tempData => {
          console.log(data);
          setList(tempData.val());
        });
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddData = async () => {
    try {
      if (inputTextValue.length > 0) {
        const index = list.length;
        const response = await database().ref(`tasks/${index}`).set({
          value: inputTextValue,
        });

        console.log(response);

        setInputTextValue('');
      } else {
        alert('Please Enter Value & Then Try Again');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateData = async () => {
    try {
      if (inputTextValue.length > 0) {
        const response = await database()
          .ref(`tasks/${selectedCardIndex}`)
          .update({
            value: inputTextValue,
          });

        console.log(response);
        setInputTextValue('');
        setIsUpdateData(false);
      } else {
        alert('Please Enter Value & Then Try Again');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleCardPress = (cardIndex, cardValue) => {
    try {
      setIsUpdateData(true);
      setSelectedCardIndex(cardIndex);
      setInputTextValue(cardValue);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCardLongPress = (cardIndex, cardValue) => {
    try {
      Alert.alert('Alert', `Are You Sure To Delete ${cardValue} ?`, [
        {
          text: 'Cancel',
          onPress: () => {
            console.log('Cancel Is Press');
          },
        },
        {
          text: 'Ok',
          onPress: async () => {
            try {
              const response = await database()
                .ref(`tasks/${cardIndex}`)
                .remove();

              setInputTextValue('');
              setIsUpdateData(false);
              console.log(response);
            } catch (err) {
              console.log(err);
            }
          },
        },
      ]);

      // setIsUpdateData(true);
      // setSelectedCardIndex(cardIndex);
      // setInputTextValue(cardValue);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <View>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            marginVertical: 10,
            fontSize: 24,
            fontWeight: 'bold',
            color: 'black',
          }}>
          MyTask App
        </Text>

        <View style={{marginVertical: 10, color: 'black'}}>
          <Text style={{color: 'black', fontWeight: 'bold', fontSize: 24}}>
            ThankYou {email}, Please Add Task
          </Text>
        </View>

        <TextInput
          style={styles.inputBox}
          placeholder="Enter Your Task"
          value={inputTextValue}
          onChangeText={value => setInputTextValue(value)}
        />
        {!isUpdateData ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddData()}>
            <Text style={{color: '#fff'}}>Add Task</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleUpdateData()}>
            <Text style={{color: '#fff'}}>Update Task</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={{
          marginVertical: 20,
          width: '80%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'red',
          borderRadius: 20,
          padding: 10,
        }}
        onPress={() => {
          Auth().signOut();
          navigation.navigate("Login");
        }}>
        <Text style={{fontSize: 16, color: 'white'}}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.cardContainer}>
        <Text style={{marginVertical: 20, fontSize: 20, fontWeight: 'bold'}}>
          MyTasks List
        </Text>

        <FlatList
          data={list}
          renderItem={item => {
            const cardIndex = item.index;
            if (item.item !== null) {
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardPress(cardIndex, item.item.value)}
                  onLongPress={() =>
                    handleCardLongPress(cardIndex, item.item.value)
                  }>
                  <Text style={{color: 'white', textAlign: 'center'}}>
                    {item.item.value}
                  </Text>
                </TouchableOpacity>
              );
            }
          }}
        />
      </View>
    </View>
  );
}

const {height, width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  inputBox: {
    width: width - 30,
    borderRadius: 15,
    borderWidth: 2,
    marginVertical: 10,
    padding: 10,
    color: 'blue',
    borderColor: 'red',
    borderWidth: 2,
  },
  addButton: {
    backgroundColor: 'blue',
    alignItems: 'center',
    padding: 10,
    borderRadius: 50,
  },
  cardContainer: {
    marginVertical: 20,
  },
  card: {
    backgroundColor: 'black',
    width: width - 40,
    padding: 20,
    borderRadius: 30,
    marginVertical: 10,
    borderColor: 'yellow',
    borderWidth: 2,
  },
});
