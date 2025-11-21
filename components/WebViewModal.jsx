import React, { useEffect, useRef, useState, useContext } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { TranslationContext } from "../context/TranslationContext";

// Conditional WebView import to avoid web issues
const RNWebView = Platform.OS === "web" ? null : require("react-native-webview").WebView;

export default function WebViewModal({ url, isVisible, onClose, title }) {
  const { t } = useContext(TranslationContext);
  const defaultTitle = title || t('common.browser');
  const [webKey, setWebKey] = useState(0);
  const webRef = useRef(null);

  useEffect(() => {
    if (isVisible) setWebKey(k => k + 1); // new key = fresh WebView each open
  }, [isVisible]);

  const handleClose = () => onClose?.();

  const isWeb = Platform.OS === "web";

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{defaultTitle}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>{t('common.close')}</Text>
        </TouchableOpacity>
      </View>

      {isWeb ? (
        <View style={styles.webFallback}>
          <Text style={{ marginBottom: 8 }}>
            {t('webView.notSupported')}
          </Text>
          <Text style={{ color: "#2d4887" }}>{url}</Text>
        </View>
      ) : (
        <View style={styles.webContainer}>
          <RNWebView
            key={webKey}
            ref={webRef}
            source={{ uri: url }}
            incognito
            cacheEnabled={false}
            sharedCookiesEnabled={false}
            thirdPartyCookiesEnabled={false}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={["*"]}
            setSupportMultipleWindows={false}
            startInLoadingState
            onShouldStartLoadWithRequest={(req) => true}
            injectedJavaScriptBeforeContentLoaded={`
              try { sessionStorage.clear(); localStorage.clear(); } catch (e) {}
              true;
            `}
            onContentProcessDidTerminate={() => webRef.current?.reload()}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: "#eef2ff" },
  closeText: { color: "#2d4887", fontWeight: "600" },
  webFallback: { padding: 16, backgroundColor: "#fff", flex: 1 },
  webContainer: { flex: 1, backgroundColor: "#fff" },
});
