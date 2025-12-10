import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image,
} from 'react-native';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});
  const [userLikes, setUserLikes] = useState({});
  const [profileAvatars, setProfileAvatars] = useState({});

  useEffect(() => {
    fetchComments();
    checkAdminStatus();

    if (!eventId) return;

    const subscription = supabase
      .channel(`comments:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_comments',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId]);

  const checkAdminStatus = async () => {
    if (!user) return;
    console.log('Checking admin status for user:', user.email);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Profile query error:', error);
        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id, email: user.email, is_admin: false });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Profile created for user');
          }
        }
        throw error;
      }

      console.log('Admin status result:', data?.is_admin);
      setIsAdmin(data?.is_admin === true);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchComments = async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('event_comments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = data || [];
      setComments(list);
      if (list.length) {
        fetchCommentLikes(list.map((c) => c.id));
        fetchProfileAvatars(list.map((c) => c.user_id));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentLikes = async (commentIds) => {
    if (!commentIds.length) return;

    const { data } = await supabase
      .from('comment_likes')
      .select('comment_id, user_id')
      .in('comment_id', commentIds);

    const likeCounts = {};
    const userLikeStatus = {};

    data?.forEach((like) => {
      likeCounts[like.comment_id] = (likeCounts[like.comment_id] || 0) + 1;
      if (user && like.user_id === user.id) {
        userLikeStatus[like.comment_id] = true;
      }
    });

    setCommentLikes(likeCounts);
    setUserLikes(userLikeStatus);
  };

  const fetchProfileAvatars = async (userIds = []) => {
    const ids = [...new Set(userIds.filter(Boolean))];
    if (!ids.length) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .in('id', ids);

    if (error) {
      console.error('Error fetching profile avatars:', error);
      return;
    }

    const map = {};
    data?.forEach((p) => {
      map[p.id] = p.avatar_url || null;
    });
    setProfileAvatars((prev) => ({ ...prev, ...map }));
  };

  const toggleCommentLike = useCallback(
    async (commentId) => {
      if (!user) return;

      const isLiked = userLikes[commentId];

      try {
        if (isLiked) {
          await supabase
            .from('comment_likes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('comment_likes')
            .insert({ comment_id: commentId, user_id: user.id });
        }

        fetchCommentLikes(comments.map((c) => c.id));
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    },
    [user, userLikes, comments]
  );

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      console.log('Attempting to delete comment:', commentId);
      const { data, error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', commentId)
        .select();

      console.log('Delete result:', { data, error });

      if (error) {
        console.error('Delete failed:', error);
        throw error;
      }

      if (data && data.length === 0) {
        console.warn('No rows were deleted - check RLS policies');
      }

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, []);

  const handleNavigateToAccount = useCallback(() => {
    navigation.navigate('Account');
  }, [navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !eventId) return;

    setSubmitting(true);
    try {
      const username =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Anonymous';
      const { error } = await supabase.from('event_comments').insert({
        event_id: eventId,
        user_id: user.id,
        comment_text: newComment.trim(),
        user_email: user.email,
        username: username,
        avatar_url: user.user_metadata?.avatar_url || null,
      });

      if (error) throw error;
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ImageBackground
        source={require('../assets/beach-bg.jpg')}
        resizeMode="cover"
        style={styles.image}
        blurRadius={0}
      >
        <Header
          title={t('app.name')}
        />

        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#ffffff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventTitleBar}>
          <Text style={styles.eventTitle}>
            {eventTitle || t('calendar.noTitle')}
          </Text>
        </View>

        <View style={styles.content}>
          <ScrollView 
            style={styles.commentsContainer}
            contentContainerStyle={styles.scrollContent}
          >
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#2d4887"
                style={{ marginTop: 32 }}
              />
            ) : comments.length === 0 ? (
              <Text style={styles.placeholder}>{t('comments.noComments')}</Text>
            ) : (
              comments.map((comment) => {
                const displayName =
                  comment.username ||
                  comment.user_email?.split('@')[0] ||
                  'Anonymous';
                const isOwner = user && comment.user_id === user.id;
                const avatar =
                  comment.avatar_url ||
                  profileAvatars[comment.user_id] ||
                  null;



                const canDelete = isOwner || isAdmin;
                return (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentHeaderLeft}>
                        {avatar ? (
                          <Image
                            source={{ uri: avatar }}
                            style={styles.commentAvatar}
                          />
                        ) : (
                          <Icon
                            name="person-circle-outline"
                            size={28}
                            color="#64748b"
                            style={styles.commentAvatarPlaceholder}
                          />
                        )}
                        <Text style={styles.commentUser}>{displayName}</Text>
                      </View>
                      {canDelete && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment.id)}
                          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                        >
                          <Icon
                            name="close-circle"
                            size={20}
                            color="#ef4444"
                            style={styles.deleteIcon}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.commentText}>{comment.comment_text}</Text>
                    <View style={styles.commentFooter}>
                      <Text style={styles.commentDate}>
                        {new Date(comment.created_at).toLocaleString()}
                      </Text>
                      {user && (
                        <TouchableOpacity
                          style={styles.likeButton}
                          onPress={() => toggleCommentLike(comment.id)}
                        >
                          <Icon
                            name={
                              userLikes[comment.id] ? 'heart' : 'heart-outline'
                            }
                            size={16}
                            color={
                              userLikes[comment.id] ? '#ef4444' : '#64748b'
                            }
                          />
                          <Text style={styles.likeCount}>
                            {commentLikes[comment.id] || 0}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
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
                style={[
                  styles.submitButton,
                  submitting && styles.submitButtonDisabled,
                ]}
                onPress={handleAddComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {t('comments.submit')}
                  </Text>
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
  commentsContainer: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  placeholder: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 32,
  },
  commentCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentUser: { fontSize: 14, fontWeight: '700', color: '#2d4887' },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
  },
  deleteButton: { fontSize: 18, color: '#ef4444', fontWeight: '700' },
  commentText: { fontSize: 15, color: '#0f172a', marginBottom: 6 },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentDate: { fontSize: 12, color: '#475569' },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
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
