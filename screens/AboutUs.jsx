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
import Seperator from "../components/Seperator";
import Header from "../components/Header";
import WebViewModal from "../components/WebViewModal";
import { TranslationContext } from "../context/TranslationContext";
import { useContext } from "react";

const AboutUs = () => {
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: "", title: "" });
  const { t, getAboutUsSections } = useContext(TranslationContext);

  // Localized strings
  const headerTitle = t("aboutUs.title");
  const desc1 = t("aboutUs.description1");
  const desc2 = t("aboutUs.description2");
  const sections = getAboutUsSections();

  const callWebView = (url, title = "Browser") => {
    Platform.OS === "web"
      ? Linking.openURL(url)
      : setModalConfig({ isVisible: true, url, title });
  };

  const closeModal = () => setModalConfig((p) => ({ ...p, isVisible: false }));

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground
          source={require("../assets/beach-bg.jpg")}
          style={styles.image}
          blurRadius={0}
          resizeMode="cover"
        >
          {/* Hide Submit button on About Us */}
          <Header title={headerTitle} showSubmit={false} />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.logoRow}>
              <Image
                source={require("../assets/pic-health-logo-TEXT.png")}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>

            <View style={styles.textBoxContainer}>
              <Text style={textBox.text}>{desc1}</Text>
              <Text style={textBox.text}>{desc2}</Text>

              <TouchableOpacity
                onPress={() => {
                  const links = require('../locales/links.json');
                  callWebView(links.aboutUs.aboutUsPage, "About Us");
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../assets/picteam.jpeg")}
                  style={styles.groupPhoto}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>

            {/* Dynamically render sections */}
            {sections.map((section, index) => (
              <React.Fragment key={section.id}>
                <Seperator />
                <View style={styles.textBoxContainer}>
                  <Text style={textBox.title}>{section.title}</Text>
                  <Text style={textBox.text}>{section.text}</Text>
                </View>
              </React.Fragment>
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
  scrollContent: { paddingVertical: 10 },
  logoRow: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoImg: {
    width: "85%",
    height: 120,
    maxWidth: 420,
  },
  textBoxContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
  },
  groupPhoto: {
    alignSelf: "center",
    width: "100%",
    height: 220,
    maxWidth: 520,
    borderRadius: 10,
    marginTop: 10,
  },
});

const textBox = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "sans-serif",
    color: "black",
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: "300",
    fontFamily: "sans-serif",
    color: "hsl(200, 50%, 50%)",
    marginBottom: 10,
  },
});
