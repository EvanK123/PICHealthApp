import React, { useState } from 'react';
import { ImageBackground, Text, View, StyleSheet, ScrollView, Linking, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import WebViewModal from '../components/WebViewModal';

const EducationScreen = () => {
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
        <Header title='Education'/>
        <ScrollView>
          <View style={{ flex: 1, margin: 5, borderRadius: 10 }}>

            <View style={textBox.container}>
              <Text style={textBox.title}>Mana Academy</Text>
              <Text style={textBox.text}>
               Mana is a program of Mira Costa Community College 
               that builds community on campus among Native Hawaiian 
               and Pacific Islander (NHPI) students and offers many 
               support services toward academic, cultural, and personal 
               goals. Mana is a holistic program which provides students 
               with a culturally relevant entry into higher education whilst 
               offering academic and counseling support. 
              </Text>
              <TouchableOpacity onPress={() => callWebView('https://www.miracosta.edu/student-services/student-equity/mana/index.html')} style={{flex: 1}}>
                <Text style={textBox.link}>Mana @ MiraCosta College</Text>
              </TouchableOpacity>
            </View>

            <View style={textBox.container}>
              <Text style={textBox.title}>CSUSM APIDA</Text>
              <Text style={textBox.text}>
              The Asian & Pacific Islander & Desi American (APIDA) 
              Success Initiative strives to inspire and prepare all 
              students for success at CSUSM with care and support. 
              For our low-income, first-generation, and returning students.
              </Text>
              <TouchableOpacity onPress={() => callWebView('https://www.csusm.edu/apida/index.html')} style={{flex: 1}}>
                <Text style={textBox.link}>Homepage</Text>
              </TouchableOpacity>
            </View>

            <View style={textBox.container}>
              <Text style={textBox.title}>How to Apply to College?</Text>
              <Text style={textBox.text}>
              This will guide students through the often complex, competitive, 
              and time-sensitive process of selecting and applying to higher 
              education institutions. These resources help ensure that students 
              make informed decisions, submit strong applications, and ultimately 
              gain access to the educational opportunities that best fit their goals
              and needs. 
              </Text>
              <TouchableOpacity onPress={() => callWebView('https://www.commonapp.org/')} style={{flex: 1}}>
                <Text style={textBox.link}>CommonApp</Text>
              </TouchableOpacity>
            </View>

            <View style={textBox.container}>
              <Text style={textBox.title}>Financial Aid</Text>
              <Text style={textBox.text}>
              FAFSA provides essential support for individuals 
              seeking financial assistance for higher education. 
              The FAFSA is a key tool for students to access federal 
              financial aid, including grants, loans, and work-study 
              opportunities, as well as for state and institutional aid. 
              </Text>
              <TouchableOpacity onPress={() => callWebView('https://studentaid.gov/')} style={{flex: 1}}>
                <Text style={textBox.link}>Federal Student Aid</Text>
              </TouchableOpacity>
            </View>

            <View style={textBox.container}>
              <Text style={textBox.title}>PIC Health Youth Program</Text>
              <Text style={textBox.text}>
               Coming soon
              </Text>
            </View>

            <View style={textBox.container}>
              <Text style={textBox.title}>Testimonials</Text>
              <Text style={textBox.text}>
               Coming soon
              </Text>
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

export default EducationScreen;

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
