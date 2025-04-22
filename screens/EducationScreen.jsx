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
    id: "mana",
    title: "Mana Academy",
    text: "Mana is a program of Mira Costa Community College that builds community on campus among Native Hawaiian and Pacific Islander (NHPI) students and offers many support services toward academic, cultural, and personal goals. Mana is a holistic program which provides students with a culturally relevant entry into higher education whilst offering academic and counseling support.",
    links: [
      {
        label: "Mana @ MiraCosta College",
        url: "https://www.miracosta.edu/student-services/student-equity/mana/index.html",
      },
    ],
  },
  {
    id: "apida",
    title: "CSUSM APIDA",
    text: "The Asian & Pacific Islander & Desi American (APIDA) Success Initiative strives to inspire and prepare all students for success at CSUSM with care and support. For our low-income, first-generation, and returning students.",
    links: [
      {
        label: "Homepage",
        url: "https://www.csusm.edu/apida/index.html",
      },
    ],
  },
  {
    id: "apply",
    title: "How to Apply to College?",
    text: "This will guide students through the often complex, competitive, and time-sensitive process of selecting and applying to higher education institutions. These resources help ensure that students make informed decisions, submit strong applications, and ultimately gain access to the educational opportunities that best fit their goals and needs.",
    links: [
      {
        label: "CommonApp",
        url: "https://www.commonapp.org/",
      },
    ],
  },
  {
    id: "financialAid",
    title: "Financial Aid",
    text: "FAFSA provides essential support for individuals seeking financial assistance for higher education. The FAFSA is a key tool for students to access federal financial aid, including grants, loans, and work-study opportunities, as well as for state and institutional aid.",
    links: [
      {
        label: "Federal Student Aid",
        url: "https://studentaid.gov/",
      },
    ],
  },
  {
    id: "youth",
    title: "PIC Health Youth Program",
    text: "Coming soon",
    links: [],
  },
  {
    id: "testimonials",
    title: "Testimonials",
    text: "Coming soon",
    links: [],
  },
  {
    id: "other",
    title: "Other",
    text: "Coming soon",
    links: [],
  },
];

const EducationScreen = () => {
  const { lang, setLang } = useContext(TranslationContext);
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: "" });
  const [headerTitle, setHeaderTitle] = useState("Education");
  const [localizedSections, setLocalizedSections] = useState(sections);

  useEffect(() => {
    async function localizeAll() {
      const ht = await translateText("Education", lang);
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

export default EducationScreen;

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
