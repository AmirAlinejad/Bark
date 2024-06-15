import Filter from 'bad-words';

const filter = new Filter();

// Normalize the message by removing spaces and special characters
const normalizeMessage = (message) => {
  return message.replace(/[\s\W_]+/g, '').toLowerCase();
};

const filterMessage = (message) => {
  if (!message) return message;

  const normalizedMessage = normalizeMessage(message);
  const badWords = filter.list;
  let containsBadWord = false;

  for (const badWord of badWords) {
    if (normalizedMessage.includes(badWord.toLowerCase())) {
      containsBadWord = true;
      break;
    }
  }

  if (containsBadWord) {
    // Replace bad words in the original message
    let cleanedMessage = message;
    badWords.forEach((badWord) => {
      const regex = new RegExp(badWord, 'gi');
      cleanedMessage = cleanedMessage.replace(regex, '*'.repeat(badWord.length));
    });
    return cleanedMessage;
  }

  return message;
};

export default filterMessage;
