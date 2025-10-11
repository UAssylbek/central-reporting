// frontend/src/app/layouts/MainLayout.tsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ThemeSwitcher } from "../../shared/components/ThemeSwitcher/ThemeSwitcher";
import { authApi } from "../../shared/api/auth.api";
import {
  Banknote,
  Users,
  Building,
  Package,
  Settings,
  BarChart3,
  Shield,
  Database,
  Building2,
  FileText,
} from "lucide-react";
import { UniversalReportModal } from "../../features/reports/UniversalReportModal/UniversalReportModal";
import { getReportConfig } from "../../features/reports/configs";
import type { ReportType } from "../../shared/types/reports";

// Типы для структуры меню
interface SubMenuItem {
  to: string;
  label: string;
  icon: React.ReactElement;
  description: string;
}

interface CategoryGroup {
  category: string;
  items: SubMenuItem[];
}

type MixedSubItems = (SubMenuItem | CategoryGroup)[];

interface MenuItem {
  to: string;
  label: string;
  icon: React.ReactElement;
  description: string;
  subItems?: SubMenuItem[] | CategoryGroup[] | MixedSubItems;
}

/**
 * Главный Layout для авторизованных пользователей
 * С выпадающим меню под навбаром
 */
export function MainLayout() {
  const navigate = useNavigate();
  const user = authApi.getCurrentUser();
  const isAdmin = user?.role === "admin";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Состояние для модального окна запроса отчета
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportType] = useState<ReportType>("consolidated_statement");

  const handleLogout = async () => {
    authApi.logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    if (isMenuOpen) {
      setHoveredItem(null);
    }
  };

  const handleHomeClick = () => {
    setIsMenuOpen(false);
    setHoveredItem(null);
    navigate("/home");
  };

  const handleReportRequest = () => {
    setIsMenuOpen(false);
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (formData: Record<string, unknown>) => {
    console.log("Report data:", formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Здесь можно добавить toast уведомление
  };

  const selectedConfig = getReportConfig(selectedReportType);

  // Вспомогательная функция для проверки типа subItems
  const isCategoryGroup = (
    item: SubMenuItem | CategoryGroup
  ): item is CategoryGroup => {
    return "category" in item;
  };

  // Список ссылок на одном уровне с иконками
  const links: MenuItem[] = [
    {
      to: "/dashboard",
      label: "Главное",
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
      description: "Главная панель с основными разделами системы",
      subItems: [
        {
          to: "/dashboard/budget-administrators",
          label: "Администраторы бюджетных программ",
          icon: <Users className="w-5 h-5 text-purple-500" />,
          description: "Управление администраторами бюджетных программ",
        },
        {
          to: "/dashboard/data-sources",
          label: "Источник данных",
          icon: <Database className="w-5 h-5 text-cyan-500" />,
          description: "Настройка и управление источниками данных",
        },
        {
          to: "/dashboard/organizations",
          label: "Организации",
          icon: <Building2 className="w-5 h-5 text-orange-500" />,
          description: "Справочник организаций и учреждений",
        },
      ],
    },
    {
      to: "/centralization",
      label: "Централизация",
      icon: <Shield className="w-6 h-6 text-green-500" />,
      description: "Управление централизацией процессов",
      subItems: [
        {
          category: "Объекты централизации",
          items: [
            {
              to: "/centralization/budget-administrators",
              label: "Администраторы бюджетных программ",
              icon: <Users className="w-5 h-5 text-purple-500" />,
              description: "Управление администраторами бюджетных программ",
            },
            {
              to: "/centralization/data-sources",
              label: "Источники данных",
              icon: <Database className="w-5 h-5 text-cyan-500" />,
              description: "Настройка источников данных для централизации",
            },
            {
              to: "/centralization/organizations",
              label: "Организации",
              icon: <Building2 className="w-5 h-5 text-orange-500" />,
              description: "Управление организациями в системе централизации",
            },
            {
              to: "/centralization/report-requests",
              label: "Запросы отчетов",
              icon: <FileText className="w-5 h-5 text-blue-500" />,
              description: "Просмотр и управление запросами отчетов",
            },
          ],
        },
        {
          category: "Обслуживание",
          items: [
            {
              to: "/centralization/connection-check",
              label: "Проверка подключения к организациям",
              icon: <Shield className="w-5 h-5 text-green-500" />,
              description: "Проверка статуса подключения к организациям",
            },
            {
              to: "/centralization/connection-analysis",
              label: "Анализ подключений к организациям",
              icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
              description: "Анализ качества и стабильности подключений",
            },
            {
              to: "/centralization/query-analysis",
              label: "Анализ выполнения запросов",
              icon: <BarChart3 className="w-5 h-5 text-violet-500" />,
              description: "Анализ производительности выполнения запросов",
            },
            {
              to: "/centralization/report-status",
              label: "Состояния запросов отчетов",
              icon: <FileText className="w-5 h-5 text-amber-500" />,
              description: "Мониторинг статусов выполнения отчетов",
            },
            {
              to: "/centralization/report-distribution",
              label: "Рассылка отчетов",
              icon: <Package className="w-5 h-5 text-emerald-500" />,
              description: "Управление автоматической рассылкой отчетов",
            },
            {
              to: "/centralization/document-correction-permissions",
              label: "Разрешения корректировки документов к организациям",
              icon: <Settings className="w-5 h-5 text-rose-500" />,
              description: "Управление правами на корректировку документов",
            },
            {
              to: "/centralization/accounting-control-permissions",
              label:
                "Разрешения изменения контроля ведения учета к организациям",
              icon: <Settings className="w-5 h-5 text-pink-500" />,
              description: "Управление правами на изменение контроля учета",
            },
          ],
        },
        {
          category: "Сервис",
          items: [
            {
              to: "/centralization/accounting-settings",
              label: "Настройка параметров учета",
              icon: <Settings className="w-5 h-5 text-gray-500" />,
              description: "Конфигурация параметров бухгалтерского учета",
            },
          ],
        },
      ],
    },
    {
      to: "/payroll",
      label: "Зарплата и кадры",
      icon: <Users className="w-6 h-6 text-amber-500" />,
      description: "Кадровый учет и расчет зарплаты",
      subItems: [
        {
          to: "/payroll/individuals",
          label: "Физические лица",
          icon: <Users className="w-5 h-5 text-purple-500" />,
          description: "Реестр физических лиц и сотрудников",
        },
        {
          to: "/payroll/organization-accruals",
          label: "Начисления организаций",
          icon: <BarChart3 className="w-5 h-5 text-green-500" />,
          description: "Управление начислениями по организациям",
        },
        {
          to: "/payroll/organization-deductions",
          label: "Удержания организаций",
          icon: <BarChart3 className="w-5 h-5 text-red-500" />,
          description: "Управление удержаниями по организациям",
        },
        {
          to: "/payroll/ipn-deductions",
          label: "Вычеты ИПН",
          icon: <FileText className="w-5 h-5 text-orange-500" />,
          description: "Управление вычетами индивидуального подоходного налога",
        },
        {
          to: "/payroll/expense-classification",
          label: "Классификация расходов",
          icon: <Package className="w-5 h-5 text-indigo-500" />,
          description: "Классификация расходов на оплату труда",
        },
        {
          to: "/payroll/employment-info",
          label: "Сведения о трудоустройстве",
          icon: <Building2 className="w-5 h-5 text-cyan-500" />,
          description: "Информация о трудоустройстве сотрудников",
        },
        {
          category: "Отчеты",
          items: [
            {
              to: "/payroll/consolidated-payroll",
              label: "Сводная расчетная ведомость",
              icon: <FileText className="w-5 h-5 text-blue-600" />,
              description: "Сводная ведомость по начислению зарплаты",
            },
            {
              to: "/payroll/organization-payroll",
              label: "Расчетная ведомость организации",
              icon: <FileText className="w-5 h-5 text-blue-500" />,
              description: "Расчетная ведомость по конкретной организации",
            },
            {
              to: "/payroll/consolidated-tariff",
              label: "Сводный тарификационный список",
              icon: <FileText className="w-5 h-5 text-violet-600" />,
              description:
                "Сводный тарификационный список по всем организациям",
            },
            {
              to: "/payroll/tariff-list",
              label: "Тарификационный список",
              icon: <FileText className="w-5 h-5 text-violet-500" />,
              description: "Тарификационный список организации",
            },
            {
              to: "/payroll/staffing-table",
              label: "Штатное расписание по всему персоналу",
              icon: <FileText className="w-5 h-5 text-emerald-500" />,
              description: "Штатное расписание всех сотрудников",
            },
            {
              to: "/payroll/tariffication-04-111",
              label: "Тарификация сотрудников по форме 04-111",
              icon: <FileText className="w-5 h-5 text-teal-500" />,
              description: "Отчет по тарификации согласно форме 04-111",
            },
            {
              to: "/payroll/consolidated-accruals-deductions",
              label: "Сводный отчет о начислениях и удержаниях",
              icon: <FileText className="w-5 h-5 text-amber-600" />,
              description: "Сводный отчет по всем начислениям и удержаниям",
            },
            {
              to: "/payroll/accruals-deductions-types",
              label: "Отчет по видам начислений и удержаний",
              icon: <FileText className="w-5 h-5 text-amber-500" />,
              description: "Детальный отчет по типам начислений и удержаний",
            },
            {
              to: "/payroll/individuals-search",
              label: "Анализ и поиск физических лиц",
              icon: <Users className="w-5 h-5 text-purple-500" />,
              description: "Поиск и анализ данных по физическим лицам",
            },
            {
              to: "/payroll/employee-analytics",
              label: "Аналитический отчет по работникам организации",
              icon: <BarChart3 className="w-5 h-5 text-pink-500" />,
              description: "Аналитика по сотрудникам организации",
            },
            {
              to: "/payroll/online-banking-reconciliation",
              label: "Сверка сумм выплаченной зарплаты из онлайн банкинга",
              icon: <Banknote className="w-5 h-5 text-green-600" />,
              description: "Сверка выплат с данными онлайн банкинга",
            },
            {
              to: "/payroll/treasury-reconciliation",
              label:
                "Сверка сумм выплаченной зарплаты с казначейской формой 5-15 А",
              icon: <Banknote className="w-5 h-5 text-green-500" />,
              description: "Сверка выплат с казначейской формой 5-15 А",
            },
            {
              to: "/payroll/employee-list",
              label: "Сводный список работников организации",
              icon: <Users className="w-5 h-5 text-slate-500" />,
              description: "Полный список всех работников организации",
            },
          ],
        },
      ] as MixedSubItems,
    },
    {
      to: "/long-term-assets",
      label: "Долгосрочные активы",
      icon: <Building className="w-6 h-6 text-indigo-500" />,
      description: "Учет долгосрочных активов",
      subItems: [
        {
          to: "/long-term-assets/expense-classification",
          label: "Классификация расходов",
          icon: <BarChart3 className="w-5 h-5 text-purple-500" />,
          description: "Классификация и учет расходов по долгосрочным активам",
        },
        {
          category: "Отчеты",
          items: [
            {
              to: "/long-term-assets/consolidated-balance",
              label: "Сводная ведомость остатков ОС",
              icon: <FileText className="w-5 h-5 text-blue-500" />,
              description: "Сводный отчет по остаткам основных средств",
            },
            {
              to: "/long-term-assets/balance-statement",
              label: "Ведомость остатков ОС",
              icon: <FileText className="w-5 h-5 text-cyan-500" />,
              description: "Детальная ведомость остатков основных средств",
            },
            {
              to: "/long-term-assets/search",
              label: "Поиск долгосрочных активов",
              icon: <Package className="w-5 h-5 text-indigo-500" />,
              description: "Поиск и фильтрация долгосрочных активов",
            },
          ],
        },
      ] as MixedSubItems,
    },
    {
      to: "/nomenclature",
      label: "Номенклатура и склад",
      icon: <Package className="w-6 h-6 text-purple-500" />,
      description: "Управление номенклатурой и складом",
      subItems: [
        {
          to: "/nomenclature/expense-classification",
          label: "Классификация расходов",
          icon: <BarChart3 className="w-5 h-5 text-purple-500" />,
          description: "Классификация расходов по номенклатуре",
        },
        {
          category: "Отчеты",
          items: [
            {
              to: "/nomenclature/consolidated-balance",
              label: "Сводная ведомость остатков ТМЗ",
              icon: <FileText className="w-5 h-5 text-blue-500" />,
              description:
                "Сводный отчет по остаткам товарно-материальных запасов",
            },
            {
              to: "/nomenclature/balance-statement",
              label: "Ведомость остатков ТМЗ",
              icon: <FileText className="w-5 h-5 text-cyan-500" />,
              description:
                "Детальная ведомость остатков товарно-материальных запасов",
            },
          ],
        },
      ] as MixedSubItems,
    },
    {
      to: "/bank-cash",
      label: "Банк и касса",
      icon: <Banknote className="w-6 h-6 text-emerald-500" />,
      description: "Операции с банком и кассой",
      subItems: [
        {
          to: "/bank-cash/expense-classification",
          label: "Классификация расходов",
          icon: <BarChart3 className="w-5 h-5 text-purple-500" />,
          description: "Классификация расходов банка и кассы",
        },
        {
          to: "/bank-cash/cost-items",
          label: "Статьи затрат",
          icon: <FileText className="w-5 h-5 text-orange-500" />,
          description: "Управление статьями затрат",
        },
        {
          category: "Отчеты",
          items: [
            {
              to: "/bank-cash/cash-execution-report",
              label: "Отчет об исполнении денежных средств",
              icon: <Banknote className="w-5 h-5 text-green-600" />,
              description: "Отчет о движении и исполнении денежных средств",
            },
            {
              to: "/bank-cash/expenses-4-20",
              label: "Отчет по расходам по форме 4-20",
              icon: <FileText className="w-5 h-5 text-blue-500" />,
              description: "Отчет о расходах согласно форме 4-20",
            },
            {
              to: "/bank-cash/paid-obligations-report",
              label: "Отчет по расшифровкам оплаченных и принятых обязательств",
              icon: <FileText className="w-5 h-5 text-indigo-500" />,
              description: "Детализация оплаченных и принятых обязательств",
            },
            {
              to: "/bank-cash/payment-registry",
              label: "Реестр счетов к оплате",
              icon: <FileText className="w-5 h-5 text-cyan-500" />,
              description: "Реестр всех счетов, ожидающих оплаты",
            },
            {
              to: "/bank-cash/consolidated-cash-report",
              label: "Сводный отчет об исполнении денежных средств",
              icon: <Banknote className="w-5 h-5 text-emerald-600" />,
              description: "Сводный отчет по исполнению денежных средств",
            },
            {
              to: "/bank-cash/debt-report",
              label:
                "Сводный отчет по дебиторской и кредиторской задолженности",
              icon: <BarChart3 className="w-5 h-5 text-rose-500" />,
              description: "Анализ дебиторской и кредиторской задолженности",
            },
          ],
        },
      ] as MixedSubItems,
    },
    ...(isAdmin
      ? [
          {
            to: "/administration",
            label: "Администрирование",
            icon: (
              <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            ),
            description: "Административные настройки",
            subItems: [
              {
                to: "/administration/maintenance",
                label: "Обслуживание",
                icon: <Settings className="w-5 h-5 text-blue-500" />,
                description: "Техническое обслуживание системы",
              },
              {
                to: "/administration/general-settings",
                label: "Общие настройки",
                icon: <Settings className="w-5 h-5 text-purple-500" />,
                description: "Общие параметры и конфигурация системы",
              },
              {
                to: "/users",
                label: "Настройки пользователей и прав",
                icon: <Users className="w-5 h-5 text-amber-500" />,
                description: "Управление пользователями и правами доступа",
              },
              {
                to: "/administration/scheduled-jobs",
                label: "Регламентные и фоновые задания",
                icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
                description: "Управление автоматическими и фоновыми задачами",
              },
              {
                category: "См. также",
                items: [
                  {
                    to: "/administration/delete-marked",
                    label: "Удаление помеченных объектов",
                    icon: <Package className="w-5 h-5 text-red-500" />,
                    description: "Удаление объектов, помеченных на удаление",
                  },
                  {
                    to: "/administration/find-duplicates",
                    label: "Поиск и удаление дублей",
                    icon: <FileText className="w-5 h-5 text-orange-500" />,
                    description: "Поиск и удаление дублирующихся записей",
                  },
                ],
              },
            ] as MixedSubItems,
          },
        ]
      : []),
  ];

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
        setHoveredItem(null);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Блокировка скролла заднего фона
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Header (Fixed Navbar) */}
      <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 fixed top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Menu Button, Search */}
            <div className="flex items-center gap-4">
              {/* Menu Button: Hamburger when closed, Home when open */}
              <button
                ref={buttonRef}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={isMenuOpen ? handleHomeClick : toggleMenu}
                aria-label={isMenuOpen ? "Go to Home" : "Toggle menu"}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    // Home icon
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-1 0a1 1 0 01-1-1v-3a1 1 0 011-1h1a1 1 0 011 1v3a1 1 0 011 1m-6 0h6"
                    />
                  ) : (
                    // Hamburger icon
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="pl-10 pr-4 py-1 w-40 sm:w-48 text-sm bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Right Section: Profile, Theme, Logout */}
            <div className="flex items-center gap-3">
              {user && (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 font-semibold">
                      {user.full_name?.[0] || user.username?.[0] || "U"}
                    </span>
                  </div>
                  <span className="hidden sm:block font-medium">
                    {user.full_name || user.username}
                  </span>
                </Link>
              )}
              <ThemeSwitcher />
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-20"
          onClick={() => {
            setIsMenuOpen(false);
            setHoveredItem(null);
          }}
        ></div>
      )}

      {/* Dropdown Menu - продолжение навбара */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-7xl w-[calc(100%-2rem)] mx-4"
          onMouseLeave={() => {
            setHoveredItem(null);
          }}
        >
          <div className="bg-white dark:bg-zinc-800 px-4 sm:px-6 lg:px-8 py-8 rounded-b-lg border-gray-200 dark:border-zinc-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Part: Menu Links */}
              <div className="col-span-1 space-y-0">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-4 p-4 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors border-b border-gray-200 dark:border-zinc-700 last:border-b-0"
                    onMouseEnter={() => setHoveredItem(link.label)}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setHoveredItem(null);
                    }}
                  >
                    <span className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-lg">
                      {link.icon}
                    </span>
                    <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Right Part: Detailed info or icon grid */}
              <div className="col-span-2">
                {hoveredItem ? (
                  // Detailed info on hover
                  <div className="p-6 bg-gray-50 dark:bg-zinc-700 rounded-lg h-[600px] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {hoveredItem}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {(() => {
                        // Поиск описания в основных разделах
                        const mainLink = links.find(
                          (l) => l.label === hoveredItem
                        );
                        if (mainLink?.description) {
                          return mainLink.description;
                        }

                        // Поиск в подразделах
                        for (const link of links) {
                          if (link.subItems) {
                            // Проверяем, является ли это простым массивом SubMenuItem
                            if (!isCategoryGroup(link.subItems[0])) {
                              const subItem = (
                                link.subItems as SubMenuItem[]
                              ).find((s) => s.label === hoveredItem);
                              if (subItem?.description) {
                                return subItem.description;
                              }
                            }
                          }
                        }

                        // Специальное описание для "Запрос отчета"
                        if (hoveredItem === "Запрос отчета") {
                          return "Создайте новый запрос на формирование отчета. Система проведет вас через все необходимые шаги: выбор типа отчета, организаций, параметров и настройку уведомлений.";
                        }

                        return "Описание раздела.";
                      })()}
                    </p>

                    {/* Показываем подразделы для "Главное" */}
                    {hoveredItem === "Главное" &&
                      (() => {
                        const mainLink = links.find(
                          (l) => l.label === "Главное"
                        );
                        if (
                          !mainLink?.subItems ||
                          isCategoryGroup(mainLink.subItems[0])
                        ) {
                          return null;
                        }
                        const subItems = mainLink.subItems as SubMenuItem[];
                        return (
                          <div className="space-y-3">
                            {subItems.map((subItem) => (
                              <Link
                                key={subItem.to}
                                to={subItem.to}
                                className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setHoveredItem(null);
                                }}
                              >
                                <span className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                  {subItem.icon}
                                </span>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {subItem.label}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {subItem.description}
                                  </p>
                                </div>
                              </Link>
                            ))}

                            {/* Категория "Создать" */}
                            <div className="pt-4 border-t border-gray-200 dark:border-zinc-600">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                Создать
                              </p>
                              <button
                                onClick={handleReportRequest}
                                className="w-full flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800"
                              >
                                <span className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
                                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </span>
                                <div className="text-left">
                                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    Запрос отчета
                                  </h3>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Создать новый запрос на формирование отчета
                                  </p>
                                </div>
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                    {/* Показываем подразделы с категориями для "Централизация" */}
                    {hoveredItem === "Централизация" &&
                      (() => {
                        const centrLink = links.find(
                          (l) => l.label === "Централизация"
                        );
                        if (
                          !centrLink?.subItems ||
                          !isCategoryGroup(centrLink.subItems[0])
                        ) {
                          return null;
                        }
                        const categoryGroups =
                          centrLink.subItems as CategoryGroup[];
                        return (
                          <div className="space-y-6">
                            {categoryGroups.map((categoryGroup, idx) => (
                              <div key={idx}>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                  {categoryGroup.category}
                                </p>
                                <div className="space-y-2">
                                  {categoryGroup.items.map((item) => (
                                    <Link
                                      key={item.to}
                                      to={item.to}
                                      className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                      onClick={() => {
                                        setIsMenuOpen(false);
                                        setHoveredItem(null);
                                      }}
                                    >
                                      <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                        {item.icon}
                                      </span>
                                      <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">
                                          {item.label}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          {item.description}
                                        </p>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                    {/* Показываем подразделы для "Долгосрочные активы" (смешанная структура) */}
                    {hoveredItem === "Долгосрочные активы" &&
                      (() => {
                        const assetsLink = links.find(
                          (l) => l.label === "Долгосрочные активы"
                        );
                        if (!assetsLink?.subItems) {
                          return null;
                        }
                        return (
                          <div className="space-y-6">
                            {assetsLink.subItems.map((item, idx) => {
                              // Если это категория с группой элементов
                              if (isCategoryGroup(item)) {
                                return (
                                  <div key={idx}>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                      {item.category}
                                    </p>
                                    <div className="space-y-2">
                                      {item.items.map((subItem) => (
                                        <Link
                                          key={subItem.to}
                                          to={subItem.to}
                                          className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                          onClick={() => {
                                            setIsMenuOpen(false);
                                            setHoveredItem(null);
                                          }}
                                        >
                                          <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                            {subItem.icon}
                                          </span>
                                          <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">
                                              {subItem.label}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                              {subItem.description}
                                            </p>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                // Если это простой элемент
                                return (
                                  <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setHoveredItem(null);
                                    }}
                                  >
                                    <span className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                      {item.icon}
                                    </span>
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {item.label}
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              }
                            })}
                          </div>
                        );
                      })()}

                    {/* Показываем подразделы для "Зарплата и кадры" (смешанная структура) */}
                    {hoveredItem === "Зарплата и кадры" &&
                      (() => {
                        const payrollLink = links.find(
                          (l) => l.label === "Зарплата и кадры"
                        );
                        if (!payrollLink?.subItems) {
                          return null;
                        }
                        return (
                          <div className="space-y-6">
                            {payrollLink.subItems.map((item, idx) => {
                              // Если это категория с группой элементов
                              if (isCategoryGroup(item)) {
                                return (
                                  <div key={idx}>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                      {item.category}
                                    </p>
                                    <div className="space-y-2">
                                      {item.items.map((subItem) => (
                                        <Link
                                          key={subItem.to}
                                          to={subItem.to}
                                          className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                          onClick={() => {
                                            setIsMenuOpen(false);
                                            setHoveredItem(null);
                                          }}
                                        >
                                          <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                            {subItem.icon}
                                          </span>
                                          <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">
                                              {subItem.label}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                              {subItem.description}
                                            </p>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                // Если это простой элемент
                                return (
                                  <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setHoveredItem(null);
                                    }}
                                  >
                                    <span className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                      {item.icon}
                                    </span>
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {item.label}
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              }
                            })}
                          </div>
                        );
                      })()}

                    {/* Показываем подразделы для "Номенклатура и склад" (смешанная структура) */}
                    {hoveredItem === "Номенклатура и склад" &&
                      (() => {
                        const nomenclatureLink = links.find(
                          (l) => l.label === "Номенклатура и склад"
                        );
                        if (!nomenclatureLink?.subItems) {
                          return null;
                        }
                        return (
                          <div className="space-y-6">
                            {nomenclatureLink.subItems.map((item, idx) => {
                              // Если это категория с группой элементов
                              if (isCategoryGroup(item)) {
                                return (
                                  <div key={idx}>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                      {item.category}
                                    </p>
                                    <div className="space-y-2">
                                      {item.items.map((subItem) => (
                                        <Link
                                          key={subItem.to}
                                          to={subItem.to}
                                          className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                          onClick={() => {
                                            setIsMenuOpen(false);
                                            setHoveredItem(null);
                                          }}
                                        >
                                          <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                            {subItem.icon}
                                          </span>
                                          <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">
                                              {subItem.label}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                              {subItem.description}
                                            </p>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                // Если это простой элемент
                                return (
                                  <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setHoveredItem(null);
                                    }}
                                  >
                                    <span className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                      {item.icon}
                                    </span>
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {item.label}
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              }
                            })}
                          </div>
                        );
                      })()}

                    {/* Показываем подразделы для "Банк и касса" (смешанная структура) */}
                    {hoveredItem === "Банк и касса" &&
                      (() => {
                        const bankCashLink = links.find(
                          (l) => l.label === "Банк и касса"
                        );
                        if (!bankCashLink?.subItems) {
                          return null;
                        }
                        return (
                          <div className="space-y-6">
                            {bankCashLink.subItems.map((item, idx) => {
                              // Если это категория с группой элементов
                              if (isCategoryGroup(item)) {
                                return (
                                  <div key={idx}>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                      {item.category}
                                    </p>
                                    <div className="space-y-2">
                                      {item.items.map((subItem) => (
                                        <Link
                                          key={subItem.to}
                                          to={subItem.to}
                                          className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                          onClick={() => {
                                            setIsMenuOpen(false);
                                            setHoveredItem(null);
                                          }}
                                        >
                                          <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                            {subItem.icon}
                                          </span>
                                          <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">
                                              {subItem.label}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                              {subItem.description}
                                            </p>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                // Если это простой элемент
                                return (
                                  <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setHoveredItem(null);
                                    }}
                                  >
                                    <span className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                      {item.icon}
                                    </span>
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {item.label}
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              }
                            })}
                          </div>
                        );
                      })()}

                    {/* Показываем подразделы для "Администрирование" (смешанная структура) */}
                    {hoveredItem === "Администрирование" &&
                      (() => {
                        const adminLink = links.find(
                          (l) => l.label === "Администрирование"
                        );
                        if (!adminLink?.subItems) {
                          return null;
                        }
                        return (
                          <div className="space-y-6">
                            {adminLink.subItems.map((item, idx) => {
                              // Если это категория с группой элементов
                              if (isCategoryGroup(item)) {
                                return (
                                  <div key={idx}>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                      {item.category}
                                    </p>
                                    <div className="space-y-2">
                                      {item.items.map((subItem) => (
                                        <Link
                                          key={subItem.to}
                                          to={subItem.to}
                                          className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                          onClick={() => {
                                            setIsMenuOpen(false);
                                            setHoveredItem(null);
                                          }}
                                        >
                                          <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                            {subItem.icon}
                                          </span>
                                          <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">
                                              {subItem.label}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                              {subItem.description}
                                            </p>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                // Если это простой элемент
                                return (
                                  <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors border border-gray-200 dark:border-zinc-600"
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setHoveredItem(null);
                                    }}
                                  >
                                    <span className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-lg flex-shrink-0">
                                      {item.icon}
                                    </span>
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {item.label}
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              }
                            })}
                          </div>
                        );
                      })()}
                  </div>
                ) : (
                  // Icon grid when nothing is hovered
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="flex flex-col items-center p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setHoveredItem(null);
                        }}
                      >
                        <div className="mb-2 w-12 h-12 flex items-center justify-center">
                          {link.icon}
                        </div>

                        <p className="text-base font-medium text-gray-900 dark:text-gray-100 text-center">
                          {link.label}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                          {link.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - добавлен отступ сверху для fixed navbar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <Outlet />
      </main>

      {/* Universal Report Modal */}
      {isReportModalOpen && selectedConfig && (
        <UniversalReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportType={selectedReportType}
          config={selectedConfig}
          onSubmit={handleReportSubmit}
          startStep={0}
          allowReportChange={true}
        />
      )}
    </div>
  );
}
