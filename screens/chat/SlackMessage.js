import PropTypes from 'prop-types'
import React from 'react'
import { View, ViewPropTypes, StyleSheet, Text } from 'react-native'

import { Avatar, Day, utils } from 'react-native-gifted-chat'
import Bubble from './SlackBubble'

const { isSameUser, isSameDay } = utils

export default class Message extends React.Component {
  getInnerComponentProps() {
    const { containerStyle, ...props } = this.props
    return {
      ...props,
      position: 'left',
      isSameUser,
      isSameDay,
    }
  }

  renderDay() {
    if (this.props.currentMessage.createdAt) {
      const dayProps = this.getInnerComponentProps()
      if (this.props.renderDay) {
        return this.props.renderDay(dayProps)
      }
      return <Day {...dayProps} />
    }
    return null
  }

  renderBubble() {
    const bubbleProps = this.getInnerComponentProps()
    if (this.props.renderBubble) {
      return this.props.renderBubble(bubbleProps)
    }
    return <Bubble {...bubbleProps} />
  }

  renderAvatar() {
    const { currentMessage, showAvatarForEveryMessage } = this.props;

    if (currentMessage.user && currentMessage.user.avatar) {
        let avatarProps = this.getInnerComponentProps();

        // Conditionally render the username above the avatar if applicable
        let usernameText = showAvatarForEveryMessage || (!isSameUser(currentMessage, this.props.previousMessage) || !isSameDay(currentMessage, this.props.previousMessage)) ? (
            <Text style={styles.usernameAboveAvatar}>{currentMessage.user.name}</Text>
        ) : null;

        return (
            <View style={styles.avatarContainer}>
                {usernameText}
                <Avatar {...avatarProps} imageStyle={styles.avatarImageStyle} />
            </View>
        );
    } else {
        return null;
    }
}



  render() {
    const marginBottom = isSameUser(
      this.props.currentMessage,
      this.props.nextMessage,
    )
      ? 2
      : 10

    return (
      <View>
        {this.renderDay()}
        <View
          style={[
            styles.container,
            { marginBottom },
            this.props.containerStyle,
          ]}
        >
          {this.renderAvatar()}
          {this.renderBubble()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginLeft: 8,
    marginRight: 0,
    marginTop: 20, // Added space for the username to show
  },
  slackAvatar: {
    // The bottom should roughly line up with the first line of message text.
    height: 40,
    width: 40,
    borderRadius: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 5, // Adjust as needed
    position: 'absolute', // Position the avatar container absolutely
    top: 10, // Adjust the top position as needed
    left: 10, // Adjust the left position as needed
    
},
usernameAboveAvatar: {
  fontSize: 12,
  color: '#000',
  marginBottom: 4,
  zIndex: 5, // Ensure it's above other components, adjust as necessary
  backgroundColor: 'transparent',
    
},
})

Message.defaultProps = {
  renderAvatar: undefined,
  renderBubble: null,
  renderDay: null,
  currentMessage: {},
  nextMessage: {},
  previousMessage: {},
  user: {},
  containerStyle: {},
  showAvatarForEveryMessage: true,
}

Message.propTypes = {
  renderAvatar: PropTypes.func,
  renderBubble: PropTypes.func,
  renderDay: PropTypes.func,
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  user: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  showAvatarForEveryMessage: PropTypes.bool,
}