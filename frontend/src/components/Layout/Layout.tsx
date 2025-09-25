// src/components/Layout/Layout.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUser, logout } from "../../utils/auth";
import "./Layout.css";

interface DropdownItem {
  label: string;
  path?: string;
  action?: () => void;
}

interface DropdownGroup {
  title?: string;
  items: DropdownItem[];
}

interface NavigationTab {
  path: string;
  label: string | React.ReactElement;
  isIcon?: boolean;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getUser();
  const location = useLocation();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const isAdmin = user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownMenus: Record<string, DropdownGroup[]> = {
    "/dashboard": [
      {
        items: [
          {
            label: "Администраторы бюджетных программ",
            path: "/dashboard/budget-admins",
          },
          { label: "Источники данных", path: "/dashboard/data-sources" },
          { label: "Организации", path: "/dashboard/organizations" },
        ],
      },
      {
        title: "Создать",
        items: [{ label: "Запрос отчета", path: "/dashboard/create-report" }],
      },
    ],
    "/centralization": [
      {
        title: "Объекты централизаций",
        items: [
          {
            label: "Администраторы бюджетных программ",
            path: "/centralization/budget-admins",
          },
          { label: "Источники данных", path: "/centralization/data-sources" },
          { label: "Организации", path: "/centralization/organizations" },
          { label: "Запросы отчетов", path: "/centralization/report-requests" },
        ],
      },
      {
        title: "Обслуживание",
        items: [
          {
            label: "Проверка подключения к организациям",
            path: "/centralization/connection-check",
          },
          {
            label: "Анализ подключений к организация",
            path: "/centralization/connection-analysis",
          },
          {
            label: "Анализ выполнения запросов",
            path: "/centralization/request-analysis",
          },
          {
            label: "Состояния запросов отчетов",
            path: "/centralization/request-status",
          },
          {
            label: "Рассылка отчетов",
            path: "/centralization/report-distribution",
          },
          {
            label: "Разрешения корректировки документов к организациям",
            path: "/centralization/document-permissions",
          },
          {
            label: "Разрешения изменения контроля ведения учета к организациям",
            path: "/centralization/accounting-permissions",
          },
        ],
      },
      {
        title: "Сервис",
        items: [
          {
            label: "Настройка параметров учета",
            path: "/centralization/accounting-settings",
          },
        ],
      },
    ],
    "/long-term-assets": [
      {
        items: [
          {
            label: "Классификация расходов",
            path: "/long-term-assets/expense-classification",
          },
        ],
      },
      {
        title: "Отчеты",
        items: [
          {
            label: "Сводная ведомость остатков ОС",
            path: "/long-term-assets/consolidated-balance",
          },
          {
            label: "Ведомость остатков ОС",
            path: "/long-term-assets/balance-statement",
          },
          {
            label: "Поиск долгосрочных активов",
            path: "/long-term-assets/asset-search",
          },
        ],
      },
    ],
    "/payroll": [
      {
        items: [
          { label: "Физические лица", path: "/payroll/individuals" },
          { label: "Начисления организаций", path: "/payroll/org-accruals" },
          { label: "Удержания организаций", path: "/payroll/org-deductions" },
          { label: "Вычеты ИПН", path: "/payroll/ipn-deductions" },
          {
            label: "Классификация расходов",
            path: "/payroll/expense-classification",
          },
          {
            label: "Сведения о трудоустройстве",
            path: "/payroll/employment-info",
          },
        ],
      },
      {
        title: "Отчеты",
        items: [
          {
            label: "Сводная расчетная ведомость",
            path: "/payroll/consolidated-payroll",
          },
          {
            label: "Расчетная ведомость организации",
            path: "/payroll/org-payroll",
          },
          {
            label: "Сводный тарификационный список",
            path: "/payroll/consolidated-tariff",
          },
          { label: "Тарификационный список", path: "/payroll/tariff-list" },
          {
            label: "Штатное расписание по своему персоналу",
            path: "/payroll/staff-schedule",
          },
          {
            label: "Тарификация сотрудников по форме 04-111",
            path: "/payroll/tariff-04-111",
          },
          {
            label: "Сводный отчет о начислениях и удержаниях",
            path: "/payroll/consolidated-accrual-deduction",
          },
          {
            label: "Отчет по видам начислений и удержаний",
            path: "/payroll/accrual-deduction-types",
          },
          {
            label: "Анализ и поиск физических лиц",
            path: "/payroll/individual-search",
          },
          {
            label: "Аналитический отчет по работникам организации",
            path: "/payroll/employee-analytics",
          },
          {
            label: "Сверка сумм выплаченной зарплаты из онлайн банкинга",
            path: "/payroll/online-banking-reconciliation",
          },
          {
            label:
              "Сверка сумм выплаченной зарплаты с казначейской формой 5-15 А",
            path: "/payroll/treasury-reconciliation",
          },
          {
            label: "Сводный список работников организации",
            path: "/payroll/consolidated-employee-list",
          },
        ],
      },
    ],
    "/nomenclature": [
      {
        items: [
          {
            label: "Классификация расходов",
            path: "/nomenclature/expense-classification",
          },
        ],
      },
      {
        title: "Отчеты",
        items: [
          {
            label: "Сводная ведомость остатков ТМЗ",
            path: "/nomenclature/consolidated-tmz-balance",
          },
          {
            label: "Ведомость остатков ТМЗ",
            path: "/nomenclature/tmz-balance",
          },
        ],
      },
    ],
    "/bank-cash": [
      {
        items: [
          {
            label: "Классификация расходов",
            path: "/bank-cash/expense-classification",
          },
          { label: "Статьи затрат", path: "/bank-cash/cost-items" },
        ],
      },
      {
        title: "Отчеты",
        items: [
          {
            label: "Отчет об исполнении денежных средств",
            path: "/bank-cash/cash-execution-report",
          },
          {
            label: "Отчет по расходам по форме 4-20",
            path: "/bank-cash/expense-report-4-20",
          },
          {
            label: "Отчет по расшифровкам оплаченных и принятых обязательств",
            path: "/bank-cash/obligation-breakdown-report",
          },
          {
            label: "Реестр счетов к оплате",
            path: "/bank-cash/payable-accounts-registry",
          },
          {
            label: "Сводный отчет об исполнении денежных средств",
            path: "/bank-cash/consolidated-cash-execution",
          },
          {
            label: "Сводный отчет по дебиторской и кредиторской задолженности",
            path: "/bank-cash/consolidated-debt-report",
          },
        ],
      },
    ],
    "/administration": [
      {
        items: [
          { label: "Обслуживание", path: "/administration/maintenance" },
          {
            label: "Общие настройки",
            path: "/administration/general-settings",
          },
          { label: "Настройки пользователей и прав", path: "/users" },
          {
            label: "Регламентные и фоновые задания",
            path: "/administration/scheduled-jobs",
          },
        ],
      },
      {
        title: "См. также",
        items: [
          {
            label: "Удаление помеченных объектов",
            path: "/administration/delete-marked-objects",
          },
          {
            label: "Поиск и удаление дублей",
            path: "/administration/find-delete-duplicates",
          },
        ],
      },
    ],
  };

