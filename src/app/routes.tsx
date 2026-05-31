import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { RegisterPage } from "./components/RegisterPage";
import { LoginPage } from "./components/LoginPage";
import { DashboardPage } from "./components/DashboardPage";
import { AddIncomePage } from "./components/AddIncomePage";
import { AddExpensePage } from "./components/AddExpensePage";
import { TransactionHistoryPage } from "./components/TransactionHistoryPage";
import { CategoriesPage } from "./components/CategoriesPage";
import { CreateBudgetPage } from "./components/CreateBudgetPage";
import { BudgetProgressPage } from "./components/BudgetProgressPage";
import { SettingsPage } from "./components/SettingsPage";
import { ReportsPage } from "./components/ReportsPage";
import { AlertSettingsPage } from "./components/AlertSettingsPage";
import { SavingsRecommendationsPage } from "./components/SavingsRecommendationsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "register", Component: RegisterPage },
      { path: "login", Component: LoginPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "add-income", Component: AddIncomePage },
      { path: "add-expense", Component: AddExpensePage },
      { path: "history", Component: TransactionHistoryPage },
      { path: "categories", Component: CategoriesPage },
      { path: "create-budget", Component: CreateBudgetPage },
      { path: "budget-progress", Component: BudgetProgressPage },
      { path: "settings", Component: SettingsPage },
      { path: "reports", Component: ReportsPage },
      { path: "alert-settings", Component: AlertSettingsPage },
      { path: "savings", Component: SavingsRecommendationsPage },
    ],
  },
]);
