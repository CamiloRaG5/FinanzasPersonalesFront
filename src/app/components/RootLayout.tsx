import { Outlet } from "react-router";
import { AuthProvider } from "../contexts/AuthContext";
import { TransactionProvider } from "../contexts/TransactionContext";
import { Toaster } from "sonner";

export function RootLayout() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <div className="min-h-screen bg-gray-50">
          <Outlet />
          <Toaster position="top-center" />
        </div>
      </TransactionProvider>
    </AuthProvider>
  );
}