  const baseNavigationTabs: NavigationTab[] = [
    {
      path: "/home",
      label: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
      isIcon: true,
    },
    { path: "/dashboard", label: "Главное" },
    { path: "/long-term-assets", label: "Долгосрочные активы" },
    { path: "/payroll", label: "Зарплата и кадры" },
    { path: "/nomenclature", label: "Номенклатура и склад" },
    { path: "/bank-cash", label: "Банк и касса" },
  ];

  const navigationTabs: NavigationTab[] = isAdmin
    ? [
        ...baseNavigationTabs,
        { path: "/centralization", label: "Централизация" },
        { path: "/administration", label: "Администрирование" },
      ]
    : baseNavigationTabs;

  return (
    <div className="layout">
      <header className="header">
        <nav>
          <div className="nav-tabs">
            {navigationTabs.map((tab) => (
              <div
                key={tab.path}
                className="nav-tab-wrapper"
                onMouseEnter={() => setHoveredTab(tab.path)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Link
                  to={tab.path}
                  className={`nav-tab ${
                    location.pathname === tab.path ? "active" : ""
                  } ${tab.isIcon ? "nav-tab-icon" : ""}`}
                  title={tab.isIcon ? "Начальная страница" : undefined}
                >
                  {tab.label}
                </Link>

                {/* Dropdown меню */}
                {hoveredTab === tab.path &&
                  dropdownMenus[tab.path] &&
                  !tab.isIcon && (
                    <div className="dropdown-menu">
                      {dropdownMenus[tab.path].map((group, groupIndex) => (
                        <div key={groupIndex} className="dropdown-group">
                          {group.title && (
                            <div className="dropdown-group-title">
                              {group.title}
                            </div>
                          )}
                          {group.items.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              to={item.path || "#"}
                              className="dropdown-item"
                              onClick={item.action}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {/* Поиск */}
            <div className="nav-search">
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-navbar"
              />
              <button className="search-button" type="button">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
                </svg>
              </button>
            </div>

            {/* Кнопка выхода */}
            <div className="nav-actions">
              <button onClick={logout} className="logout-btn">
                Выйти
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
