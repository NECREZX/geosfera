import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Compass,
  History,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Settings,
  ShieldAlert,
  Waves,
  X,
} from 'lucide-react';
import type { MenuId, TimezoneOption } from '../types/bmkg';
import { formatEventTime } from '../services/bmkgService';

interface NavItem {
  id: MenuId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'peta', label: 'Peta Gempa', icon: Compass },
  { id: 'riwayat', label: 'Riwayat Gempa', icon: History },
  { id: 'analisis', label: 'Analisis Gempa', icon: BarChart3 },
  { id: 'kerawanan', label: 'Wilayah Rawan Gempa', icon: ShieldAlert },
  { id: 'tsunami', label: 'Potensi Tsunami', icon: Waves },
  { id: 'mitigasi', label: 'Mitigasi Bencana', icon: BookOpen },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

const SIDEBAR_COLLAPSE_KEY = 'geosfera_bmkg_sidebar_collapsed';

/**
 * Custom technical cartographic/seismograph emblem (non-generic, geometric linework)
 */
const GeosferaEmblem: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer meridian ring */}
    <circle
      cx="16"
      cy="16"
      r="13"
      className="stroke-slate-900 dark:stroke-slate-100"
      strokeWidth="1.75"
    />
    {/* Geographic latitude / longitude crosshairs */}
    <path
      d="M16 3V10.5M16 21.5V29M3 16H7.5M24.5 16H29"
      className="stroke-slate-400 dark:stroke-slate-500"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    {/* Seismograph wave trace across equator */}
    <path
      d="M6.5 16H10.5L12.5 11.5L15.2 21L18 9.5L20.5 18L22 16H25.5"
      className="stroke-sky-700 dark:stroke-sky-400"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface LayoutProps {
  activeMenu: MenuId;
  onSelectMenu: (menu: MenuId) => void;
  fetchedAt: string | null;
  timezone: TimezoneOption;
  isRefreshing: boolean;
  onRefresh: () => void;
  hasTsunamiAlert: boolean;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeMenu,
  onSelectMenu,
  fetchedAt,
  timezone,
  isRefreshing,
  onRefresh,
  hasTsunamiAlert,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(desktopCollapsed));
    } catch {
      // ignore storage errors
    }
  }, [desktopCollapsed]);

  const activeNav = NAV_ITEMS.find((item) => item.id === activeMenu) || NAV_ITEMS[0];
  const lastSyncLabel = fetchedAt
    ? formatEventTime(Date.parse(fetchedAt), timezone).jam
    : '--:--:--';

  const handleNavClick = (id: MenuId) => {
    onSelectMenu(id);
    setMobileOpen(false);
  };

  const renderSidebar = (collapsed: boolean, isMobile = false) => (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div>
        <div
          className={`flex h-14 items-center border-b border-slate-200 dark:border-slate-800 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            title="Geosfera"
            className={`flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <GeosferaEmblem className="h-7 w-7 shrink-0" />
            {!collapsed && (
              <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                Geosfera
              </span>
            )}
          </button>

          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Tutup menu navigasi"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="px-2.5 py-4 space-y-1" aria-label="Menu Utama">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeMenu;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                className={`relative w-full flex items-center rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                  collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`flex items-center min-w-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      isActive ? 'text-sky-700 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  {!collapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
                </span>

                {!collapsed && item.id === 'tsunami' && hasTsunamiAlert && (
                  <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 shrink-0">
                    Siaga
                  </span>
                )}
                {collapsed && item.id === 'tsunami' && hasTsunamiAlert && (
                  <span
                    className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-rose-600"
                    aria-label="Siaga Tsunami"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div
        className={`border-t border-slate-200 dark:border-slate-800 ${
          collapsed ? 'py-4 px-2 text-center' : 'px-4 py-4'
        }`}
      >
        {collapsed ? (
          <div className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            BMKG
          </div>
        ) : (
          <>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Sumber Data: BMKG
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              TEWS &amp; InaTEWS Real-time
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Collapsible Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-screen transition-[width] duration-200 ease-out ${
          desktopCollapsed ? 'w-[68px]' : 'w-[248px]'
        }`}
      >
        {renderSidebar(desktopCollapsed, false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[272px] max-w-[85vw] h-full">
            {renderSidebar(false, true)}
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile drawer toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop sidebar collapse/expand toggle */}
            <button
              type="button"
              onClick={() => setDesktopCollapsed((prev) => !prev)}
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer transition-colors"
              aria-label={desktopCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
              title={desktopCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            >
              {desktopCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            <h1 className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate whitespace-nowrap">
              {activeNav.label}
            </h1>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden sm:inline-block text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {lastSyncLabel}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Memuat...' : 'Perbarui Data'}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
