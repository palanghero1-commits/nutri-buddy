import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { NutriDataProvider } from "@/hooks/useNutriData";
import AdminRoute from "@/components/AdminRoute";
import UserRoute from "@/components/UserRoute";
import HomePage from "@/pages/HomePage";
import AdminLogin from "@/pages/AdminLogin";
import UserLogin from "@/pages/UserLogin";
import UserRegister from "@/pages/UserRegister";
import UserPortal from "@/pages/UserPortal";
import Dashboard from "@/pages/Dashboard";
import ChildrenList from "@/pages/ChildrenList";
import MealTracker from "@/pages/MealTracker";
import GrowthMonitor from "@/pages/GrowthMonitor";
import AlertsPage from "@/pages/AlertsPage";
import ReportsPage from "@/pages/ReportsPage";
import AIAssistant from "@/pages/AIAssistant";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NutriDataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/user/register" element={<UserRegister />} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="/admin/children" element={<AdminRoute><ChildrenList /></AdminRoute>} />
              <Route path="/admin/meals" element={<AdminRoute><MealTracker /></AdminRoute>} />
              <Route path="/admin/growth" element={<AdminRoute><GrowthMonitor /></AdminRoute>} />
              <Route path="/admin/alerts" element={<AdminRoute><AlertsPage /></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
              <Route path="/admin/assistant" element={<AdminRoute><AIAssistant /></AdminRoute>} />
              <Route path="/user" element={<UserRoute><UserPortal /></UserRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NutriDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
