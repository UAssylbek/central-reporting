// frontend/src/app/router/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleGuard } from "./RoleGuard";

// Layouts
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";

// Pages
import { WelcomePage } from "../../pages/WelcomePage/WelcomePage";
import { LoginPage } from "../../pages/LoginPage/LoginPage";
import { HomePage } from "../../pages/HomePage/HomePage";
import { DashboardPage } from "../../pages/DashboardPage/DashboardPage";
import { UsersPage } from "../../pages/UsersPage/UsersPage";
import { NotFoundPage } from "../../pages/NotFoundPage/NotFoundPage";

export function AppRouter() {
  return (
    <Routes>
      {/* Публичные роуты с AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Защищенные роуты с MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Управление пользователями - для admin и moderator */}
          <Route element={<RoleGuard allowedRoles={["admin", "moderator"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
