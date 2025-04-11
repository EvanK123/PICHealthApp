import React, { useState, useEffect } from 'react';
import { Platform, Modal, View, Text, TouchableOpacity, StyleSheet, Linking, FlatList, Image } from 'react-native';
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
          <TouchableOpacity 
            style={styles.closeIconButton} 
            onPress={onClose}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
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
              <Image
                source={require('../assets/pic-logo.png')}
                style={styles.welcomeLogo}
                resizeMode='contain'
              />
              <Text style={styles.welcomeTitle}>Welcome to PIC Health!</Text>
              <Text style={styles.betaText}>Beta</Text>
              <Text style={styles.disclaimerText}>
                <Text style={styles.disclaimerBold}>Disclaimer:</Text> This site is for educational use only. Consult a doctor for medical advice. In an emergency, call 911.
              </Text>
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
    width: 400,
    maxHeight: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d4887',
  },
  eventContainer: {
    marginBottom: 20,
    paddingTop: 10,
    paddingRight: 20,
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
  welcomeLogo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 20,
  },
  betaText: {
    fontSize: 18,
    color: '#2d4887',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  disclaimerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  disclaimerBold: {
    fontWeight: 'bold',
  },
});