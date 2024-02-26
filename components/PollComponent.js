import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Poll from './PollComponent';

const PollComponent = () => {
  const [poll, setPoll] = useState({
    title: 'What is your favorite color?',
    options: ['Red', 'Green', 'Blue'],
    results: {} // Initialize results object
  });

  const onVote = (option) => {
    setPoll({
      ...poll,
      results: {
        ...poll.results,
        [option]: (poll.results[option] || 0) + 1,
      },
    });
  };

  return (
    <View>
      <Poll title={poll.title} options={poll.options} onVote={onVote} />
      <Text>Poll results:</Text>
      {Object.keys(poll.results).map((option) => (
        <Text key={option}>{option}: {poll.results[option]}</Text>
      ))}
    </View>
  );
};

export default PollComponent;
