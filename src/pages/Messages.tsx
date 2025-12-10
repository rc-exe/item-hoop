import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Users, Send, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

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

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  created_at: string;
  exchange_id?: string | null;
}

export const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
          .order('last_message_at', { ascending: false });

        if (convError) throw convError;

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

            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', otherUserId)
              .eq('receiver_id', user.id)
              .eq('is_read', false);

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
          fetchConversations();
        }
      )
      .subscribe();

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
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (!user || !selectedChat) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat.other_user.id}),and(sender_id.eq.${selectedChat.other_user.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', selectedChat.other_user.id)
          .eq('receiver_id', user.id)
          .eq('is_read', false);

      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages for this conversation
    const channel = supabase
      .channel(`chat-${user.id}-${selectedChat.other_user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === selectedChat.other_user.id) ||
            (newMsg.sender_id === selectedChat.other_user.id && newMsg.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChat) return;

    try {
      const { error } = await supabase.functions.invoke('send-message', {
        body: {
          receiver_id: selectedChat.other_user.id,
          content: newMessage.trim(),
          message_type: 'text'
        }
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-0 md:px-4 py-0 md:py-4">
        <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] border border-border rounded-none md:rounded-lg overflow-hidden flex bg-card">
          {/* Conversations List - Hidden on mobile when chat is selected */}
          <div className={cn(
            "w-full md:w-80 lg:w-96 border-r border-border flex flex-col",
            selectedChat ? "hidden md:flex" : "flex"
          )}>
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">Messages</h1>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No conversations yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start chatting by making exchange requests!
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation)}
                    className={cn(
                      "flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border/50",
                      selectedChat?.id === conversation.id && "bg-accent"
                    )}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conversation.other_user.avatar_url || undefined} />
                      <AvatarFallback>
                        {conversation.other_user.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {conversation.other_user.username || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-muted-foreground truncate pr-2">
                          {conversation.last_message ? (
                            <>
                              {conversation.last_message.sender_id === user?.id && 'You: '}
                              {conversation.last_message.content}
                            </>
                          ) : (
                            'No messages yet'
                          )}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge className="h-5 w-5 flex items-center justify-center rounded-full text-xs p-0 flex-shrink-0">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col",
            !selectedChat ? "hidden md:flex" : "flex"
          )}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden"
                    onClick={() => setSelectedChat(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.other_user.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedChat.other_user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{selectedChat.other_user.username || 'Unknown User'}</h2>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.sender_id === user?.id ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2",
                            message.sender_id === user?.id
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Message..."
                      className="flex-1 rounded-full"
                    />
                    <Button 
                      onClick={sendMessage} 
                      size="icon" 
                      className="rounded-full"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center mb-4">
                  <MessageCircle className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};