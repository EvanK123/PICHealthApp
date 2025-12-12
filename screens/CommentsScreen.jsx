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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TranslationContext } from '../context/TranslationContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { normalize, spacing, isSmallPhone, useDimensions } from '../utils/responsive';

export default function CommentsScreen({ route, navigation }) {
  const { t } = useContext(TranslationContext);
  const { user } = useAuth();
  const dimensions = useDimensions(); // Force re-render on dimension changes
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
  const [profileNames, setProfileNames] = useState({});

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

    // Also subscribe to profile changes to update names in real-time
    const profileSubscription = supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        async () => {
          // Refresh profile names when any profile is updated
          // First fetch comments to get current user IDs
          const { data: currentComments } = await supabase
            .from('event_comments')
            .select('user_id')
            .eq('event_id', eventId);
          
          if (currentComments && currentComments.length > 0) {
            const userIds = [...new Set(currentComments.map((c) => c.user_id).filter(Boolean))];
            fetchProfileNames(userIds);
            // Also refresh comments to update display
            fetchComments();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      profileSubscription.unsubscribe();
    };
  }, [eventId]);

  // Check admin status whenever user changes
  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  // Refresh profile names when user changes (to get updated names)
  useEffect(() => {
    if (comments.length > 0) {
      const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))];
      fetchProfileNames(userIds);
    }
  }, [user?.user_metadata?.full_name]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {

        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id, email: user.email, is_admin: false });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }
        setIsAdmin(false);
        return;
      }


      setIsAdmin(data?.is_admin === true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
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
        const userIds = [...new Set(list.map((c) => c.user_id).filter(Boolean))];
        fetchCommentLikes(list.map((c) => c.id));
        fetchProfileAvatars(userIds);
        // Always fetch profile names to get the most up-to-date names
        fetchProfileNames(userIds);
      } else {
        // Clear profile names if no comments
        setProfileNames({});
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

  const fetchProfileNames = async (userIds = []) => {
    const ids = [...new Set(userIds.filter(Boolean))];
    if (!ids.length) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ids);

      if (error) {
        console.error('Error fetching profile names:', error);
        return;
      }

      const map = {};
      // Store all results, including null values, so we know we've checked
      data?.forEach((p) => {
        map[p.id] = p.full_name || null;
      });
      
      // Update state with fetched names
      setProfileNames((prev) => {
        const updated = { ...prev };
        Object.keys(map).forEach((id) => {
          // Always update with the fetched value (even if null)
          updated[id] = map[id];
        });
        return updated;
      });
    } catch (err) {
      console.error('Error in fetchProfileNames:', err);
    }
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

        // Update state locally instead of refetching all
        setUserLikes(prev => ({
          ...prev,
          [commentId]: !isLiked
        }));
        setCommentLikes(prev => ({
          ...prev,
          [commentId]: (prev[commentId] || 0) + (isLiked ? -1 : 1)
        }));
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    },
    [user, userLikes]
  );

  const handleDeleteComment = useCallback(async (commentId) => {
    try {

      const { data, error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', commentId)
        .select();



      if (error) {
        console.error('Delete failed:', error);
        throw error;
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
        t('comments.anonymous');
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
            <Text style={styles.backText}>{t('common.back')}</Text>
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
                const isOwner = user && comment.user_id === user.id;
                // Priority for display name:
                // 1. Current user's metadata (for their own comments - always up-to-date)
                // 2. Profile table name (for all users - most up-to-date source)
                // 3. Stored username (fallback for old comments)
                // 4. Email (fallback)
                // 5. Anonymous
                let displayName;
                if (isOwner) {
                  // For current user's own comments, use their current metadata
                  displayName = user.user_metadata?.full_name ||
                               user.email?.split('@')[0] ||
                               t('comments.anonymous');
                } else {
                  // For other users, prioritize profile name over stored username
                  // Check if we've fetched the profile name (even if it's null)
                  if (comment.user_id && comment.user_id in profileNames) {
                    // We've checked the profiles table - use that value (or fallback)
                    displayName = profileNames[comment.user_id] ||
                                 comment.user_email?.split('@')[0] ||
                                 t('comments.anonymous');
                  } else {
                    // Haven't fetched from profiles yet - use stored username temporarily
                    displayName = comment.username ||
                                 comment.user_email?.split('@')[0] ||
                                 t('comments.anonymous');
                  }
                }
                const avatar = profileAvatars[comment.user_id] || comment.avatar_url || null;



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
    fontSize: isSmallPhone() ? normalize(16) : normalize(18),
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
    padding: isSmallPhone() ? normalize(8) : 12,
    borderRadius: 12,
    marginBottom: isSmallPhone() ? normalize(4) : normalize(8),
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
  commentUser: { fontSize: normalize(isSmallPhone() ? 12 : 14), fontWeight: '700', color: '#2d4887' },
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
  commentText: { fontSize: normalize(isSmallPhone() ? 13 : 15), color: '#0f172a', marginBottom: 6 },
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
    padding: Platform.OS === 'web' ? 12 : normalize(8),
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    minHeight: Platform.OS === 'web' ? 60 : (isSmallPhone() ? 40 : 45),
    marginBottom: normalize(8),
  },
  submitButton: {
    backgroundColor: '#0EA5B5',
    paddingVertical: Platform.OS === 'web' ? 12 : normalize(8),
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: normalize(isSmallPhone() ? 14 : 16) },
});
