import React, { useState, useContext } from 'react';
import { Platform, Modal, View, Text, TouchableOpacity, StyleSheet, Linking, FlatList, Image, Dimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import WebViewModal from './WebViewModal';
import { TranslationContext } from '../context/TranslationContext';
import { normalize, spacing, isTablet, wp, hp } from '../utils/responsive';


// Popup component to display event details or welcome message in a modal
const Popup = ({ visible, onClose, mode = "event", events, event, navigation }) => {
  const { t } = useContext(TranslationContext);
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: '', title: '' });

  // Normalize events - support both single event and array of events
  let eventList = [];
  if (mode === "event") {
    if (event) {
      eventList = [event];
    } else if (events) {
      eventList = Array.isArray(events) ? events : [events];
    }
    if (eventList.length === 0) return null;
  }

  // Function to handle link presses within the HTML content
  const handleLinkPress = (event, href) => {
    callWebView(href);
  };

  const callWebView = (url, title) => {
    const defaultTitle = title || t('common.browser');
    Platform.OS === 'web' ? 
      Linking.openURL(url) :
      setModalConfig({ isVisible: true, url, title: defaultTitle });
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
              data={eventList}
              keyExtractor={(item, index) => (item.id || item.name || index).toString()}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <View style={styles.eventContainer}>
                  <Text style={styles.title}>{item.summary || item.name}</Text>
                  {item.description ? (
                    <RenderHtml
                      contentWidth={isTablet() ? wp(60) : wp(80)}
                      source={{ html: item.description }}
                      defaultTextProps={{ selectable: true }}
                      renderersProps={{ a: { onPress: handleLinkPress } }}
                    />
                  ) : (
                    <Text style={styles.noDescription}>{t('calendar.noDescriptionAvailable')}</Text>
                  )}
                  <Text style={styles.eventTime}>
                    {(() => {
                      // Check if it's an all-day event
                      const isAllDay = item.start?.date && !item.start?.dateTime;
                      if (isAllDay) {
                        return t('calendar.allDay');
                      }
                      // Use the time property if available (already formatted)
                      if (item.time) {
                        return item.time;
                      }
                      // Otherwise format from dateTime
                      if (item.start?.dateTime) {
                        return new Date(item.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      }
                      return '';
                    })()}
                  </Text>
                  {item.location && <Text style={styles.eventTime}>{item.location}</Text>}
                  {navigation && (
                    <TouchableOpacity
                      style={styles.commentButton}
                      onPress={() => {
                        onClose();
                        navigation.navigate('MainTabs', { 
                          screen: 'Comments',
                          params: {
                            eventTitle: item.summary || item.name,
                            eventId: item.id
                          }
                        });
                      }}
                    >
                      <Text style={styles.commentButtonText}>{t('comments.viewComments')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          ) : (
            <View>
              <Image
                source={require('../assets/logo.png')}
                style={styles.welcomeLogo}
                resizeMode='contain'
              />
              <Text style={styles.welcomeTitle}>{t('popup.welcomeTitle')}</Text>
              <Text style={styles.betaText}>{t('popup.beta')}</Text>
              <Text style={styles.disclaimerText}>
                <Text style={styles.disclaimerBold}>{t('popup.disclaimer')}</Text> {t('popup.disclaimerText')}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>{t('popup.getStarted')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <WebViewModal url={modalConfig.url} isVisible={modalConfig.isVisible} onClose={closeModal} title={modalConfig.title} />
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
    paddingHorizontal: spacing.md,
  },
  container: {
    width: isTablet() ? wp(70) : wp(90),
    maxWidth: normalize(500),
    maxHeight: '80%',
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderRadius: normalize(10),
    padding: spacing.md,
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: normalize(30),
    height: normalize(30),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeIcon: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#2d4887',
  },
  eventContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: '#9ca3af',
    marginVertical: spacing.md,
    marginHorizontal: spacing.lg,
  },
  title: {
    fontSize: normalize(isTablet() ? 24 : 20),
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  noDescription: {
    fontSize: normalize(isTablet() ? 16 : 14),
    color: '#555',
    marginBottom: spacing.sm,
  },
  eventTime: {
    fontSize: normalize(isTablet() ? 16 : 14),
    color: '#555',
    marginTop: spacing.sm,
  },
  closeButton: {
    marginTop: spacing.lg,
    backgroundColor: '#2d4887',
    padding: spacing.md,
    borderRadius: normalize(5),
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: normalize(isTablet() ? 18 : 16),
  },
  welcomeTitle: {
    fontSize: normalize(isTablet() ? 28 : 24),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeLogo: {
    width: normalize(isTablet() ? 220 : 180),
    height: normalize(isTablet() ? 220 : 180),
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  betaText: {
    fontSize: normalize(isTablet() ? 20 : 18),
    color: '#2d4887',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  disclaimerText: {
    fontSize: normalize(isTablet() ? 16 : 14),
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: '#333',
  },
  disclaimerBold: {
    fontWeight: 'bold',
  },
  commentButton: {
    marginTop: spacing.md,
    backgroundColor: '#2d4887',
    paddingVertical: normalize(12),
    paddingHorizontal: spacing.lg,
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: normalize(200),
    alignSelf: 'center',
  },
  commentButtonText: {
    color: 'white',
    fontSize: normalize(isTablet() ? 15 : 13),
    fontWeight: '600',
  },
});