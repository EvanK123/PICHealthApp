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
import Disclaimer from "../components/Disclaimer";
import WebViewModal from "../components/WebViewModal";
import { translateText } from "../services/GoogleTranslateService";
import { TranslationContext } from "../context/TranslationContext";

const sections = [
  {
    id: "diabetes",
    title: "Diabetes Screening",
    text: "This test is used to identify individuals who may have diabetes or are at risk of developing the condition, often before they show any noticeable symptoms.",
    links: [
      {
        label: "Risk Test",
        url: "https://www.cdc.gov/prediabetes/risktest/index.html",
      },
    ],
  },
  {
    id: "mental",
    title: "Mental Wellness Resources",
    text: "Mental health resources are designed to support individuals in managing their emotional, psychological, and social well‑being. Their purpose is to provide tools, guidance, and services to help people understand, cope with, and address mental challenges.",
    links: [
      {
        label: "Mental Health 101",
        url: "https://screening.mhanational.org/mental-health-101/",
      },
      {
        label: "Depression Screening",
        url: "https://screening.mhanational.org/screening-tools/depression/?ref",
      },
    ],
  },
  {
    id: "truecare",
    title: "True Care",
    text: "TrueCare is one of the most trusted healthcare providers in San Diego and Riverside Counties. Their friendly staff and compassionate physicians specialize in providing quality healthcare and wellness services to underserved communities so people can get the care they need. Their goal is to make healthcare available to everyone in the communities they serve, regardless of income or insurance status.",
    links: [{ label: "Homepage", url: "https://truecare.org/" }],
  },
  {
    id: "vista",
    title: "Vista Community Clinic",
    text: "Valuable Connected Care: Meeting the health and wellness needs of our community. A community where every person chooses health.",
    links: [
      {
        label: "Homepage",
        url: "https://www.vistacommunityclinic.org/",
      },
    ],
  },
  {
    id: "mindfulness",
    title: "Mindfulness Resources",
    text: "Mindfulness resources are designed to help individuals cultivate awareness, presence, and acceptance of the present moment. These resources aim to promote mental and emotional well‑being by teaching practices that encourage mindfulness—essentially the practice of paying attention in a particular way: on purpose, in the present moment, and without judgment.",
    links: [
      {
        label: "Mindful CSUSM",
        url: "https://www.csusm.edu/mindfulcsusm/resources/index.html",
      },
    ],
  },
  {
    id: "movement",
    title: "Movement & Nutrition",
    text: "Movement and nutrition resources empower individuals to take charge of their health by providing the tools, knowledge, and guidance they need to make informed decisions about physical activity and dietary choices. The combined effect of regular movement and proper nutrition supports overall well‑being, reduces disease risk, enhances mental health, improves energy, and promotes longevity.",
    links: [
      {
        label: "Chronic Disease Indicators",
        url: "https://www.cdc.gov/cdi/indicator-definitions/npao.html",
      },
    ],
  },
  {
    id: "other",
    title: "Other",
    text: "Screening for cancer allows you to improve prognosis, reduce mortality, identify early detection, and give you peace of mind.",
    links: [
      {
        label: "Cancer Screening",
        url: "https://www.cancer.org/cancer/screening/american-cancer-society-guidelines-for-the-early-detection-of-cancer.html",
      },
    ],
  },
];

const HealthScreen = () => {
  const { lang, setLang } = useContext(TranslationContext);
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: "" });
  const [headerTitle, setHeaderTitle] = useState("Health");
  const [headerDesc, setHeaderDesc] = useState(
    "The information provided here is for general informational purposes only and is not intended as medical advice. Always consult with a qualified healthcare provider for advice regarding your specific medical condition, symptoms, or treatment options. Do not disregard professional medical advice or delay seeking treatment."
  );
  const [localizedSections, setLocalizedSections] = useState(sections);

  useEffect(() => {
    async function localizeAll() {
      const ht = await translateText("Health", lang);
      const hd = await translateText(headerDesc, lang);
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
      setHeaderDesc(hd);
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
        <Header title={headerTitle}>
          <Disclaimer description={headerDesc} />
        </Header>
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

export default HealthScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, width: "100%", height: "100%" },
  scrollContent: { paddingVertical: 10 },
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
  text: { color: "black" },
  link: {
    padding: 0,
    color: "rgba(45, 72, 135, 1)",
    fontSize: 18,
  },
});
