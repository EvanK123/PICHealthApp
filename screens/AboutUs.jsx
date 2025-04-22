import React, { useContext, useEffect, useState } from "react";
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
import { Picker } from "@react-native-picker/picker";
import Seperator from "../components/Seperator";
import Header from "../components/Header";
import WebViewModal from "../components/WebViewModal";
import { translateText } from "../services/GoogleTranslateService";
import { TranslationContext } from "../context/TranslationContext";

const AboutUs = () => {
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: "" });
  const { lang, setLang } = useContext(TranslationContext);
  const [headerTitle, setHeaderTitle] = useState("About Us");
  const [desc1, setDesc1] = useState(
    "Established in 2013, Pacific Islander Community Health (PIC Health) serves the Southern California region, by advancing health equity and social justice for Pacific Islander communities through culturally centered health initiatives and community-centered research. PIC Health is dedicated to promoting wellness and resilience by addressing the unique health needs and disparities our Pasifika communities endure and navigate every day."
  );
  const [desc2, setDesc2] = useState("Learn more:");
  const [missionTitle, setMissionTitle] = useState("Our Mission");
  const [missionText, setMissionText] = useState(
    "At PIC Health, our mission is to empower and uplift the Pacific Islander community by promoting holistic health and wellness initiatives rooted in cultural sensitivity and community engagement. Through collaborative research, advocacy, and education, we strive to address indigenous health disparities, foster equitable access to healthcare, and cultivate a thriving environment where every individual can achieve their highest level of well-being."
  );
  const [landTitle, setLandTitle] = useState("Land Acknowledgement");
  const [landText, setLandText] = useState(
    "We acknowledge that the land on which we gather is the traditional territory of the Luiseño/Payómkawichum people. PIC Health and its surrounding areas are still home to the six federally recognized bands of the La Jolla, Pala, Pauma, Pechanga, Rincon, Soboba Luiseño/Payómkawichum people."
  );

  useEffect(() => {
    async function localizeAll() {
      const ht = await translateText("About Us", lang);
      const d1 = await translateText(desc1, lang);
      const d2 = await translateText("Learn more:", lang);
      const mt = await translateText("Our Mission", lang);
      const mtxt = await translateText(missionText, lang);
      const lt = await translateText("Land Acknowledgement", lang);
      const ltxt = await translateText(landText, lang);
      setHeaderTitle(ht);
      setDesc1(d1);
      setDesc2(d2);
      setMissionTitle(mt);
      setMissionText(mtxt);
      setLandTitle(lt);
      setLandText(ltxt);
    }
    localizeAll();
  }, [lang]);

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
        <View style={styles.langPickerFloating}>
          <Picker selectedValue={lang} onValueChange={setLang} mode="dropdown">
            <Picker.Item label="English" value="en" />
            <Picker.Item label="Español" value="es" />
            <Picker.Item label="Samoan" value="sm" />
            <Picker.Item label="Chamorro" value="ch" />
            <Picker.Item label="Tongan" value="to" />
          </Picker>
        </View>
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
  langPickerFloating: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 140,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
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
