import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';

// URLPreview component
const URLPreview = ({ displayText }) => {
  const [links, setLinks] = useState([]);

  // Extract links from displayText
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundLinks = displayText.match(urlRegex);
    setLinks(foundLinks || []);
  }, [displayText]);

  // Handle link press to open URL
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  // Render the text with hyperlinks and previews
  const renderTextWithPreviews = () => {
    if (!displayText) return null;

    const parts = displayText.split(/(https?:\/\/[^\s]+)/g);

    return (
      <Text style={styles.displayText}>
        {parts.map((part, index) => {
          if (links.includes(part)) {
            return (
              <React.Fragment key={`link-${index}`}>
                {index > 0 && !links.includes(parts[index - 1]) && (
                  <Text key={`text-${index - 1}`}>{parts[index - 1]}</Text>
                )}
                <Text style={styles.linkText} onPress={() => handleLinkPress(part)} key={`text-link-${index}`}>
                  {part}
                </Text>
                <View style={styles.previewContainer} key={`view-${index}`}>
                  <URLPreviewItem key={`preview-${index}`} url={part} onPress={handleLinkPress} />
                </View>
              </React.Fragment>
            );
          } else if (!links.includes(parts[index + 1])) {
            return <Text key={`text-${index}`}>{part}</Text>;
          }
          return null;
        })}
      </Text>
    );
  };

  return <View style={styles.container}>{renderTextWithPreviews()}</View>;
};

// URLPreviewItem component to fetch and display the URL preview
const URLPreviewItem = ({ url, onPress }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchLinkPreview = async () => {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        const descriptionMatch = html.match(/<meta name="description" content="(.*?)"/);
        const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/);

        if (titleMatch && descriptionMatch && imageMatch) {
          setPreview({
            url,
            title: titleMatch[1],
            description: descriptionMatch[1],
            image: imageMatch[1],
          });
        }
      } catch (error) {
        console.error('Error fetching link preview:', error);
      }
    };

    fetchLinkPreview();
  }, [url]);

  if (!preview) {
    return null;
  }

  return (
    <TouchableOpacity onPress={() => onPress(url)} style={styles.preview}>
      {preview.image ? <Image source={{ uri: preview.image }} style={styles.previewImage} /> : null}
      <Text style={styles.previewTitle}>{preview.title}</Text>
      <Text style={styles.previewDescription}>{preview.description}</Text>
    </TouchableOpacity>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  displayText: {
    fontSize: 14,
    flexWrap: 'wrap',
  },
  linkText: {
    color: '#2980b9',
    fontSize: 14,
    flexWrap: 'wrap',
  },
  previewContainer: {
    marginTop: 0, // Add space between text and preview
    marginBottom: 10, // Add space after preview
  },
  preview: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: '100%',
    marginTop: 10,
  },
  previewImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 7,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewDescription: {
    fontSize: 14,
  },
});

export default URLPreview;
