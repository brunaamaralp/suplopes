import React, { useState, Suspense } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { useFinance } from './context/FinanceContext';
const DashboardLazy = React.lazy(() => import('./views/Dashboard').then(m => ({ default: m.Dashboard })));
const PlanoContasLazy = React.lazy(() => import('./views/PlanoContas').then(m => ({ default: m.PlanoContas })));
const MovimentacoesLazy = React.lazy(() => import('./views/Movimentacoes').then(m => ({ default: m.Movimentacoes })));
const ConferenciaLazy = React.lazy(() => import('./views/Conferencia').then(m => ({ default: m.Conferencia })));
const FluxoCaixaLazy = React.lazy(() => import('./views/FluxoCaixa').then(m => ({ default: m.FluxoCaixa })));
const ContasLazy = React.lazy(() => import('./views/Contas').then(m => ({ default: m.Contas })));
import { ViewState } from './types';
import { LayoutDashboard, FileText, ArrowRightLeft, CheckSquare, PieChart, Menu, X, Landmark, CheckCircle, AlertTriangle } from 'lucide-react';
import logoUrl from './assets/logo.png';

const SidebarItem: React.FC<{
  icon: React.ElementType,
  label: string,
  isActive: boolean,
  onClick: () => void
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
      ? 'bg-white/20 text-white shadow-lg border border-white/30'
      : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
  >
    <Icon size={20} className={isActive ? 'text-secondary' : 'text-white/70'} />
    <span className="font-medium">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD': return <DashboardLazy onNavigate={setCurrentView} />;
      case 'PLANO_CONTAS': return <PlanoContasLazy />;
      case 'CONTAS': return <ContasLazy />;
      case 'MOVIMENTACOES': return <MovimentacoesLazy />;
      case 'CONFERENCIA': return <ConferenciaLazy />;
      case 'FLUXO_CAIXA': return <FluxoCaixaLazy />;
      default: return <DashboardLazy onNavigate={setCurrentView} />;
    }
  };

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'MOVIMENTACOES', label: 'Movimentações', icon: ArrowRightLeft },
    { id: 'CONFERENCIA', label: 'Conferência', icon: CheckSquare },
    { id: 'FLUXO_CAIXA', label: 'Fluxo de Caixa', icon: PieChart },
    { id: 'CONTAS', label: 'Contas Bancárias', icon: Landmark },
    { id: 'PLANO_CONTAS', label: 'Plano de Contas', icon: FileText },
  ];

  return (
    <FinanceProvider>
      <div className="min-h-screen flex bg-main text-textPrimary font-sans">

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full sidebar-bg border-b border-white/20 p-4 z-50 flex justify-between items-center shadow-lg">
          <img
            src={logoUrl}
            alt="Supermercado Lopes"
            className="h-8"
          />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 w-64 sidebar-bg border-r border-primary/20 z-40 transform transition-transform duration-300 ease-in-out shadow-xl
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-6 flex items-center justify-center">
            <img
              src={logoUrl}
              alt="Supermercado Lopes"
              className="w-full max-w-[200px] h-auto"
            />
          </div>

          <nav className="px-4 space-y-2">
            {navItems.map(item => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={currentView === item.id}
                onClick={() => {
                  setCurrentView(item.id as ViewState);
                  setIsMobileMenuOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="absolute bottom-4 left-0 w-full px-6 text-center">
            <p className="text-[10px] text-textSecondary opacity-50">v1.0.0 &copy; 2024</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto overflow-x-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-positive/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <Suspense fallback={<LoadingFallback />}>
              {renderView()}
            </Suspense>
          </div>
          <NotificationsOverlay />
        </main>
      </div>
    </FinanceProvider>
  );
};

const LoadingFallback: React.FC = () => (
  <div className="p-8 flex items-center justify-center">
    <div className="flex items-center gap-3 text-textSecondary animate-[fadeIn_0.2s_ease-out]">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando…</span>
    </div>
  </div>
);

const NotificationsOverlay: React.FC = () => {
  const { notifications } = useFinance();
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`min-w-[260px] px-4 py-3 rounded-xl shadow-lg border flex items-start gap-3 animate-[fadeIn_0.2s_ease-out] ${n.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
        >
          {n.type === 'success' ? <CheckCircle size={18} className="mt-0.5" /> : <AlertTriangle size={18} className="mt-0.5" />}
          <div className="text-sm leading-snug">{n.message}</div>
        </div>
      ))}
    </div>
  );
};

export default App;
