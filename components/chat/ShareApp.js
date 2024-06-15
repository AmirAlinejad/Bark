import { Share } from 'react-native';

const shareAppLink = async () => {
  try {
    const result = await Share.share({
      message: 'Download Bark! Connect with your campus now: [App Link]',
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared with activity type of result.activityType
        console.log('Shared with activity type: ', result.activityType);
      } else {
        // Shared
        console.log('Link shared successfully');
      }
    } else if (result.action === Share.dismissedAction) {
      // Dismissed
      console.log('Share dismissed');
    }
  } catch (error) {
    console.error('Error sharing the link: ', error.message);
  }
};

export default shareAppLink;
