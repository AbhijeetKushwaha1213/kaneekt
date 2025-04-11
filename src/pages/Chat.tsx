
import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Smile, Image, File, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/ui/chat-message";
import { useToast } from "@/hooks/use-toast";
import { Message, AuthUser } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// Common emoji sets for the emoji picker
const EMOJI_SETS = [
  ["😀", "😂", "😍", "🤔", "😎", "😢", "😡", "🤯", "😴"],
  ["👍", "👎", "👌", "✌️", "🤝", "👊", "🙏", "🤲", "👏"],
  ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "💯"],
  ["🐶", "🐱", "🐭", "🦊", "🐻", "🐼", "🐨", "🦁", "🐮"],
  ["🍎", "🍓", "🍒", "🍕", "🍔", "🍟", "🍩", "🍦", "🍺"]
];

// Mock data for the chat messages
const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    content: "Hi there! I saw that you're interested in philosophy too. Have you read any good books on consciousness lately?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    sender: {
      id: "u1",
      name: "Emma",
      avatar: "/placeholder.svg"
    },
    isCurrentUser: false
  },
  {
    id: "m2",
    content: "Hello! Yes, I've been reading 'Consciousness Explained' by Daniel Dennett. It's quite challenging but fascinating!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9), // 1.9 hours ago
    sender: {
      id: "current",
      name: "You",
      avatar: "/placeholder.svg"
    },
    isCurrentUser: true
  },
  {
    id: "m3",
    content: "That's a classic! What do you think of his 'multiple drafts' theory? I find it compelling but still have some questions about qualia.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8), // 1.8 hours ago
    sender: {
      id: "u1",
      name: "Emma",
      avatar: "/placeholder.svg"
    },
    isCurrentUser: false
  },
  {
    id: "m4",
    content: "I think it's an interesting attempt to demystify consciousness, but I'm not fully convinced yet. Have you read anything by David Chalmers? His perspective on the 'hard problem' offers a useful counterpoint.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
    sender: {
      id: "current",
      name: "You",
      avatar: "/placeholder.svg"
    },
    isCurrentUser: true
  },
  {
    id: "m5",
    content: "Yes! I actually attended a lecture by Chalmers last year. It was fascinating. Would you be interested in joining a small philosophy discussion group I'm part of? We meet virtually every two weeks.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.4), // 1.4 hours ago
    sender: {
      id: "u1",
      name: "Emma",
      avatar: "/placeholder.svg"
    },
    isCurrentUser: false
  },
];

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatPartner, setChatPartner] = useState<AuthUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // File upload
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<'image' | 'document' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Emoji picker
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.user_metadata?.name || "User",
        email: user.email || "",
        username: user.user_metadata?.username || user.email?.split('@')[0] || "user",
        avatar: user.user_metadata?.avatar_url || "/placeholder.svg",
        isLoggedIn: true,
        createdAt: user.created_at
      });
    } else {
      const storedUserData = localStorage.getItem("user");
    
      if (!storedUserData) {
        // If not logged in, redirect to auth page
        toast({
          title: "Authentication required",
          description: "Please log in to view this chat",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }
      
      try {
        const userData = JSON.parse(storedUserData);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Failed to parse user data", error);
        navigate("/auth");
      }
    }
  }, [navigate, toast, user]);
  
  useEffect(() => {
    // Try to get chat partner data
    if (!chatId || !currentUser) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log("Looking for chat with ID:", chatId);
    
    // First, check for direct conversations
    const storedConversations = localStorage.getItem("conversations");
    let foundConversation = false;
    let targetUser = null;
    
    if (storedConversations) {
      try {
        const conversations = JSON.parse(storedConversations);
        console.log("Stored conversations:", conversations);
        
        // First look for exact conversation ID match
        const exactMatch = conversations.find(
          (conv: any) => conv.id === chatId
        );
        
        if (exactMatch) {
          console.log("Found exact conversation match:", exactMatch);
          setChatPartner({
            id: exactMatch.user.id,
            name: exactMatch.user.name,
            avatar: exactMatch.user.avatar || "/placeholder.svg",
            email: "",
            username: "",
            isLoggedIn: true,
            createdAt: new Date().toISOString()
          });
          foundConversation = true;
          
          // Load chat history if exists
          const chatKey = `chat_${chatId}`;
          const storedMessages = localStorage.getItem(chatKey);
          
          if (storedMessages) {
            console.log("Loading stored messages for chat:", chatId);
            const parsedMessages = JSON.parse(storedMessages);
            setMessages(parsedMessages);
          } else {
            console.log("No stored messages, using mock data");
            setMessages(MOCK_MESSAGES);
          }
        } else {
          // Try to find a conversation with the user
          const userMatch = conversations.find(
            (conv: any) => conv.user.id === chatId
          );
          
          if (userMatch) {
            console.log("Found conversation with user:", userMatch);
            setChatPartner({
              id: userMatch.user.id,
              name: userMatch.user.name,
              avatar: userMatch.user.avatar || "/placeholder.svg",
              email: "",
              username: "",
              isLoggedIn: true,
              createdAt: new Date().toISOString()
            });
            foundConversation = true;
            
            // Load chat history
            const chatKey = `chat_${userMatch.id}`;
            const storedMessages = localStorage.getItem(chatKey);
            
            if (storedMessages) {
              console.log("Loading stored messages for user conversation:", userMatch.id);
              const parsedMessages = JSON.parse(storedMessages);
              setMessages(parsedMessages);
            } else {
              console.log("No stored messages for user, using mock data");
              setMessages(MOCK_MESSAGES);
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse conversations", error);
      }
    }
    
    // If no conversation found, check all registered users
    if (!foundConversation) {
      const allUsers = localStorage.getItem("allUsers");
      if (allUsers) {
        try {
          const usersList = JSON.parse(allUsers);
          console.log("Checking all users:", usersList);
          targetUser = usersList.find((user: AuthUser) => user.id === chatId);
          
          if (targetUser) {
            console.log("Found user in all users:", targetUser);
            setChatPartner(targetUser);
            
            // Create new conversation if it doesn't exist
            let conversations = [];
            if (storedConversations) {
              conversations = JSON.parse(storedConversations);
            }
            
            const newConversation = {
              id: `conv-${Date.now()}`,
              user: {
                id: targetUser.id,
                name: targetUser.name,
                avatar: targetUser.avatar || "/placeholder.svg"
              },
              lastMessage: {
                id: `msg-${Date.now()}`,
                content: "Start a conversation...",
                timestamp: new Date(),
                unread: false
              },
              isApproved: true
            };
            
            conversations.push(newConversation);
            localStorage.setItem("conversations", JSON.stringify(conversations));
            
            // For demo purposes, use mock data for new chats
            setMessages(MOCK_MESSAGES);
            foundConversation = true;
          }
        } catch (error) {
          console.error("Failed to parse users", error);
        }
      }
    }
    
    // If still no match found, create a default chat for demo purposes
    if (!foundConversation) {
      console.log("No conversation or user found, creating default chat for:", chatId);
      const defaultUser = {
        id: chatId,
        name: `User ${chatId.substring(0, 4)}`,
        avatar: "/placeholder.svg",
        email: "",
        username: "",
        isLoggedIn: true,
        createdAt: new Date().toISOString()
      };
      
      setChatPartner(defaultUser);
      
      // Create a new conversation
      let conversations = [];
      const storedConvs = localStorage.getItem("conversations");
      if (storedConvs) {
        conversations = JSON.parse(storedConvs);
      }
      
      const newConversation = {
        id: `conv-${Date.now()}`,
        user: {
          id: defaultUser.id,
          name: defaultUser.name,
          avatar: defaultUser.avatar
        },
        lastMessage: {
          id: `msg-${Date.now()}`,
          content: "Start a conversation...",
          timestamp: new Date(),
          unread: false
        },
        isApproved: true
      };
      
      conversations.push(newConversation);
      localStorage.setItem("conversations", JSON.stringify(conversations));
      
      // Use mock messages
      setMessages(MOCK_MESSAGES);
    }
    
    setLoading(false);
  }, [chatId, currentUser]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment(file);
      
      // Check if it's an image type
      if (file.type.startsWith('image/')) {
        setAttachmentType('image');
        setAttachmentPreview(URL.createObjectURL(file));
      } else {
        setAttachmentType('document');
        setAttachmentPreview(null);
      }
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    setAttachmentType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setEmojiPickerOpen(false);
  };
  
  const handleSendMessage = () => {
    if ((newMessage.trim() === "" && !attachment) || !currentUser || !chatPartner) return;
    
    const message: Message = {
      id: `new-${Date.now()}`,
      content: newMessage,
      timestamp: new Date(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar || "/placeholder.svg"
      },
      isCurrentUser: true,
      attachment: attachment ? {
        type: attachmentType || 'document',
        url: attachmentPreview || `file-${Date.now()}`,
        name: attachment.name
      } : undefined
    };
    
    // Add message to local messages state
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    
    // Store the messages in localStorage
    const chatKey = `chat_${chatId || 'default'}`;
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    
    // Update conversation last message
    if (chatId) {
      const storedConversations = localStorage.getItem("conversations");
      if (storedConversations) {
        try {
          const conversations = JSON.parse(storedConversations);
          const updatedConversations = conversations.map((conv: any) => {
            if (conv.user.id === chatId || conv.id === chatId) {
              return {
                ...conv,
                lastMessage: {
                  id: message.id,
                  content: message.content || 'Sent an attachment',
                  timestamp: new Date(),
                  unread: false
                }
              };
            }
            return conv;
          });
          localStorage.setItem("conversations", JSON.stringify(updatedConversations));
        } catch (error) {
          console.error("Failed to update conversation", error);
        }
      }
    }
    
    setNewMessage("");
    handleRemoveAttachment();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col items-center justify-center">
          <p>Loading chat...</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col">
        {/* Chat header */}
        <div className="flex items-center p-3 border-b bg-background/80 backdrop-blur-md">
          <Link to="/chats" className="mr-2 md:hidden">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={chatPartner?.avatar || "/placeholder.svg"} alt={chatPartner?.name || "User"} />
            <AvatarFallback>{chatPartner?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          
          <div className="ml-3 flex-1">
            <h2 className="font-medium">{chatPartner?.name || "User"}</h2>
            <p className="text-xs text-muted-foreground">
              {chatPartner?.username ? `@${chatPartner.username} • ` : ""}Last active recently
            </p>
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <p className="text-muted-foreground">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* File preview */}
        {attachment && (
          <div className="px-4 pt-2">
            <div className="relative bg-accent/20 rounded-md p-2 pr-10 inline-block max-w-full">
              {attachmentType === 'image' && attachmentPreview ? (
                <div className="flex items-center gap-2">
                  <img 
                    src={attachmentPreview} 
                    alt="Attachment preview" 
                    className="h-20 w-auto rounded-md object-cover" 
                  />
                  <span className="text-sm truncate max-w-[150px]">{attachment.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <File className="h-8 w-8 text-primary" />
                  <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 absolute top-1 right-1 hover:bg-accent/50 rounded-full"
                onClick={handleRemoveAttachment}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Message input */}
        <div className="p-3 border-t bg-background">
          <div className="flex items-end gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0" 
              aria-label="Attach file"
              onClick={handleAttachmentClick}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleAttachmentChange}
            />
            
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[2.5rem] max-h-40 resize-none"
              rows={1}
            />
            
            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="Add emoji">
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Emoji</h4>
                    <div className="grid grid-cols-9 gap-2">
                      {EMOJI_SETS.map((row, rowIndex) => (
                        row.map((emoji, index) => (
                          <Button
                            key={`${rowIndex}-${index}`}
                            variant="outline"
                            size="sm"
                            className="h-9 w-9"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={handleSendMessage} 
              disabled={(newMessage.trim() === "" && !attachment)}
              size="icon"
              className="flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
