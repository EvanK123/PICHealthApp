import React, { useContext, useState } from "react";
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
import { useTranslation } from "../hooks/useTranslation";

const AboutUs = () => {
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: "" });
  const { lang, setLang } = useContext(TranslationContext);
  const { t } = useTranslation();
  
  // Get localized content
  const headerTitle = t("aboutUs.title");
  const desc1 = t("aboutUs.description1");
  const desc2 = t("aboutUs.description2");
  const missionTitle = t("aboutUs.missionTitle");
  const missionText = t("aboutUs.missionText");
  const landTitle = t("aboutUs.landTitle");
  const landText = t("aboutUs.landText");

  const callWebView = (url) => {
    Platform.OS === "web"
      ? Linking.openURL(url)
      : setModalConfig({ isVisible: true, url });
  };

  const closeModal = () => {
    setModalConfig((p) => ({ ...p, isVisible: false }));
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground
          source={require("../assets/beach-bg.jpg")}
          style={styles.image}
          blurRadius={0}
          resizeMode="cover"
        >
          <Header title={headerTitle} />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                padding: 20,
              }}
            >
              <Image
                source={require("../assets/pic-health-logo-TEXT.png")}
                style={{ height: 150, width: 350 }}
                resizeMode="stretch"
              />
            </View>

            <View style={styles.textBoxContainer}>
              <Text style={textBox.text}>{desc1}</Text>
              <Text style={textBox.text}>{desc2}</Text>
              <TouchableOpacity
                onPress={() =>
                  callWebView(
                    "https://pacificislandercommunityhealth.weebly.com/about-us.html"
                  )
                }
              >
                <Image
                  source={require("../assets/picteam.jpeg")}
                  style={styles.groupPhoto}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
            </View>

            <Seperator />

            <View style={styles.textBoxContainer}>
              <Text style={textBox.title}>{missionTitle}</Text>
              <Text style={textBox.text}>{missionText}</Text>
            </View>

            <Seperator />

            <View style={styles.textBoxContainer}>
              <Text style={textBox.title}>{landTitle}</Text>
              <Text style={textBox.text}>{landText}</Text>
            </View>
          </ScrollView>
        </ImageBackground>
        <WebViewModal
          url={modalConfig.url}
          isVisible={modalConfig.isVisible}
          onClose={closeModal}
        />
      </SafeAreaView>
    </View>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingVertical: 10,
  },
  textBoxContainer: {
    backgroundColor: "rgba(255, 255, 255, .9)",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
  },
  groupPhoto: {
    alignSelf: "center",
    height: 250,
    width: 350,
    marginTop: 10,
    borderRadius: 10,
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
