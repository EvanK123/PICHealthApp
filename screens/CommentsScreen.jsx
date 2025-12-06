import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TranslationContext } from '../context/TranslationContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';

export default function CommentsScreen({ route, navigation }) {
  const { t } = useContext(TranslationContext);
  const { user } = useAuth();
  const { eventTitle, eventId } = route.params || {};
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const fetchComments = async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('event_comments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !eventId) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: user.id,
          comment_text: newComment.trim(),
          user_email: user.email,
        });
      
      if (error) throw error;
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ImageBackground
        source={require('../assets/beach-bg.jpg')}
        resizeMode="cover"
        style={styles.image}
        blurRadius={0}
      >
        <Header 
          title={t('app.name')} 
          avatarUrl={avatarUrl}
          onPressProfile={() => navigation.navigate('Account')}
        />
        
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#ffffff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.eventTitleBar}>
          <Text style={styles.eventTitle}>{eventTitle || t('calendar.noTitle')}</Text>
        </View>
        
        <View style={styles.content}>
          <ScrollView style={styles.commentsContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#2d4887" style={{ marginTop: 32 }} />
            ) : comments.length === 0 ? (
              <Text style={styles.placeholder}>{t('comments.noComments')}</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <Text style={styles.commentUser}>{comment.user_email}</Text>
                  <Text style={styles.commentText}>{comment.comment_text}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {user && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('comments.addComment')}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleAddComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('comments.submit')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, width: '100%', height: '100%' },
  backButtonContainer: {
    backgroundColor: '#2d4887',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  eventTitleBar: {
    backgroundColor: '#2d4887',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  content: { flex: 1, backgroundColor: 'rgba(0,0,0,0.40)' },
  commentsContainer: { flex: 1, padding: 16 },
  placeholder: { fontSize: 16, color: '#cbd5e1', textAlign: 'center', marginTop: 32 },
  commentCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentUser: { fontSize: 14, fontWeight: '700', color: '#2d4887', marginBottom: 4 },
  commentText: { fontSize: 15, color: '#0f172a', marginBottom: 6 },
  commentDate: { fontSize: 12, color: '#475569' },
  inputContainer: {
    backgroundColor: '#2d4887',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    backgroundColor: 'rgba(45,72,135,0.7)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    minHeight: 60,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#0EA5B5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
