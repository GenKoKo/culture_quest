import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme"; // Import ThemeProvider
import Home from "@/pages/home";
import Quiz from "@/pages/quiz";
import NotFound from "@/pages/not-found";
import ProfilePage from "@/pages/profile"; // Import ProfilePage
import { useAuth } from "@/hooks/useAuth"; // To protect routes
import { Redirect } from "wouter";

// Helper for protected routes
const ProtectedRoute = (props: { component: React.ComponentType<any>, path: string, [key: string]: any }) => {
  const { user, isLoading } = useAuth();
  const { component: Component, ...rest } = props;

  if (isLoading) {
    // Optional: return a global loading spinner here
    return null;
  }

  if (!user) {
    return <Redirect to="/" />; // Or to a dedicated login page e.g. /login
  }

  return <Route {...rest} component={Component} />;
};


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quiz/:cultureId" component={Quiz} />
      <ProtectedRoute path="/profile" component={ProfilePage} /> {/* Add protected profile route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
