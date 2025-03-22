import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import WebView from 'react-native-webview';

const WebViewModal = ({ url, isVisible, onClose }) => {
  return (
    // Basis of the WebView Popup
    <Modal
      animationType='slide'
      // State for when it should appear, on pages that use it
      visible={isVisible} 
      onRequestClose={onClose}
    >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => onClose()}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.webviewContainer}>
            <WebView
              source={{ uri: url }}
              style={styles.webview}
              onError={onClose}
            />
          </View>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'ios' ? 50 : 0,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 10,
    minHeight: 44,
  },
  closeButton: {
    padding: 8,
    marginLeft: 10,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});

export default WebViewModal;
