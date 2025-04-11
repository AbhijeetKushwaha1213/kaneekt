
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

const AuthForm = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'signup' ? 'register' : 'login';
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    if (user) {
      console.log("AuthForm - User is authenticated, redirecting to /chats");
      navigate("/chats");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Attempting to log in with:", email);

    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        
        let errorMessage = error.message;
        // Handle specific error cases
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email to confirm your account before logging in.";
        } else if (error.message.includes("Invalid login")) {
          errorMessage = "Invalid email or password. Please try again.";
        }
        
        toast({
          title: "Authentication error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log("Login successful, redirecting to /chats");
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        setTimeout(() => navigate("/chats"), 100);
      }
    } catch (error: any) {
      console.error("Login exception:", error);
      toast({
        title: "Authentication error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Attempting to register with:", email, name);

    try {
      if (!name || !email || !password) {
        throw new Error("Please fill in all required fields");
      }
      
      if (password.length < 6) {
        throw new Error("Password should be at least 6 characters long");
      }
      
      const { error, data } = await signUp(email, password, { name });
      
      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Registration error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Registration successful:", data);
        
        // Check if email confirmation is required
        if (!data?.session) {
          toast({
            title: "Registration successful",
            description: "Please check your email for a confirmation link before logging in.",
          });
          setActiveTab('login');
        } else {
          toast({
            title: "Registration successful",
            description: "Welcome! You are now logged in.",
          });
          setTimeout(() => navigate("/chats"), 100);
        }
      }
    } catch (error: any) {
      console.error("Registration exception:", error);
      toast({
        title: "Registration error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Name</Label>
                  <Input 
                    id="register-name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthForm;
