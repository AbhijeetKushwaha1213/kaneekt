import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Smile, X, Search, Phone, Video as VideoIcon, 
  MoreVertical, Star, Archive, BellOff, Bell, Users, Shield, Image
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ui/chat-message";
import { useToast } from "@/hooks/use-toast";
import { Message, AuthUser, Reaction } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MessageAttachmentUploader, AttachmentType } from "@/components/ui/message-attachment-uploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Common emoji sets for the emoji picker
const EMOJI_SETS = [
  ["😀", "😂", "😍", "🤔", "😎", "😢", "😡", "🤯", "😴"],
  ["👍", "👎", "👌", "✌️", "🤝", "👊", "🙏", "🤲", "👏"],
  ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "💯"],
  ["🐶", "🐱", "🐭", "🦊", "🐻", "🐼", "🐨", "🦁", "🐮"],
  ["🍎", "🍓", "🍒", "🍕", "🍔", "🍟", "🍩", "🍦", "🍺"]
];

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatPartner, setChatPartner] = useState<AuthUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  
  // File upload
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<AttachmentType | null>(null);
  
  // Chat settings
  const [isMuted, setIsMuted] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [chatTheme, setChatTheme] = useState<string | null>(null);
  const [enableDisappearingMessages, setEnableDisappearingMessages] = useState(false);
  const [disappearingMessagesTime, setDisappearingMessagesTime] = useState(24); // hours
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  
  // Reply functionality
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  // Message viewing 
  const [viewingMedia, setViewingMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    name: string;
  } | null>(null);
  
  // Starred messages
  const [showingStarred, setShowingStarred] = useState(false);
  
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
    // Try to get chat partner data and messages
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
            username: exactMatch.user.username || "",
            isLoggedIn: true,
            createdAt: new Date().toISOString()
          });
          foundConversation = true;
          
          // Set chat preferences
          setIsMuted(exactMatch.isMuted || false);
          setIsArchived(exactMatch.isArchived || false);
          setChatTheme(exactMatch.theme || null);
          
          // Load chat history if exists
          const chatKey = `chat_${chatId}`;
          const storedMessages = localStorage.getItem(chatKey);
          
          if (storedMessages) {
            console.log("Loading stored messages for chat:", chatId);
            const parsedMessages = JSON.parse(storedMessages);
            setMessages(parsedMessages);
            setFilteredMessages(parsedMessages);
            
            // Mark all unread messages as read
            if (parsedMessages.some((msg: Message) => !msg.isCurrentUser && msg.status !== 'read')) {
              const updatedMessages = parsedMessages.map((msg: Message) => 
                !msg.isCurrentUser ? { ...msg, status: 'read' } : msg
              );
              setMessages(updatedMessages);
              localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
              
              // Update conversation unread count
              updateConversationReadStatus(chatId);
            }
          } else {
            // Use mock data for demo
            const mockMessages = generateMockMessages(currentUser, {
              id: exactMatch.user.id,
              name: exactMatch.user.name,
              avatar: exactMatch.user.avatar || "/placeholder.svg"
            });
            setMessages(mockMessages);
            setFilteredMessages(mockMessages);
            localStorage.setItem(chatKey, JSON.stringify(mockMessages));
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
              username: userMatch.user.username || "",
              isLoggedIn: true,
              createdAt: new Date().toISOString()
            });
            foundConversation = true;
            
            // Set chat preferences
            setIsMuted(userMatch.isMuted || false);
            setIsArchived(userMatch.isArchived || false);
            setChatTheme(userMatch.theme || null);
            
            // Load chat history
            const chatKey = `chat_${userMatch.id}`;
            const storedMessages = localStorage.getItem(chatKey);
            
            if (storedMessages) {
              console.log("Loading stored messages for user conversation:", userMatch.id);
              const parsedMessages = JSON.parse(storedMessages);
              setMessages(parsedMessages);
              setFilteredMessages(parsedMessages);
              
              // Mark all unread messages as read
              updateConversationReadStatus(userMatch.id);
            } else {
              // Use mock data for demo
              const mockMessages = generateMockMessages(currentUser, {
                id: userMatch.user.id,
                name: userMatch.user.name,
                avatar: userMatch.user.avatar || "/placeholder.svg"
              });
              setMessages(mockMessages);
              setFilteredMessages(mockMessages);
              localStorage.setItem(chatKey, JSON.stringify(mockMessages));
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
            
            const newConversationId = `conv-${Date.now()}`;
            const newConversation = {
              id: newConversationId,
              user: {
                id: targetUser.id,
                name: targetUser.name,
                avatar: targetUser.avatar || "/placeholder.svg",
                username: targetUser.username || "",
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
            
            // Create mock messages for new chat
            const mockMessages = generateMockMessages(currentUser, {
              id: targetUser.id,
              name: targetUser.name,
              avatar: targetUser.avatar || "/placeholder.svg"
            });
            setMessages(mockMessages);
            setFilteredMessages(mockMessages);
            
            // Save mock messages
            const chatKey = `chat_${newConversationId}`;
            localStorage.setItem(chatKey, JSON.stringify(mockMessages));
            
            foundConversation = true;
            
            // Update the URL to use the conversation ID
            navigate(`/chats/${newConversationId}`, { replace: true });
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
        id: chatId || 'default-user',
        name: chatId ? `User ${chatId.substring(0, 4)}` : "Demo User",
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
      
      const newConversationId = `conv-${Date.now()}`;
      const newConversation = {
        id: newConversationId,
        user: {
          id: defaultUser.id,
          name: defaultUser.name,
          avatar: defaultUser.avatar,
          username: ""
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
      
      // Create mock messages
      const mockMessages = generateMockMessages(currentUser, {
        id: defaultUser.id,
        name: defaultUser.name,
        avatar: defaultUser.avatar
      });
      setMessages(mockMessages);
      setFilteredMessages(mockMessages);
      
      // Save mock messages
      const chatKey = `chat_${newConversationId}`;
      localStorage.setItem(chatKey, JSON.stringify(mockMessages));
      
      // Update the URL to use the conversation ID
      navigate(`/chats/${newConversationId}`, { replace: true });
    }
    
    setLoading(false);
  }, [chatId, currentUser]);
  
  // Generate mock messages for demo purposes
  const generateMockMessages = (currentUser: AuthUser, partner: { id: string, name: string, avatar?: string }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return [
      {
        id: `m1-${uuidv4()}`,
        content: `Hi there! I saw that we've just connected. How's your day going?`,
        timestamp: yesterday,
        sender: {
          id: partner.id,
          name: partner.name,
          avatar: partner.avatar
        },
        isCurrentUser: false,
        status: 'read' as 'read' // Type assertion to fix TS error
      },
      {
        id: `m2-${uuidv4()}`,
        content: "Hello! Thanks for reaching out. I'm doing well, just exploring this cool new chat app. How about you?",
        timestamp: new Date(yesterday.getTime() + 1000 * 60 * 5), // 5 minutes later
        sender: {
          id: currentUser.id,
          name: currentUser.name || "You",
          avatar: currentUser.avatar
        },
        isCurrentUser: true,
        status: 'read' as 'read'
      },
      {
        id: `m3-${uuidv4()}`,
        content: "I'm good too! I really like the interface of this app. It's clean and intuitive. What features have you tried so far?",
        timestamp: new Date(yesterday.getTime() + 1000 * 60 * 10), // 10 minutes later
        sender: {
          id: partner.id,
          name: partner.name,
          avatar: partner.avatar
        },
        isCurrentUser: false,
        status: 'read' as 'read'
      },
      {
        id: `m4-${uuidv4()}`,
        content: "I've been checking out the messaging, but I haven't tried sharing media or creating group chats yet. The emoji reactions are fun though! 😊",
        timestamp: new Date(yesterday.getTime() + 1000 * 60 * 15), // 15 minutes later
        sender: {
          id: currentUser.id,
          name: currentUser.name || "You",
          avatar: currentUser.avatar
        },
        isCurrentUser: true,
        status: 'read' as 'read'
      },
      {
        id: `m5-${uuidv4()}`,
        content: "Definitely! 👍 We should try creating a group chat sometime with some other friends. Anyway, it's nice to connect with you here!",
        timestamp: new Date(yesterday.getTime() + 1000 * 60 * 20), // 20 minutes later
        sender: {
          id: partner.id,
          name: partner.name,
          avatar: partner.avatar
        },
        isCurrentUser: false,
        status: 'read' as 'read'
      }
    ];
  };
  
  const updateConversationReadStatus = (conversationId: string) => {
    const storedConversations = localStorage.getItem("conversations");
    if (!storedConversations) return;
    
    try {
      const conversations = JSON.parse(storedConversations);
      const updatedConversations = conversations.map((conv: any) => {
        if (conv.id === conversationId || conv.user.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
            lastMessage: {
              ...conv.lastMessage,
              unread: false
            }
          };
        }
        return conv;
      });
      
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));
    } catch (error) {
      console.error("Failed to update conversation read status", error);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);
  
  // Implement typing indicator
  useEffect(() => {
    if (newMessage.trim() !== "" && !isUserTyping) {
      setIsUserTyping(true);
      
      // Update typing status in conversation
      updateTypingStatus(true);
    }
    
    // Clear previous timer
    if (isTypingTimerRef.current) {
      clearTimeout(isTypingTimerRef.current);
    }
    
    // Set new timer to clear typing status
    isTypingTimerRef.current = setTimeout(() => {
      setIsUserTyping(false);
      updateTypingStatus(false);
    }, 2000);
    
    return () => {
      if (isTypingTimerRef.current) {
        clearTimeout(isTypingTimerRef.current);
      }
    };
  }, [newMessage]);
  
  // Clean up disappearing messages
  useEffect(() => {
    if (enableDisappearingMessages && messages.length > 0) {
      const now = new Date();
      const updatedMessages = messages.filter(msg => {
        if (msg.disappearAt) {
          return new Date(msg.disappearAt) > now;
        }
        return true;
      });
      
      if (updatedMessages.length < messages.length) {
        setMessages(updatedMessages);
        setFilteredMessages(updatedMessages.filter(msg => !showingStarred || msg.isStarred));
        
        // Save updated messages
        if (chatId) {
          const chatKey = `chat_${chatId}`;
          localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
        }
      }
    }
    
    // Check every minute
    const interval = setInterval(() => {
      if (enableDisappearingMessages && messages.length > 0) {
        const now = new Date();
        const updatedMessages = messages.filter(msg => {
          if (msg.disappearAt) {
            return new Date(msg.disappearAt) > now;
          }
          return true;
        });
        
        if (updatedMessages.length < messages.length) {
          setMessages(updatedMessages);
          setFilteredMessages(updatedMessages.filter(msg => !showingStarred || msg.isStarred));
          
          // Save updated messages
          if (chatId) {
            const chatKey = `chat_${chatId}`;
            localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
          }
        }
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [enableDisappearingMessages, messages, chatId, showingStarred]);
  
  // Update message search results
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    const results = messages.filter(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
    
    // Scroll to first result if found
    if (results.length > 0) {
      const firstResultEl = document.getElementById(`message-${results[0].id}`);
      if (firstResultEl) {
        firstResultEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchQuery, messages]);
  
  // Update filtered messages when showing starred
  useEffect(() => {
    if (showingStarred) {
      setFilteredMessages(messages.filter(msg => msg.isStarred));
    } else {
      setFilteredMessages(messages);
    }
  }, [showingStarred, messages]);
  
  // Simulate typing indicator for more interactive demo
  const updateTypingStatus = (isTyping: boolean) => {
    // In a real app, this would be done with a real-time API
    // For now, just simulate the partner typing occasionally
    if (!isTyping && Math.random() > 0.7) {
      // 30% chance the chat partner starts typing after you stop
      setTimeout(() => {
        simulatePartnerTyping();
      }, 1000);
    }
  };
  
  const simulatePartnerTyping = () => {
    if (chatPartner && !loading) {
      // Update conversation to show partner is typing
      const storedConversations = localStorage.getItem("conversations");
      if (storedConversations) {
        try {
          const conversations = JSON.parse(storedConversations);
          const updatedConversations = conversations.map((conv: any) => {
            if ((conv.id === chatId || conv.user.id === chatId) && conv.user.id === chatPartner.id) {
              return {
                ...conv,
                user: {
                  ...conv.user,
                  isTyping: true
                }
              };
            }
            return conv;
          });
          
          localStorage.setItem("conversations", JSON.stringify(updatedConversations));
          
          // Simulate typing stops after 2-5 seconds
          const typingDuration = 2000 + Math.random() * 3000;
          setTimeout(() => {
            // Stop typing
            const storedConvs = localStorage.getItem("conversations");
            if (storedConvs) {
              const convs = JSON.parse(storedConvs);
              const updatedConvs = convs.map((conv: any) => {
                if ((conv.id === chatId || conv.user.id === chatId) && conv.user.id === chatPartner.id) {
                  return {
                    ...conv,
                    user: {
                      ...conv.user,
                      isTyping: false
                    }
                  };
                }
                return conv;
              });
              
              localStorage.setItem("conversations", JSON.stringify(updatedConvs));
              
              // 50% chance to send a message after typing
              if (Math.random() > 0.5) {
                simulatePartnerMessage();
              }
            }
          }, typingDuration);
        } catch (error) {
          console.error("Failed to update typing status", error);
        }
      }
    }
  };
  
  const simulatePartnerMessage = () => {
    if (!chatPartner || loading) return;
    
    // Generate a random response
    const responses = [
      "That's interesting! Tell me more.",
      "I see what you mean. What do you think about...",
      "Thanks for sharing that!",
      "How's your day going?",
      "Did you have any plans for the weekend?",
      "I was just thinking about that too!",
      "Have you tried the new features in this chat app?",
      "That reminds me of something I wanted to ask you...",
      "Sorry for the late reply. Been busy today!",
      "LOL 😂"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const newMessage: Message = {
      id: `partner-${uuidv4()}`,
      content: randomResponse,
      timestamp: new Date(),
      sender: {
        id: chatPartner.id,
        name: chatPartner.name,
        avatar: chatPartner.avatar
      },
      isCurrentUser: false,
      status: 'delivered' as 'delivered'
    };
    
    // If disappearing messages are enabled, add expiry
    if (enableDisappearingMessages) {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + disappearingMessagesTime);
      newMessage.disappearAt = expiry;
    }
    
    // Add message to state
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Update filtered messages based on current view
    if (!showingStarred) {
      setFilteredMessages([...filteredMessages, newMessage]);
    }
    
    // Save to localStorage
    if (chatId) {
      const chatKey = `chat_${chatId}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
      
      // Update conversation last message
      updateConversationLastMessage(chatId, newMessage);
    }
  };
  
  const handleAttachmentSelect = (file: File, type: AttachmentType) => {
    setAttachment(file);
    setAttachmentType(type);
    
    if (type === 'image' || type === 'video') {
      const previewUrl = URL.createObjectURL(file);
      setAttachmentPreview(previewUrl);
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleAttachmentRemove = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachment(null);
    setAttachmentPreview(null);
    setAttachmentType(null);
  };
  
  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setEmojiPickerOpen(false);
  };
  
  const handleSendMessage = () => {
    if ((newMessage.trim() === "" && !attachment) || !currentUser || !chatPartner) return;
    
    const message: Message = {
      id: `new-${uuidv4()}`,
      content: newMessage,
      timestamp: new Date(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar || "/placeholder.svg"
      },
      isCurrentUser: true,
      status: 'sent' as 'sent',
      ...(replyingTo && {
        replyTo: {
          id: replyingTo.id,
          content: replyingTo.content,
          sender: {
            id: replyingTo.sender.id,
            name: replyingTo.sender.name
          }
        }
      }),
      ...(attachment && {
        attachment: {
          type: attachmentType || 'document',
          url: attachmentPreview || `file-${Date.now()}`,
          name: attachment.name
        }
      })
    };
    
    // If disappearing messages are enabled, add expiry
    if (enableDisappearingMessages) {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + disappearingMessagesTime);
      message.disappearAt = expiry;
    }
    
    // Add message to state
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    
    // Update filtered messages based on current view
    if (!showingStarred) {
      setFilteredMessages([...filteredMessages, message]);
    }
    
    // Store the messages in localStorage
    const chatKey = `chat_${chatId || 'default'}`;
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    
    // Update conversation last message
    if (chatId) {
      updateConversationLastMessage(chatId, message);
    }
    
    setNewMessage("");
    handleAttachmentRemove();
    setReplyingTo(null);
    
    // Simulate message status update: sent -> delivered -> read
    setTimeout(() => {
      // Update to delivered status
      const deliveredMessages = updatedMessages.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' as 'delivered' } : msg
      );
      setMessages(deliveredMessages);
      
      if (!showingStarred) {
        setFilteredMessages(deliveredMessages.filter(msg => !showingStarred || msg.isStarred));
      }
      
      localStorage.setItem(chatKey, JSON.stringify(deliveredMessages));
      
      // Later update to read status (when recipient "sees" the message)
      setTimeout(() => {
        const readMessages = deliveredMessages.map(msg => 
          msg.id === message.id ? { ...msg, status: 'read' as 'read' } : msg
        );
        setMessages(readMessages);
        
        if (!showingStarred) {
          setFilteredMessages(readMessages.filter(msg => !showingStarred || msg.isStarred));
        }
        
        localStorage.setItem(chatKey, JSON.stringify(readMessages));
        
        // With some probability, simulate partner typing and replying
        if (Math.random() > 0.4) { // 60% chance of reply
          setTimeout(() => {
            simulatePartnerTyping();
          }, 1000 + Math.random() * 2000);
        }
      }, 2000 + Math.random() * 3000); // 2-5 seconds later
    }, 1000); // 1 second later
  };
  
  const updateConversationLastMessage = (conversationId: string, message: Message) => {
    const storedConversations = localStorage.getItem("conversations");
    if (!storedConversations) return;
    
    try {
      const conversations = JSON.parse(storedConversations);
      const updatedConversations = conversations.map((conv: any) => {
        if (conv.id === conversationId || conv.user.id === conversationId) {
          return {
            ...conv,
            lastMessage: {
              id: message.id,
              content: message.content || (message.attachment ? getAttachmentTypeLabel(message.attachment.type) : 'Sent a message'),
              timestamp: new Date(),
              unread: !message.isCurrentUser,
              type: message.attachment ? message.attachment.type : 'text'
            },
            // Increment unread count if message is from partner
            ...(message.isCurrentUser ? {} : {
              unreadCount: (conv.unreadCount || 0) + 1
            })
          };
        }
        return conv;
      });
      
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));
    } catch (error) {
      console.error("Failed to update conversation", error);
    }
  };
  
  const getAttachmentTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return '📷 Photo';
      case 'video': return '🎬 Video';
      case 'document': return '📄 Document';
      case 'voice': return '🎤 Voice message';
      case 'location': return '📍 Location';
      default: return 'Attachment';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleReplyToMessage = (messageId: string) => {
    const messageToReply = messages.find(msg => msg.id === messageId);
    if (messageToReply) {
      setReplyingTo(messageToReply);
    }
  };
  
  const handleDeleteMessage = (messageId: string) => {
    // Only allow deleting own messages
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    setFilteredMessages(updatedMessages.filter(msg => !showingStarred || msg.isStarred));
    
    // Save to localStorage
    if (chatId) {
      const chatKey = `chat_${chatId}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    }
    
    toast({
      description: "Message deleted",
      duration: 2000
    });
  };
  
  const handleReactToMessage = (messageId: string, emoji: string) => {
    // Find if user already reacted with this emoji
    const messageToUpdate = messages.find(msg => msg.id === messageId);
    if (!messageToUpdate || !currentUser) return;
    
    const existingReaction = messageToUpdate.reactions?.find(
      reaction => reaction.userId === currentUser.id && reaction.emoji === emoji
    );
    
    let updatedReactions: Reaction[];
    
    if (existingReaction) {
      // Remove reaction if already exists
      updatedReactions = messageToUpdate.reactions?.filter(
        reaction => !(reaction.userId === currentUser.id && reaction.emoji === emoji)
      ) || [];
    } else {
      // Add new reaction
      const newReaction: Reaction = {
        emoji,
        userId: currentUser.id,
        userName: currentUser.name
      };
      updatedReactions = [...(messageToUpdate.reactions || []), newReaction];
    }
    
    // Update message with new reactions
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, reactions: updatedReactions } : msg
    );
    
    setMessages(updatedMessages);
    setFilteredMessages(updatedMessages.filter(msg => !showingStarred || msg.isStarred));
    
    // Save to localStorage
    if (chatId) {
      const chatKey = `chat_${chatId}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    }
  };
  
  const handleStarMessage = (messageId: string) => {
    const messageToUpdate = messages.find(msg => msg.id === messageId);
    if (!messageToUpdate) return;
    
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    );
    
    setMessages(updatedMessages);
    setFilteredMessages(updatedMessages.filter(msg => !showingStarred || msg.isStarred));
    
    // Save to localStorage
    if (chatId) {
      const chatKey = `chat_${chatId}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    }
    
    toast({
      description: messageToUpdate.isStarred 
        ? "Message unstarred" 
        : "Message starred",
      duration: 2000
    });
  };
  
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      description: "Message copied to clipboard",
      duration: 2000
    });
  };
  
  const handleForwardMessage = (messageId: string) => {
    toast({
      description: "Forward feature coming soon",
      duration: 2000
    });
  };
  
  const handleClearChat = () => {
    // Clear all messages
    setMessages([]);
    setFilteredMessages([]);
    
    if (chatId) {
      const chatKey = `chat_${chatId}`;
      localStorage.setItem(chatKey, JSON.stringify([]));
      
      // Update conversation last message
      updateConversationLastMessage(chatId, {
        id: `clear-${uuidv4()}`,
        content: "Chat cleared",
        timestamp: new Date(),
        sender: {
          id: currentUser?.id || "system",
          name: "System",
          avatar: "/placeholder.svg"
        },
        isCurrentUser: true,
        status: 'sent' as 'sent'
      });
    }
    
    toast({
      description: "Chat history cleared",
      duration: 2000
    });
  };
  
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    
    // Update conversation mute status
    if (chatId) {
      const storedConversations = localStorage.getItem("conversations");
      if (storedConversations) {
        try {
          const conversations = JSON.parse(storedConversations);
          const updatedConversations = conversations.map((conv: any) => {
            if (conv.id === chatId || conv.user.id === chatId) {
              return {
                ...conv,
                isMuted: !isMuted
              };
            }
            return conv;
          });
          
          localStorage.setItem("conversations", JSON.stringify(updatedConversations));
        } catch (error) {
          console.error("Failed to update mute status", error);
        }
      }
    }
    
    toast({
      description: isMuted ? "Chat unmuted" : "Chat muted",
      duration: 2000
    });
  };
  
  const handleToggleArchive = () => {
    setIsArchived(!isArchived);
    
    // Update conversation archive status
    if (chatId) {
      const storedConversations = localStorage.getItem("conversations");
      if (storedConversations) {
        try {
          const conversations = JSON.parse(storedConversations);
          const updatedConversations = conversations.map((conv: any) => {
            if (conv.id === chatId || conv.user.id === chatId) {
              return {
                ...conv,
                isArchived: !isArchived
              };
            }
            return conv;
          });
          
          localStorage.setItem("conversations", JSON.stringify(updatedConversations));
        } catch (error) {
          console.error("Failed to update archive status", error);
        }
      }
    }
    
    toast({
      description: isArchived ? "Chat unarchived" : "Chat archived",
      duration: 2000
    });
    
    if (!isArchived) {
      // If archiving, navigate back to chat list
      navigate("/chats");
    }
  };
  
  const handleToggleBlock = () => {
    setIsBlocked(!isBlocked);
    
    toast({
      description: isBlocked ? "User unblocked" : "User blocked",
      duration: 2000
    });
  };
  
  const handleNextSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    
    // Scroll to the next result
    const resultEl = document.getElementById(`message-${searchResults[nextIndex].id}`);
    if (resultEl) {
      resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  
  const handlePrevSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    
    // Scroll to the previous result
    const resultEl = document.getElementById(`message-${searchResults[prevIndex].id}`);
    if (resultEl) {
      resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  
  const handleChatThemeChange = (theme: string | null) => {
    setChatTheme(theme);
    
    // Update conversation theme
    if (chatId) {
      const storedConversations = localStorage.getItem("conversations");
      if (storedConversations) {
        try {
          const conversations = JSON.parse(storedConversations);
          const updatedConversations = conversations.map((conv: any) => {
            if (conv.id === chatId || conv.user.id === chatId) {
              return {
                ...conv,
                theme
              };
            }
            return conv;
          });
          
          localStorage.setItem("conversations", JSON.stringify(updatedConversations));
        } catch (error) {
          console.error("Failed to update chat theme", error);
        }
      }
    }
    
    toast({
      description: theme ? `Chat theme updated` : "Chat theme removed",
      duration: 2000
    });
  };
  
  const handleToggleDisappearingMessages = () => {
    setEnableDisappearingMessages(!enableDisappearingMessages);
    
    toast({
      description: enableDisappearingMessages 
        ? "Disappearing messages disabled" 
        : `Disappearing messages enabled (${disappearingMessagesTime}h)`,
      duration: 2000
    });
  };
  
  const getChatBackgroundStyle = () => {
    if (!chatTheme) return {};
    
    const themeStyles: Record<string, React.CSSProperties> = {
      'default': {},
      'gradient-blue': {
        background: 'linear-gradient(45deg, #e0f7fa, #bbdefb)',
      },
      'gradient-purple': {
        background: 'linear-gradient(45deg, #e1bee7, #d1c4e9)',
      },
      'solid-light': {
        background: '#f5f5f5',
      },
      'solid-dark': {
        background: '#1a1a1a',
      },
      'pattern-dots': {
        backgroundImage: 'radial-gradient(#444 1px, transparent 1px), radial-gradient(#444 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
        background: '#f5f5f5',
      }
    };
    
    return themeStyles[chatTheme] || {};
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
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={chatPartner?.avatar || "/placeholder.svg"} alt={chatPartner?.name || "User"} />
                    <AvatarFallback>{chatPartner?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  
                  <div className="text-left">
                    <h2 className="font-medium">{chatPartner?.name || "User"}</h2>
                    <p className="text-xs text-muted-foreground">
                      {chatPartner?.username ? `@${chatPartner.username} • ` : ""}
                      Online
                    </p>
                  </div>
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Chat Info</SheetTitle>
              </SheetHeader>
              <div className="py-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={chatPartner?.avatar || "/placeholder.svg"} alt={chatPartner?.name || "User"} />
                  <AvatarFallback className="text-3xl">{chatPartner?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{chatPartner?.name}</h2>
                {chatPartner?.username && (
                  <p className="text-sm text-muted-foreground mb-4">@{chatPartner.username}</p>
                )}
                
                <div className="flex gap-3 mt-4">
                  <Button variant="secondary" size="sm" className="flex flex-col items-center h-16 w-16 gap-1">
                    <Phone className="h-5 w-5" />
                    <span className="text-xs">Call</span>
                  </Button>
                  <Button variant="secondary" size="sm" className="flex flex-col items-center h-16 w-16 gap-1">
                    <VideoIcon className="h-5 w-5" />
                    <span className="text-xs">Video</span>
                  </Button>
                  <Button variant="secondary" size="sm" className="flex flex-col items-center h-16 w-16 gap-1">
                    <Search className="h-5 w-5" />
                    <span className="text-xs">Search</span>
                  </Button>
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mb-2">
                    Chat themes
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      className="h-10 w-10" 
                      onClick={() => handleChatThemeChange('default')}
                    >
                      <span className="bg-background w-full h-full rounded" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-10 w-10" 
                      onClick={() => handleChatThemeChange('gradient-blue')}
                    >
                      <span className="bg-gradient-to-br from-blue-100 to-blue-200 w-full h-full rounded" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-10 w-10" 
                      onClick={() => handleChatThemeChange('gradient-purple')}
                    >
                      <span className="bg-gradient-to-br from-purple-100 to-purple-200 w-full h-full rounded" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-10 w-10" 
                      onClick={() => handleChatThemeChange('solid-light')}
                    >
                      <span className="bg-gray-100 w-full h-full rounded" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-10 w-10" 
                      onClick={() => handleChatThemeChange('solid-dark')}
                    >
                      <span className="bg-gray-800 w-full h-full rounded" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-10 w-10" 
                      onClick={() => handleChatThemeChange('pattern-dots')}
                    >
                      <span className="bg-gray-100 w-full h-full rounded" style={{
                        backgroundImage: 'radial-gradient(#77777744 1px, transparent 1px)',
                        backgroundSize: '8px 8px',
                      }} />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="outline" 
                className="w-full mb-2 flex items-center justify-between"
                onClick={handleToggleDisappearingMessages}
              >
                <span>Disappearing messages</span>
                <span className={cn(
                  "w-9 h-5 rounded-full relative",
                  enableDisappearingMessages ? "bg-primary" : "bg-muted"
                )}>
                  <span className={cn(
                    "absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all",
                    enableDisappearingMessages ? "left-[calc(100%-20px)]" : "left-0.5"
                  )} />
                </span>
              </Button>
              
              <div className="space-y-2 mt-6">
                <Button 
                  variant="outline" 
                  className="w-full flex justify-between"
                  onClick={() => setShowingStarred(!showingStarred)}
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Starred messages</span>
                  </div>
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                    {messages.filter(m => m.isStarred).length}
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handleToggleMute}
                >
                  {isMuted ? (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>Unmute notifications</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4" />
                      <span>Mute notifications</span>
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handleToggleArchive}
                >
                  <Archive className="h-4 w-4" />
                  <span>{isArchived ? "Unarchive chat" : "Archive chat"}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handleClearChat}
                >
                  <X className="h-4 w-4" />
                  <span>Clear chat</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 text-destructive"
                  onClick={handleToggleBlock}
                >
                  <Shield className="h-4 w-4" />
                  <span>{isBlocked ? "Unblock user" : "Block user"}</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1" />
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
            >
              <Phone className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
            >
              <VideoIcon className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsSearchOpen(!isSearchOpen)}>
                  <Search className="h-4 w-4 mr-2" />
                  Search in chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowingStarred(!showingStarred)}>
                  <Star className="h-4 w-4 mr-2" />
                  Starred messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleMute}>
                  {isMuted ? (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Unmute notifications
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Mute notifications
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  {isArchived ? "Unarchive chat" : "Archive chat"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearChat}>
                  <X className="h-4 w-4 mr-2" />
                  Clear chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleBlock} className="text-destructive focus:text-destructive">
                  <Shield className="h-4 w-4 mr-2" />
                  {isBlocked ? "Unblock user" : "Block user"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Search bar - shown when search is active */}
        {isSearchOpen && (
          <div className="p-2 flex items-center gap-2 border-b bg-background/80">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Search in conversation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
              {searchResults.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {currentSearchIndex + 1} of {searchResults.length}
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              disabled={searchResults.length === 0}
              onClick={handlePrevSearchResult}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              disabled={searchResults.length === 0}
              onClick={handleNextSearchResult}
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
        
        {/* View title - for special views like "Starred Messages" */}
        {showingStarred && (
          <div className="bg-muted/20 p-2 flex items-center justify-between">
            <span className="text-sm flex items-center gap-1">
              <Star className="h-4 w-4" /> Starred Messages ({filteredMessages.length})
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setShowingStarred(false)}
            >
              Show All
            </Button>
          </div>
        )}
        
        {/* Chat messages */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50" 
          style={getChatBackgroundStyle()}
        >
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              {showingStarred ? (
                <p className="text-muted-foreground">No starred messages</p>
              ) : (
                <p className="text-muted-foreground">No messages yet. Say hello!</p>
              )}
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div 
                key={message.id} 
                id={`message-${message.id}`}
                className={cn(
                  searchResults.length > 0 && 
                  currentSearchIndex >= 0 && 
                  searchResults[currentSearchIndex]?.id === message.id 
                    ? "bg-yellow-100/30 rounded-lg -mx-2 px-2 py-1" 
                    : ""
                )}
              >
                <ChatMessage 
                  message={message} 
                  onReply={handleReplyToMessage}
                  onDelete={handleDeleteMessage}
                  onReact={handleReactToMessage}
                  onStar={handleStarMessage}
                  onCopy={handleCopyMessage}
                  onForward={handleForwardMessage}
                />
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Media viewer dialog */}
        <Dialog open={!!viewingMedia} onOpenChange={() => setViewingMedia(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{viewingMedia?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center">
              {viewingMedia?.type === 'image' ? (
                <img 
                  src={viewingMedia.url} 
                  alt={viewingMedia.name} 
                  className="max-h-[70vh] max-w-full object-contain"
                />
              ) : viewingMedia?.type === 'video' ? (
                <video 
                  src={viewingMedia.url} 
                  className="max-h-[70vh] max-w-full" 
                  controls 
                  autoPlay
                />
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Replying to message indicator */}
        {replyingTo && (
          <div className="px-4 py-2 border-t flex items-start justify-between bg-muted/20">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                Replying to {replyingTo.sender.name}
              </p>
              <p className="text-sm truncate">{replyingTo.content}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 flex-shrink-0" 
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Message input */}
        <div className="p-3 border-t bg-background">
          <div className="flex items-end gap-2">
            <MessageAttachmentUploader
              onAttachmentSelect={handleAttachmentSelect}
              onAttachmentRemove={handleAttachmentRemove}
              currentAttachment={attachment ? {
                file: attachment,
                type: attachmentType || 'document',
                preview: attachmentPreview || undefined
              } : null}
            />
            
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[2.5rem] max-h-40 resize-none"
              rows={1}
              disabled={isBlocked}
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
              disabled={(newMessage.trim() === "" && !attachment) || isBlocked}
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
