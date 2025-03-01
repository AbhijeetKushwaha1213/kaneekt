
import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Smile } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/ui/chat-message";
import { useToast } from "@/hooks/use-toast";
import { Message, AuthUser } from "@/types";

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
  
  useEffect(() => {
    // Check if user is logged in
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
  }, [navigate, toast]);
  
  useEffect(() => {
    // Try to get chat partner data
    if (!chatId) return;
    
    // First, check for direct conversations
    const storedConversations = localStorage.getItem("conversations");
    if (storedConversations) {
      try {
        const conversations = JSON.parse(storedConversations);
        const currentConversation = conversations.find(
          (conv: any) => conv.user.id === chatId || conv.id === chatId
        );
        
        if (currentConversation) {
          setChatPartner({
            id: currentConversation.user.id,
            name: currentConversation.user.name,
            avatar: currentConversation.user.avatar || "/placeholder.svg",
            email: "",
            username: "",
            isLoggedIn: true,
            createdAt: new Date().toISOString()
          });
          
          // Load chat history if exists
          const chatKey = `chat_${chatId}`;
          const storedMessages = localStorage.getItem(chatKey);
          
          if (storedMessages) {
            const parsedMessages = JSON.parse(storedMessages);
            setMessages(parsedMessages);
          } else {
            // For demo purposes, use mock data for chats that don't have history yet
            setMessages(MOCK_MESSAGES);
          }
          return;
        }
      } catch (error) {
        console.error("Failed to parse conversations", error);
      }
    }
    
    // If no conversation found, check all registered users
    const allUsers = localStorage.getItem("allUsers");
    if (allUsers) {
      try {
        const usersList = JSON.parse(allUsers);
        const targetUser = usersList.find((user: AuthUser) => user.id === chatId);
        
        if (targetUser) {
          setChatPartner(targetUser);
          
          // Create new conversation if it doesn't exist
          let conversations = [];
          if (storedConversations) {
            conversations = JSON.parse(storedConversations);
          }
          
          // Check if conversation already exists
          const existingConv = conversations.find(
            (conv: any) => conv.user.id === chatId
          );
          
          if (!existingConv && currentUser) {
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
          }
          
          // For demo purposes, use mock data for new chats
          setMessages(MOCK_MESSAGES);
          return;
        }
      } catch (error) {
        console.error("Failed to parse users", error);
      }
    }
    
    // If no user found, use default values for demo
    setChatPartner({
      id: "u1",
      name: "Emma",
      avatar: "/placeholder.svg",
      email: "",
      username: "",
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    });
    setMessages(MOCK_MESSAGES);
  }, [chatId, currentUser]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !currentUser) return;
    
    const message: Message = {
      id: `new-${Date.now()}`,
      content: newMessage,
      timestamp: new Date(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar || "/placeholder.svg"
      },
      isCurrentUser: true
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
                  content: message.content,
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
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
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
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <div className="p-3 border-t bg-background">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="Attach file">
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[2.5rem] max-h-40 resize-none"
              rows={1}
            />
            
            <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="Add emoji">
              <Smile className="h-5 w-5" />
            </Button>
            
            <Button 
              onClick={handleSendMessage} 
              disabled={newMessage.trim() === ""}
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
