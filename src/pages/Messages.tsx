import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatWindow } from '@/components/ChatWindow';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  other_user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  unread_count: number;
  last_message?: {
    content: string;
    sender_id: string;
  };
}

export const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    userName: string;
    userAvatar: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        // Fetch conversations
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
          .order('last_message_at', { ascending: false });

        if (convError) throw convError;

        // Fetch profiles for the other participants
        const conversationsWithProfiles = await Promise.all(
          (convData || []).map(async (conv) => {
            const otherUserId = conv.participant_1_id === user.id 
              ? conv.participant_2_id 
              : conv.participant_1_id;

            const { data: profile } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .eq('id', otherUserId)
              .single();

            // Count unread messages
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', otherUserId)
              .eq('receiver_id', user.id)
              .eq('is_read', false);

            // Get last message if exists
            let lastMessage = null;
            if (conv.last_message_id) {
              const { data: msgData } = await supabase
                .from('messages')
                .select('content, sender_id')
                .eq('id', conv.last_message_id)
                .single();
              lastMessage = msgData;
            }

            return {
              ...conv,
              other_user: profile || { id: otherUserId, username: 'Unknown', avatar_url: '' },
              unread_count: count || 0,
              last_message: lastMessage
            };
          })
        );

        setConversations(conversationsWithProfiles);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to new messages to update conversation list
    const messagesChannel = supabase
      .channel('conversations-messages-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refetch conversations when any message is created/updated
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel('conversations-table-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          // Refetch conversations when conversation table changes
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center space-x-2 mb-6">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground">
                Start chatting with other users by making exchange requests!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.other_user.avatar_url || undefined} />
                        <AvatarFallback>
                          {conversation.other_user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{conversation.other_user.username || 'Unknown User'}</h3>
                          {conversation.unread_count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        
                        {conversation.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
                            {conversation.last_message.content}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { 
                            addSuffix: true 
                          })}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedChat({
                        userId: conversation.other_user.id,
                        userName: conversation.other_user.username,
                        userAvatar: conversation.other_user.avatar_url
                      })}
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedChat && (
          <ChatWindow
            receiverId={selectedChat.userId}
            receiverName={selectedChat.userName}
            receiverAvatar={selectedChat.userAvatar}
            onClose={() => setSelectedChat(null)}
          />
        )}
      </div>
    </div>
  );
};