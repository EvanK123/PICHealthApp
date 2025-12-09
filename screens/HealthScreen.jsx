import React, { useContext, useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header";
import Disclaimer from "../components/Disclaimer";
import WebViewModal from "../components/WebViewModal";
import { TranslationContext } from "../context/TranslationContext";
import { useAuth } from "../context/AuthContext";


const HealthScreen = () => {
  const { t, getServices } = useContext(TranslationContext);
  const navigation = useNavigation();
  const { user } = useAuth();
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: "", title: "" });
  
  // Get avatar URL from user metadata if available
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  
  const handleProfilePress = () => {
    navigation.navigate('Account');
  };

  // Get localized content
  const headerTitle = t("health.title");
  const headerDesc = t("health.description");
  const localizedSections = getServices("health");

  const callWebView = (url, title) => {
    const defaultTitle = title || t('common.browser');
    Platform.OS === "web"
      ? Linking.openURL(url)
      : setModalConfig({ isVisible: true, url, title: defaultTitle });
  };

  const closeModal = () => {
    setModalConfig((p) => ({ ...p, isVisible: false }));
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ImageBackground
        source={require('../assets/beach-bg.jpg')}
        resizeMode="cover"
        style={styles.image}
        blurRadius={0}
      >
        <Header 
          title={headerTitle}
          avatarUrl={avatarUrl}
          onPressProfile={handleProfilePress}
        >
          <Disclaimer description={headerDesc} />
        </Header>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.reflectionContainer}>
            <Text style={styles.reflectionTitle}>{t('health.reflection.title')}</Text>
            <Text style={styles.reflectionDisclaimer}>{t('health.reflection.disclaimer')}</Text>
            <TextInput
              style={styles.reflectionInput}
              placeholder={t('health.reflection.placeholder')}
              placeholderTextColor="rgba(0,0,0,0.4)"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          <View style={{ margin: 5, borderRadius: 10 }}>
            {localizedSections.map((sec) => (
              <View key={sec.id} style={textBox.container}>
                {/* Images removed - sec.image not supported */}
                <Text style={textBox.title}>{sec.title}</Text>
                <Text style={textBox.text}>{sec.text}</Text>
                {sec.links.map((ln, idx) => (
                  <TouchableOpacity
                    key={`${sec.id}-link-${idx}`}
                    onPress={() => callWebView(ln.url, ln.label)}
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
        title={modalConfig.title}
      />
    </SafeAreaView>
  );
};

export default HealthScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, width: "100%", height: "100%" },
  scrollContent: { paddingVertical: 10 },
  reflectionContainer: {
    backgroundColor: "rgba(255, 255, 255, .9)",
    marginHorizontal: 5,
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  reflectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgba(45, 72, 135, 1)",
    marginBottom: 8,
  },
  reflectionDisclaimer: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: 12,
  },
  reflectionInput: {
    backgroundColor: "rgba(248, 250, 252, 1)",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 1)",
    minHeight: 120,
  },
});

const textBox = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, .9)",
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: 150,
    marginBottom: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgba(45, 72, 135, 1)",
  },
  text: { color: "black", marginBottom: 8 },
  link: {
    padding: 0,
    color: "rgba(45, 72, 135, 1)",
    fontSize: 18,
  },
});
