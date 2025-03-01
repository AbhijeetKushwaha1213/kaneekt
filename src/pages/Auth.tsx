
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Calendar, MapPin, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { AuthUser } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    gender: "male",
    dob: "",
    location: "",
    avatar: null as File | null,
  });
  
  // For step-by-step signup process
  const [signupStep, setSignupStep] = useState(1);
  
  // Check if user is already logged in
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData.isLoggedIn) {
          // User is already logged in, redirect to chats
          navigate("/chats");
        }
      } catch (error) {
        console.error("Failed to parse user data", error);
        // Clear invalid data
        localStorage.removeItem("user");
      }
    }
  }, [navigate]);
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!validateEmail(loginForm.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get all registered users
      const allUsers = localStorage.getItem("allUsers");
      let users: AuthUser[] = [];
      
      if (allUsers) {
        users = JSON.parse(allUsers);
      }
      
      // Find user with matching email
      const user = users.find(u => u.email.toLowerCase() === loginForm.email.toLowerCase());
      
      if (user) {
        // In real app, we'd check password hash, but for demo we'll just check equality
        if (user.password === loginForm.password) {
          // Mark as logged in
          user.isLoggedIn = true;
          
          // Update in users list
          localStorage.setItem("allUsers", JSON.stringify(users));
          
          // Set current user
          localStorage.setItem("user", JSON.stringify(user));
          
          // Create user profile if not exists
          if (!localStorage.getItem("userProfile")) {
            const userProfile = {
              id: user.id,
              name: user.name,
              age: 0, // Will be calculated from DOB
              location: user.location || "",
              avatar: user.avatar || "/placeholder.svg",
              bio: "I'm new to syncterest!",
              interests: ["Technology", "Communication"],
              gender: user.gender || "",
              dob: user.dob || "",
              email: user.email,
              username: user.username,
              followers: 0,
              following: 0,
              isPrivate: false
            };
            localStorage.setItem("userProfile", JSON.stringify(userProfile));
          }
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${user.name}!`
          });
          
          navigate("/chats");
        } else {
          toast({
            title: "Login failed",
            description: "Invalid password. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // No user found with this email
        setShowSignupDialog(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignupNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate first step
    if (signupStep === 1) {
      if (!signupForm.username || !signupForm.email || !signupForm.password) {
        toast({
          title: "Missing information",
          description: "Please fill in all the required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Email validation
      if (!validateEmail(signupForm.email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }
      
      // Password strength validation
      if (!validatePassword(signupForm.password)) {
        toast({
          title: "Weak password",
          description: "Password must be at least 8 characters long",
          variant: "destructive"
        });
        return;
      }
      
      // Check if email is already registered
      const allUsers = localStorage.getItem("allUsers");
      if (allUsers) {
        const users: AuthUser[] = JSON.parse(allUsers);
        const existingUser = users.find(u => u.email.toLowerCase() === signupForm.email.toLowerCase());
        
        if (existingUser) {
          toast({
            title: "Email already registered",
            description: "This email is already in use. Please log in or use a different email.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Check if username is already taken
      if (allUsers) {
        const users: AuthUser[] = JSON.parse(allUsers);
        const existingUsername = users.find(u => u.username.toLowerCase() === signupForm.username.toLowerCase());
        
        if (existingUsername) {
          toast({
            title: "Username taken",
            description: "This username is already taken. Please choose a different one.",
            variant: "destructive"
          });
          return;
        }
      }
      
      setSignupStep(2);
    } else if (signupStep === 2) {
      if (!signupForm.fullName || !signupForm.gender || !signupForm.dob) {
        toast({
          title: "Missing information",
          description: "Please fill in all the required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Age validation
      const birthDate = new Date(signupForm.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13) {
        toast({
          title: "Age restriction",
          description: "You must be at least 13 years old to sign up",
          variant: "destructive"
        });
        return;
      }
      
      handleSignupSubmit();
    }
  };
  
  const handleSignupSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Create user ID
      const userId = `user-${Date.now()}`;
      
      // Create authenticated user
      const authUser: AuthUser & { password?: string } = {
        id: userId,
        email: signupForm.email,
        username: signupForm.username,
        name: signupForm.fullName,
        avatar: "/placeholder.svg", // Default avatar
        isLoggedIn: true,
        createdAt: new Date().toISOString(),
        password: signupForm.password, // In real app, this would be hashed
        location: signupForm.location,
        gender: signupForm.gender,
        dob: signupForm.dob
      };
      
      // Get existing users or create empty array
      const allUsers = localStorage.getItem("allUsers");
      let users: AuthUser[] = [];
      
      if (allUsers) {
        users = JSON.parse(allUsers);
      }
      
      // Add new user
      users.push(authUser);
      
      // Save to localStorage
      localStorage.setItem("allUsers", JSON.stringify(users));
      
      // Save current user (without password for security)
      const currentUser = { ...authUser };
      delete currentUser.password;
      localStorage.setItem("user", JSON.stringify(currentUser));
      
      // Create user profile
      const userProfile = {
        id: userId,
        name: signupForm.fullName,
        age: 0, // Will be calculated from DOB
        location: signupForm.location || "",
        avatar: "/placeholder.svg",
        bio: "I'm new to syncterest!",
        interests: ["Technology", "Communication"],
        gender: signupForm.gender,
        dob: signupForm.dob,
        email: signupForm.email,
        username: signupForm.username,
        followers: 0,
        following: 0,
        isPrivate: false
      };
      
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      
      toast({
        title: "Account created",
        description: "Welcome to syncterest! Your account has been created successfully."
      });
      
      // Redirect to chats page
      navigate("/chats");
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignupForm({
        ...signupForm,
        avatar: file
      });
    }
  };
  
  const handleCreateAccount = () => {
    setShowSignupDialog(false);
    setActiveTab("signup");
    // Pre-fill email from login attempt
    setSignupForm({
      ...signupForm,
      email: loginForm.email
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-4 bg-background">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-center">syncterest</h1>
        </div>
      </header>
      
      {/* Auth form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {activeTab === "login" ? "Welcome back" : "Join syncterest"}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === "login" 
                ? "Sign in to connect with like-minded people" 
                : "Create an account to start connecting"}
            </p>
          </div>
          
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm" 
                      className="px-0 h-auto font-normal"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => setActiveTab("signup")}
                  >
                    Sign up
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {signupStep === 1 ? (
                <form onSubmit={handleSignupNext} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="Choose a username"
                        className="pl-10"
                        value={signupForm.username}
                        onChange={(e) => setSignupForm({...signupForm, username: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    Continue
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-normal"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignupNext} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <RadioGroup
                      value={signupForm.gender}
                      onValueChange={(value) => setSignupForm({...signupForm, gender: value})}
                      className="flex space-x-8 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="font-normal">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="font-normal">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="font-normal">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dob"
                        type="date"
                        className="pl-10"
                        value={signupForm.dob}
                        onChange={(e) => setSignupForm({...signupForm, dob: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Enter your location"
                        className="pl-10"
                        value={signupForm.location}
                        onChange={(e) => setSignupForm({...signupForm, location: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Profile Picture</Label>
                    <div className="relative">
                      <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="pl-10"
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSignupStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Account creation dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account not found</DialogTitle>
            <DialogDescription>
              No account was found with this email address. Would you like to create a new account?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowSignupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAccount}>
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
