import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.errorText}>
              {this.state.error && this.state.error.toString()}
            </Text>
            {this.state.errorInfo && (
              <Text style={styles.errorInfo}>
                {this.state.errorInfo.componentStack}
              </Text>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 10,
  },
  errorInfo: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;

