import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
// storage
import AsyncStorage from '@react-native-async-storage/async-storage';
// my components
import Header from '../../components/display/Header';
import SearchBar from '../../components/input/SearchBar';
import ProfileImg from '../../components/display/ProfileImg';
import CustomText from '../../components/display/CustomText';
import ToggleButton from '../../components/buttons/ToggleButton';
import ProfileOverlay from '../../components/overlays/ProfileOverlay';
// Firebase
import { ref, get, remove, update, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, firestore } from '../../backend/FirebaseConfig';
// icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure react-native-vector-icons is installed
// functions
import { getSetEventAttendance, getAttendeesData } from '../../functions/backendFunctions';
// styles
import { Colors } from '../../styles/Colors';

const AttendanceViewer = ({ route, navigation }) => {
    const { eventId } = route.params;
    // states
    const [attendees, setAttendees] = useState([]);
    const [attendeesData, setAttendeesData] = useState([]);
     // overlay
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayUserData, setOverlayUserData] = useState({});
    // loading
    const [loading, setLoading] = useState(true);
  
    // get attendees on initial render
    useEffect(() => {

        getSetEventAttendance(eventId, setAttendees);
    
    }, []);

    // once attendees are gathered, get those users' data
    useEffect(() => {

        if (attendees.length > 0) {
            getAttendeesData(attendees, setAttendeesData);
        }

    }, [attendees]);

    const renderMember = ({ item }) => {
        console.log(item);
        return (
            <View style={styles.memberContainer}>      
                <View style={styles.memberInfo}>
                    <TouchableOpacity onPress={() => {
                        setOverlayVisible(true);
                        setOverlayUserData(item);
                    }} style={styles.avatarContainer}>
                    <ProfileImg profileImg={item.profileImg} width={50} />
                </TouchableOpacity>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '75%'}}>
                    <View style={{ flex: 1}}>
                        <CustomText style={styles.memberName} text={`${item.firstName} ${item.lastName}`} font="bold"/>
                        <CustomText style={styles.memberPrivilege} text={`@${item.userName}`} />
                    </View>
                </View>
            </View>
        </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Attendees" back={true} />

      <FlatList
        data={attendeesData}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        style={{paddingHorizontal: 0, backgroundColor: Colors.white}}
      />

      {/* Overlay */}
      <ProfileOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        userData={overlayUserData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  searchBarView: {
    margin: 15,
    marginTop: 5,
    marginBottom: 15,
  },
  upperContent: {
    justifyContent: 'flex-start',
    backgroundColor: Colors.white,
    paddingTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingBottom: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  filterText: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    width: '95%',
    marginRight: 20,
    backgroundColor: Colors.lightGray,
  },
  memberContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  memberInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  memberPrivilege: {
    fontSize: 16,
    color: Colors.darkGray,
    marginRight: -5,
    textTransform: 'capitalize',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});

export default AttendanceViewer;
