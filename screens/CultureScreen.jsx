import React, { useState } from 'react';
import { ImageBackground, Text, View, StyleSheet, Linking, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import WebViewModal from '../components/WebViewModal';

const CultureScreen = () => {
  // State for WebView stuff. isVisible is when to show the browser,
  // url is the link that the browser is opening to
  const [modalConfig, setModalConfig] = useState({isVisible: false, url: ''});

  const callWebView = (url) => {
    Platform.OS === 'web' ? 
      Linking.openURL(url) :
      setModalConfig({
        isVisible: true,
        url: url
      });
  };

  const closeModal = () => {
    setModalConfig(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ImageBackground
        source={require('../assets/beach-bg.jpg')}
        resizeMode='cover'
        style={styles.image}
        blurRadius={0}
      >
        <Header title='Culture, Arts, & Language'/>
        <ScrollView>
          <View style={{ flex: 1, margin: 5, borderRadius: 10 }}>

            <View style={textBox.container}>
              <Text style={textBox.title}>Umeke</Text>
              <Text style={textBox.text}>
              Based in North County San Diego, UMEKE is a 
              501(c)(3) organization dedicated to the preservation, 
              perpetuation and education of Hawaiian culture. Their 
              vision is to educate local communities through cross-cultural 
              learning, embracing an intersectional approach to work towards 
              the equity and advancement of all marginalized and underserved 
              populations.  
              </Text>
              <TouchableOpacity onPress={() => callWebView('https://www.umeke.org/')}>
                <Text style={textBox.link}>Homepage</Text>
              </TouchableOpacity>
            </View>

            <View style={textBox.container}>
              <Text style={textBox.title}>Language Course</Text>
              <Text style={textBox.text}>
              As a part of the CSUSM U-Act Project you will find information 
              here on language and education programs for the Pacific Islander 
              Community. These programs are The Chamoru Language Immersion Experience 
              and The Gagana Sāmoa Language Performing Arts Program. The Chamoru 
              Language Immersion Experience is an educational initiative designed 
              to immerse participants in the Chamoru language and culture. The Gagana 
              Sāmoa Language Performing Arts Program focuses on teaching the Sāmoan 
              language (Gagana Samoa) and traditional Samoan performing arts. 
              </Text>
              <TouchableOpacity onPress={() => callWebView('https://www.csusm.edu/apida/uact.html ')}>
                <Text style={textBox.link}>CSUSM U-ACT</Text>
              </TouchableOpacity>
            </View>

            <View style={textBox.container}>
              <Text style={textBox.title}>Movement Course</Text>
              <Text style={textBox.text}>
              Kūhai Hālau O ʻIlima Pā ʻŌlapa Kahiko (KHOI) stands 
              as a traditional hālau hula (hula school), located in 
              the coastal community of Oceanside, CA. Our hālau is 
              passionately committed to fostering cultural learning 
              among our haumāna (students) through the art of hula. 
              At the core of our mission is the dedication to learning, 
              teaching, and perpetuating every facet of hula, drawn from 
              our ancestral lineage. 
              </Text>
              <TouchableOpacity onPress={() => callWebView('https://www.kahulaoilima.com/')}>
                <Text style={textBox.link}>
                  KHOI Homepage
                </Text>
              </TouchableOpacity>
            </View>

            <View style={textBox.container}>
              <Text style={textBox.title}>MindFull Movement</Text>
              <Text style={textBox.text}>MindFull Movement is all about creating space for belonging. The Oceanside-based dance and movement collective is a haven of hejalthy self-expression, wellness, and healing for Native Hawaiian and Pacific Islander (NHPI) and Black, Indigenous and People of Color (BIPOC) individuals.</Text>
              <TouchableOpacity onPress={() => callWebView('https://www.instagram.com/mindfull.movement/?igsh=NTc4MTIwNjQ2YQ%3D%3D')}>
                <Text style={textBox.link}>Instagram Account</Text>
              </TouchableOpacity>
            </View>

            <View style={textBox.container}>
              <Text style={textBox.title}>Other</Text>
              <Text style={textBox.text}>
                Coming soon
              </Text>
            </View>

          </View>
        </ScrollView>
      </ImageBackground>

      {/*Web Browser*/}
      <WebViewModal url={modalConfig.url} isVisible={modalConfig.isVisible} onClose={closeModal} />

    </SafeAreaView>
  );
}

export default CultureScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

const textBox = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, .9)',
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(45, 72, 135, 1)',
  },
  text: {
    color: 'black',
  },
  link: {
    padding: 0,
    color: 'rgba(45, 72, 135, 1)',
    fontSize: 18,
  }
});
