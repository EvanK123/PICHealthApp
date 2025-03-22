import React, { useState, useEffect } from 'react';
import { Platform, Modal, View, Text, TouchableOpacity, StyleSheet, Linking, FlatList } from 'react-native';
import RenderHtml from 'react-native-render-html';
import WebViewModal from './WebViewModal';

// Popup component to display event details or welcome message in a modal
const Popup = ({ visible, onClose, mode = "event", events }) => {
  if (mode === "event" && (!events || events.length === 0)) return null;
  
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: '' });

  // Function to handle link presses within the HTML content
  const handleLinkPress = (event, href) => {
    callWebView(href);
  };

  const callWebView = (url) => {
    Platform.OS === 'web' ? 
      Linking.openURL(url) :
      setModalConfig({ isVisible: true, url });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <Modal transparent={true} visible={visible} animationType='slide' onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {mode === "event" ? (
            <FlatList
              data={events}
              keyExtractor={(item, index) => item.id + index}
              renderItem={({ item }) => (
                <View style={styles.eventContainer}>
                  <Text style={styles.title}>{item.summary}</Text>
                  {item.description ? (
                    <RenderHtml
                      contentWidth={300}
                      source={{ html: item.description }}
                      defaultTextProps={{ selectable: true }}
                      renderersProps={{ a: { onPress: handleLinkPress } }}
                    />
                  ) : (
                    <Text style={styles.noDescription}>No description available</Text>
                  )}
                  <Text style={styles.eventTime}>
                    {new Date(item.start.dateTime || item.start.date).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.eventTime}>{item.location}</Text>
                </View>
              )}
            />
          ) : (
            <View>
              <Text style={styles.welcomeTitle}>Welcome to PIC Health</Text>
              <Text style={styles.welcomeText}>Your personal health assistant is here to help.</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <WebViewModal url={modalConfig.url} isVisible={modalConfig.isVisible} onClose={closeModal} />
    </Modal>
  );
};

export default Popup;

// Styles for the Popup component
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  eventContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2d4887',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});