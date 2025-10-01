// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import RequireAdmin from "./components/RequireAdmin/RequireAdmin";
import RequireModerator from "./components/RequireModerator/RequireModerator";
import RequireAdminOrModerator from "./components/RequireAdminOrModerator/RequireAdminOrModerator";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import Welcome from "./pages/Welcome/Welcome";
import Users from "./pages/Users/Users";

// Новые страницы-заглушки
import Centralization from "./pages/Centralization/Centralization";
import LongTermAssets from "./pages/LongTermAssets/LongTermAssets";
import Payroll from "./pages/Payroll/Payroll";
import Nomenclature from "./pages/Nomenclature/Nomenclature";
import BankCash from "./pages/BankCash/BankCash";
import Administration from "./pages/Administration/Administration";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <Layout>
                <Outlet />
              </Layout>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Home />} />
            <Route path="/centralization" element={<Centralization />} />
            <Route path="/long-term-assets" element={<LongTermAssets />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/nomenclature" element={<Nomenclature />} />
            <Route path="/bank-cash" element={<BankCash />} />

            {/* ТОЛЬКО для администраторов */}
            <Route element={<RequireAdmin />}>
              <Route path="/administration" element={<Administration />} />
            </Route>

            {/* ТОЛЬКО для модераторов */}
            <Route element={<RequireModerator />}>
              {/* Пока пусто, потом добавите эксклюзивные маршруты модератора */}
            </Route>

            {/* Для ОБОИХ (админ И модератор) */}
            <Route element={<RequireAdminOrModerator />}>
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
