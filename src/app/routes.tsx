import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "./components/RootLayout";
import { RegisterPage } from "./components/RegisterPage";
import { LoginPage } from "./components/LoginPage";
import { DashboardPage } from "./components/DashboardPage";
import { AddIncomePage } from "./components/AddIncomePage";
import { AddExpensePage } from "./components/AddExpensePage";
import { TransactionHistoryPage } from "./components/TransactionHistoryPage";
import { CategoriesPage } from "./components/CategoriesPage";

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
    ],
  },
]);
