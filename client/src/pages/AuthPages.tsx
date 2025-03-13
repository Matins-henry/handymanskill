import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggeredContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Password reset form schema
const resetSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export function AuthPages() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Password reset form
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (values: z.infer<typeof loginSchema>) => {
      return apiRequest("POST", "/api/auth/login", values);
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setLocation("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (values: z.infer<typeof registerSchema>) => {
      const { confirmPassword, ...userData } = values;
      return apiRequest("POST", "/api/auth/register", userData);
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created! You can now log in.",
      });
      setActiveTab("login");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Username may already be taken",
        variant: "destructive",
      });
    },
  });

  // Password reset mutation (mock)
  const resetMutation = useMutation({
    mutationFn: (values: z.infer<typeof resetSchema>) => {
      // This would be a real API call in a production environment
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for instructions to reset your password.",
      });
      setActiveTab("login");
    },
    onError: () => {
      toast({
        title: "Password reset failed",
        description: "Unable to send reset email. Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values);
  };

  const onResetSubmit = (values: z.infer<typeof resetSchema>) => {
    resetMutation.mutate(values);
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-md w-full"
      >
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <motion.div variants={staggeredContainer} initial="hidden" animate="visible">
                      <motion.div variants={fadeIn}>
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="Enter your username" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={fadeIn}>
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter your password" 
                                    className="pl-10 pr-10" 
                                    {...field} 
                                  />
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </motion.div>

                    <motion.div variants={fadeIn}>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Log in"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  variant="link" 
                  className="text-sm font-normal w-full"
                  onClick={() => setActiveTab("reset")}
                >
                  Forgot your password?
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                  Enter your details to create a new account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <motion.div variants={staggeredContainer} initial="hidden" animate="visible">
                      <motion.div variants={fadeIn}>
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="Choose a username" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={fadeIn}>
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={fadeIn}>
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Create a password" 
                                    className="pl-10 pr-10" 
                                    {...field} 
                                  />
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={fadeIn}>
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Confirm your password" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </motion.div>

                    <motion.div variants={fadeIn}>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create account"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Reset Tab */}
          <TabsContent value="reset">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your email to receive password reset instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                    <motion.div variants={fadeIn} initial="hidden" animate="visible">
                      <FormField
                        control={resetForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="email" 
                                  placeholder="Enter your email" 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={fadeIn} initial="hidden" animate="visible">
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={resetMutation.isPending}
                      >
                        {resetMutation.isPending ? "Sending..." : "Send reset instructions"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="link" 
                  className="text-sm font-normal w-full"
                  onClick={() => setActiveTab("login")}
                >
                  Back to login
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

export default AuthPages;