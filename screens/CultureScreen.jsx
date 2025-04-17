import React, { useContext, useEffect, useState } from "react";
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
import { Picker } from "@react-native-picker/picker";
import Header from "../components/Header";
import WebViewModal from "../components/WebViewModal";
import { translateText } from "../services/GoogleTranslateService";
import { TranslationContext } from "../context/TranslationContext";

const sections = [
  {
    id: "umeke",
    title: "Umeke",
    text: "Based in North County San Diego, UMEKE is a 501(c)(3) organization dedicated to the preservation, perpetuation and education of Hawaiian culture. Their vision is to educate local communities through cross-cultural learning, embracing an intersectional approach to work towards the equity and advancement of all marginalized and underserved populations.",
    links: [{ label: "Homepage", url: "https://www.umeke.org/" }],
  },
  {
    id: "language",
    title: "Language Course",
    text: "As a part of the CSUSM U-Act Project you will find information here on language and education programs for the Pacific Islander Community. These programs are The Chamoru Language Immersion Experience and The Gagana Sāmoa Language Performing Arts Program. The Chamoru Language Immersion Experience is an educational initiative designed to immerse participants in the Chamoru language and culture. The Gagana Sāmoa Language Performing Arts Program focuses on teaching the Sāmoan language (Gagana Samoa) and traditional Samoan performing arts.",
    links: [
      { label: "CSUSM U-ACT", url: "https://www.csusm.edu/apida/uact.html" },
    ],
  },
  {
    id: "movementCourse",
    title: "Movement Course",
    text: "Kūhai Hālau O ʻIlima Pā ʻŌlapa Kahiko (KHOI) stands as a traditional hālau hula (hula school), located in the coastal community of Oceanside, CA. Our hālau is passionately committed to fostering cultural learning among our haumāna (students) through the art of hula. At the core of our mission is the dedication to learning, teaching, and perpetuating every facet of hula, drawn from our ancestral lineage.",
    links: [{ label: "KHOI Homepage", url: "https://www.kahulaoilima.com/" }],
  },
  {
    id: "mindfullMovement",
    title: "MindFull Movement",
    text: "MindFull Movement is all about creating space for belonging. The Oceanside-based dance and movement collective is a haven of healthy self-expression, wellness, and healing for Native Hawaiian and Pacific Islander (NHPI) and Black, Indigenous and People of Color (BIPOC) individuals.",
    links: [
      {
        label: "Instagram Account",
        url: "https://www.instagram.com/mindfull.movement/?igsh=NTc4MTIwNjQ2YQ%3D%3D",
      },
    ],
  },
  {
    id: "other",
    title: "Other",
    text: "Coming soon",
    links: [],
  },
];

const CultureScreen = () => {
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: "" });
  const { lang, setLang } = useContext(TranslationContext);
  const [headerTitle, setHeaderTitle] = useState("Culture, Arts, & Language");
  const [localizedSections, setLocalizedSections] = useState(sections);

  useEffect(() => {
    async function localizeAll() {
      const ht = await translateText("Culture, Arts, & Language", lang);
      const secs = await Promise.all(
        sections.map(async (sec) => {
          const title = await translateText(sec.title, lang);
          const text = await translateText(sec.text, lang);
          const links = await Promise.all(
            sec.links.map(async (ln) => ({
              ...ln,
              label: await translateText(ln.label, lang),
            }))
          );
          return { ...sec, title, text, links };
        })
      );
      setHeaderTitle(ht);
      setLocalizedSections(secs);
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
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ImageBackground
        source={require("../assets/beach-bg.jpg")}
        resizeMode="cover"
        style={styles.image}
        blurRadius={0}
      >
        <Header title={headerTitle} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={{ margin: 5, borderRadius: 10 }}>
            {localizedSections.map((sec) => (
              <View key={sec.id} style={textBox.container}>
                <Text style={textBox.title}>{sec.title}</Text>
                <Text style={textBox.text}>{sec.text}</Text>
                {sec.links.map((ln) => (
                  <TouchableOpacity
                    key={ln.label}
                    onPress={() => callWebView(ln.url)}
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
  );
};

export default CultureScreen;

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
  },
  text: {
    color: "black",
  },
  link: {
    padding: 0,
    color: "rgba(45, 72, 135, 1)",
    fontSize: 18,
  },
});
