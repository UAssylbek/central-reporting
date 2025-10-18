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
import { ForgotPasswordPage } from "../../pages/ForgotPasswordPage/ForgotPasswordPage";
import { ResetPasswordPage } from "../../pages/ResetPasswordPage/ResetPasswordPage";
import { HomePage } from "../../pages/HomePage/HomePage";
import { DashboardPage } from "../../pages/DashboardPage/DashboardPage";
import { UsersPage } from "../../pages/UsersPage/UsersPage";
import { NotFoundPage } from "../../pages/NotFoundPage/NotFoundPage";
import { ProfilePage } from "../../pages/ProfilePage";

// Новые страницы-заглушки
import { CentralizationPage } from "../../pages/CentralizationPage/CentralizationPage";
import { LongTermAssetsPage } from "../../pages/LongTermAssetsPage/LongTermAssetsPage";
import { PayrollPage } from "../../pages/PayrollPage/PayrollPage";
import { NomenclaturePage } from "../../pages/NomenclaturePage/NomenclaturePage";
import { BankCashPage } from "../../pages/BankCashPage/BankCashPage";
import { AdministrationPage } from "../../pages/AdministrationPage/AdministrationPage";

// Специальные страницы отчётов
import { ConsolidatedTariffPage } from "../../pages/ConsolidatedTariffPage/ConsolidatedTariffPage";
import { TariffListPage } from "../../pages/TariffListPage/TariffListPage";

export function AppRouter() {
  return (
    <Routes>
      {/* Публичные роуты с AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Защищенные роуты с MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Новые страницы-заглушки (доступны всем авторизованным) */}
          <Route path="/centralization" element={<CentralizationPage />} />
          <Route path="/long-term-assets" element={<LongTermAssetsPage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/nomenclature" element={<NomenclaturePage />} />
          <Route path="/bank-cash" element={<BankCashPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Специальные страницы отчётов */}
          <Route
            path="/payroll/consolidated-tariff"
            element={<ConsolidatedTariffPage />}
          />
          <Route path="/payroll/tariff-list" element={<TariffListPage />} />

          {/* Управление пользователями - для admin и moderator */}
          <Route element={<RoleGuard allowedRoles={["admin", "moderator"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* Администрирование - только для admin */}
          <Route element={<RoleGuard allowedRoles={["admin"]} />}>
            <Route path="/administration" element={<AdministrationPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
