// screen for club admins to view and accept/reject requests
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
// backend
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../backend/FirebaseConfig';
// icons
import { Ionicons } from '@expo/vector-icons';
// functions
import { acceptRequest, declineRequest, getSetRequestsData } from '../../functions/backendFunctions';
// my components
import Header from '../../components/display/Header';
import RequestCard from '../../components/club/RequestCard';
import CustomText from '../../components/display/CustomText';
// styles
import { Colors } from '../../styles/Colors';
import { set } from 'firebase/database';

const Requests = ({ route, navigation }) => { // clean up styles!!!
    // get club id from route
    const { clubId, clubName } = route.params; // get club name for accept/decline request
    const [requests, setRequests] = useState([]);
    
    useEffect(() => {
        getSetRequestsData(setRequests, clubId);
    }, []);

    
    // accept request
    const onAcceptRequest = async (request) => {
        await acceptRequest(clubId, clubName, request.userId);
        getSetRequestsData(setRequests, clubId);
    };
    
    // decline request
    const onDeclineRequest = async (request) => {
        await declineRequest(clubId, request.userId);
        getSetRequestsData(setRequests, clubId);
    };
    
    return (
        <View style={styles.container}>
            <Header text={'Requests'} back navigation={navigation}/>

                {/* Show if no requests */}
                {requests.length === 0 && (
                <View style={{ position: 'absolute', left: Dimensions.get('window').width/2 - 105, top: 350 }}>
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons name="mail" size={100} color={Colors.gray} />
                    <CustomText text="No requests to display." font='bold' style={{ fontSize: 20, color: Colors.darkGray }} />
                    </View>
                </View>
                )}
            
                <FlatList
                    data={requests}
                    renderItem={(item) => (
                        <RequestCard // move accept/decline to request card
                            item={item.item}
                            onPressAccept={() => onAcceptRequest(item.item)}
                            onPressDecline={() => onDeclineRequest(item.item)}
                        />
                    )}
                    keyExtractor={item => item.id}
                    style={styles.requestsContainer}
                    contentContainerStyle={styles.requestsContainer}
                />
    
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    requestsContainer: {
        margin: 10,
    },
});

export default Requests;