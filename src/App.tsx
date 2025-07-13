
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ClientForm from "./pages/ClientForm";
import ClientDetails from "./pages/ClientDetails";
import DebtManagement from "./pages/DebtManagement";
import AssetAccumulation from "./pages/AssetAccumulation";
import MonthlyBudget from "./pages/MonthlyBudget";
import BudgetHistory from "./pages/BudgetHistory";
import Retirement from "./pages/Retirement";
import SuccessionPlanning from "./pages/SuccessionPlanning";
import FinalReport from "./pages/FinalReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="client/new" element={<ClientForm />} />
              <Route path="client/:id" element={<ClientDetails />} />
              <Route path="client/:id/debts" element={<DebtManagement />} />
              <Route path="client/:id/assets" element={<AssetAccumulation />} />
              <Route path="client/:id/budget" element={<MonthlyBudget />} />
              <Route path="client/:id/budget/history" element={<BudgetHistory />} />
              <Route path="client/:id/retirement" element={<Retirement />} />
              <Route path="client/:id/succession" element={<SuccessionPlanning />} />
              <Route path="client/:id/report" element={<FinalReport />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
