import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ThemeSwitcher } from "../../shared/components/ThemeSwitcher/ThemeSwitcher";
import { authApi } from "../../shared/api/auth.api";

/**
 * Главный Layout для авторизованных пользователей
 * С боковым меню (sidebar) вместо выпадающего, с левой и правой частями, стилизованный под infostart.ru
 */
export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authApi.getCurrentUser();
  const isAdmin = user?.role === "admin";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

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
    if (location.pathname !== "/home") {
      navigate("/home");
    }
  };

  // Список ссылок на одном уровне с иконками
  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: "📊",
      description: "Панель управления с общими данными",
    },
    {
      to: "/centralization",
      label: "Централизация",
      icon: "🏛️",
      description: "Управление централизацией процессов",
    },
    {
      to: "/payroll",
      label: "Зарплата и кадры",
      icon: "👥",
      description: "Кадровый учет и расчет зарплаты",
    },
    {
      to: "/long-term-assets",
      label: "Долгосрочные активы",
      icon: "🏢",
      description: "Учет долгосрочных активов",
    },
    {
      to: "/nomenclature",
      label: "Номенклатура и склад",
      icon: "📦",
      description: "Управление номенклатурой и складом",
    },
    {
      to: "/bank-cash",
      label: "Банк и касса",
      icon: "💳",
      description: "Операции с банком и кассой",
    },
    ...(isAdmin
      ? [
          {
            to: "/administration",
            label: "Администрирование",
            icon: "⚙️",
            description: "Административные настройки",
          },
        ]
      : []),
  ];

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        rightPanelRef.current &&
        !rightPanelRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
        setHoveredItem(null);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="min-h-screen">
      {/* Header (Fixed Navbar) */}
      <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left Section: Menu Button, Search */}
            <div className="flex items-center gap-4">
              {/* Menu Button: Hamburger when closed, Home when open */}
              <button
                className="p-2 text-gray-600 hover:text-blue-600"
                onMouseDown={(e) => e.stopPropagation()} // <- добавлено
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
                  className="pl-10 pr-4 py-1 w-40 sm:w-48 text-sm bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
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
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
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
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for overlay (semi-transparent) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => {
            setIsMenuOpen(false);
            setHoveredItem(null);
          }}
        ></div>
      )}

      {/* Sidebar Menu (centered, with white background, visible background behind) */}
      {isMenuOpen && (
        <div
          className="fixed top-14 left-1/2 -translate-x-1/2 w-full max-w-7xl z-50 overflow-y-auto"
          ref={menuRef}
          onMouseLeave={() => {
            setHoveredItem(null);
          }}
        >
          <div className="bg-white rounded-b-lg shadow-xl mx-4 sm:mx-6 lg:mx-8 py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 space-y-0">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-4 p-4 rounded-none hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0"
                  onMouseEnter={() => setHoveredItem(link.label)}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setHoveredItem(null);
                  }}
                >
                  <span className="text-3xl">{link.icon}</span>
                  <span className="text-lg font-medium text-gray-900">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Right Part: Big icons with descriptions or detailed info on hover, clickable */}
            <div className="col-span-2" ref={rightPanelRef}>
              {hoveredItem ? (
                // Detailed info on hover
                <div
                  className="p-6 bg-gray-50 rounded-lg"
                  onMouseEnter={() => {}}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {hoveredItem}
                  </h2>
                  <p className="text-gray-600">
                    {links.find((l) => l.label === hoveredItem)?.description ||
                      "Описание раздела."}
                    <br />В этом разделе вы найдете: [детали о функциях...].
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setHoveredItem(null);
                      }}
                    >
                      <span className="text-4xl mb-2">{link.icon}</span>
                      <p className="text-base font-medium text-gray-900 text-center">
                        {link.label}
                      </p>
                      <p className="text-xs text-gray-600 text-center">
                        {link.description}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <Outlet />
      </main>
    </div>
  );
}
