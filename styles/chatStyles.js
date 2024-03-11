// chatStyles.js
import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingHorizontal: 10,
    
  },
  clubNameButton: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  searchButton: {
    marginLeft: 'auto',
    marginRight: 10,
  },
  customToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginTop: -50,
    
    
  },
  input: {
    flex: 1,
    minHeight: 30,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  toolbarButton: {
    padding: 5,
    marginLeft: 4,
    marginRight: 4,
  },
  pinnedMessagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Add some right margin for spacing
  },
 
  pinnedMessagesText: {
    color: 'blue',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  bubbleWrapperStyle: ({ position }) => ({
    right: position === 'right' ? {
      backgroundColor: 'white',
      marginRight: 0,
      flex: 1,
      minHeight: 40,
    } : {},
    left: position === 'left' ? {
      backgroundColor: "white",
      marginLeft: 0,
      flex: 1,
      minHeight: 40,
    } : {},
  }),
  bubbleTextStyle: {
    right: { color: 'black' },
    left: { color: 'black' },
  },
  bubbleTimeTextStyle: {
    right: { color: 'black' },
    left: { color: 'black' },
  },
  likeButtonImage: {
    position: 'absolute',
    right: 100,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  likeButton: {
    position: 'absolute',
    right: 300,
    bottom: 10,
  },

  likeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  likeCount: { marginLeft: 5 },
 
  messagesContainer: {
    backgroundColor: 'white',
    width: '100%',
    paddingBottom: 45,
  },
  textInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#333',
    padding: 10,
    fontSize: 16,
  },
  usernameText: {
    fontSize: 12,
    paddingHorizontal: 5,
    paddingTop: 2,
    paddingBottom: 2,
    // Common style for username text
  },
  usernameRight: {
    // Specific style for the current user's username
    alignSelf: 'flex-end',
    color: 'gray', // Example color
  },
  usernameLeft: {
    // Specific style for other users' usernames
    alignSelf: 'flex-start',
    color: 'gray', // Example color
  },
  dateText: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#666',
    paddingVertical: 8,
  },
  messageImageContainer: {
    position: 'relative',
    padding: 0,
    flexDirection: 'column',
    alignItems: 'flex-start', // Align items to the start to keep the image and button aligned
  },
 
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 13, // Optional: for styled image edges
  },
  likeButtonCurrentUser: {
    position: 'fixed',
    right: -275, // Adjust the left position as needed
    bottom: -35,
  },
  likeButtonOtherUser: {
    position: 'fixed',
    right: -275, // Adjust the right position as needed
    bottom: -35,
  },
  clubNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  imageContainer: {
    width: 30,
    height: 30,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: 'lightgray', // Placeholder background color
  },
  parentContainer: {
    flex: 1,
    position: 'relative',
  },
  
  expandedButtonsContainer: {
    position: 'absolute',
    bottom: 60, // Adjust this value as needed
    right: 200, // Adjust this value as needed
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 10,
    zIndex: 1, // Ensure the expanded buttons are above other elements except the main button
  },
  expandedButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
});
