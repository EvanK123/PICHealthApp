// screens/CultureScreen.jsx
import React, { useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import WebViewModal from "../components/WebViewModal";
import { useTranslation } from "../hooks/useTranslation";

const CultureScreen = () => {
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: "" });
  const { t, getServices } = useTranslation();

  // Localized content
  const headerTitle = t("culture.title");
  const localizedSections = getServices("culture");

  const callWebView = (url) => {
    Platform.OS === "web"
      ? Linking.openURL(url)
      : setModalConfig({ isVisible: true, url });
  };

  const closeModal = () => setModalConfig((p) => ({ ...p, isVisible: false }));

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ImageBackground
        source={require("../assets/beach-bg.jpg")}
        resizeMode="cover"
        style={styles.image}
        blurRadius={0}
      >
        {/* Header on this tab WITHOUT Submit button */}
        <Header title={headerTitle} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={{ margin: 5, borderRadius: 10 }}>
            {localizedSections.map((sec) => (
              <View key={sec.id} style={textBox.container}>
                <Text style={textBox.title}>{sec.title}</Text>
                <Text style={textBox.text}>{sec.text}</Text>

                {sec.links.map((ln, idx) => (
                  <TouchableOpacity
                    key={`${sec.id}-link-${idx}`}
                    onPress={() => callWebView(ln.url)}
                    activeOpacity={0.8}
                  >
                    <Text style={textBox.link}>{ln.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>

      <WebViewModal
        url={modalConfig.url}
        isVisible={modalConfig.isVisible}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
};

export default CultureScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, width: "100%", height: "100%" },
  scrollContent: { paddingVertical: 10 },
});

const textBox = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, .9)",
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgba(45, 72, 135, 1)",
    marginBottom: 6,
  },
  text: { color: "black", marginBottom: 8 },
  link: {
    color: "rgba(45, 72, 135, 1)",
    fontSize: 18,
    paddingVertical: 2,
  },
});
