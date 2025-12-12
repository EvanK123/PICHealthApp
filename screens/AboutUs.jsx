// screens/AboutUs.jsx
import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Seperator from "../components/Seperator";
import Header from "../components/Header";
import WebViewModal from "../components/WebViewModal";
import { TranslationContext } from "../context/TranslationContext";
import { useAuth } from "../context/AuthContext";
import { useContext } from "react";


const AboutUs = () => {
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: "", title: "" });
  const { t, getAboutUsSections } = useContext(TranslationContext);
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Get avatar URL from user metadata if available
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  
  const handleProfilePress = () => {
    navigation.navigate('Account');
  };

  // Localized strings
  const headerTitle = t("aboutUs.title");
  const desc1 = t("aboutUs.description1");
  const desc2 = t("aboutUs.description2");
  const sections = getAboutUsSections();

  const callWebView = (url, title) => {
    const defaultTitle = title || t('common.browser');
    Platform.OS === "web"
      ? Linking.openURL(url)
      : setModalConfig({ isVisible: true, url, title: defaultTitle });
  };

  const closeModal = () => setModalConfig((p) => ({ ...p, isVisible: false }));

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground
          source={require('../assets/beach-bg.jpg')}
          style={styles.image}
          blurRadius={0}
          resizeMode="cover"
        >
          {/* Hide Submit button on About Us */}
          <Header 
            title={headerTitle} 
            showSubmit={false}
          />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.logoRow}>
              <Image
                source={require('../assets/logo-text.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>

            {/* Main description */}
            <View style={styles.textBoxContainer}>
              <Text style={textBox.introText}>{desc1}</Text>
              
              <Text style={textBox.learnMore}>{desc2}</Text>
              <TouchableOpacity
                onPress={() => {
                  const links = require('../locales/config/links.json');
                  callWebView(links.aboutUs.aboutUsPage, t('app.tabs.aboutUs'));
                }}
                activeOpacity={0.8}
                style={styles.photoContainer}
              >
                <Image
                  source={require('../assets/team.jpeg')}
                  style={styles.groupPhoto}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>

            {/* Dynamically render sections */}
            {sections.map((section, index) => (
              <View key={section.id} style={styles.textBoxContainer}>
                {/* Images removed - section.image not supported */}
                <Text style={textBox.title}>{section.title}</Text>
                <Text style={textBox.text}>{section.text}</Text>
              </View>
            ))}
          </ScrollView>
        </ImageBackground>

        <WebViewModal
          url={modalConfig.url}
          isVisible={modalConfig.isVisible}
          onClose={closeModal}
          title={modalConfig.title}
        />
      </SafeAreaView>
    </View>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  image: { flex: 1, width: "100%", height: "100%" },
  scrollContent: { 
    paddingVertical: 10,
    paddingBottom: 20,
  },
  logoRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoImg: {
    width: "85%",
    height: 100,
    maxWidth: 400,
  },
  textBoxContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoContainer: {
    alignItems: "center",
  },
  groupPhoto: {
    width: "100%",
    height: 200,
    maxWidth: 500,
    borderRadius: 12,
    marginBottom: 8,
  },
});

const textBox = StyleSheet.create({
  image: {
    width: "100%",
    height: 150,
    marginBottom: 12,
    borderRadius: 8,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    textAlign: "left",
  },
  learnMore: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(45, 72, 135, 1)",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "rgba(45, 72, 135, 1)",
    marginBottom: 12,
    marginTop: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    textAlign: "left",
  },
});
