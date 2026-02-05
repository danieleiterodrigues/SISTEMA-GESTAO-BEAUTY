import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  LogOut,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Package,
  UserPlus,
  Layers,
  Scissors,
  CalendarDays,
  ClipboardList,
  Store,
  Tag,
  Calculator,
  UsersRound,
  ArrowDownRight,
  Shield,
  FileBarChart,
  Landmark,
  Banknote,
  Receipt,
  MessageCircle,
  Globe,
  HelpCircle,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  const menuGroups = [
    {
      title: 'DASHBOARDS',
      items: [
        { icon: DollarSign, label: 'Financeiro', path: '/dashboard' },
        { icon: Calendar, label: 'Atendimento', path: '/atendimentos-dash' },
        { icon: TrendingUp, label: 'Comercial', path: '/comercial-dash' },
        { icon: FileBarChart, label: 'Relatórios', path: '/relatorios' },
      ]
    },
    {
      title: 'FINANCEIRO',
      items: [
        { icon: CreditCard, label: 'Fluxo de Caixa', path: '/financeiro' },
        { icon: Landmark, label: 'Caixa Avançado', path: '/caixa-avancado' },
        { icon: ShoppingBag, label: 'Vendas', path: '/vendas' },
        { icon: Package, label: 'Comandas', path: '/comandas' },
        { icon: ArrowDownRight, label: 'Despesas', path: '/despesas' },
        { icon: Banknote, label: 'Remunerações', path: '/remuneracoes' },
        { icon: Receipt, label: 'Notas Fiscais', path: '/notas-fiscais' },
      ]
    },
    {
      title: 'COMERCIAL',
      items: [
        { icon: Users, label: 'Clientes', path: '/clientes' },
        { icon: UserPlus, label: 'Prospectos', path: '/prospectos' },
        { icon: MessageCircle, label: 'WhatsApp', path: '/whatsapp' },
        { icon: Layers, label: 'Vendas de Pacotes', path: '/vendas-pacotes' },
        { icon: Store, label: 'Vendas Avulsas', path: '/vendas-avulsas' },
      ]
    },
    {
        title: 'ATENDIMENTO',
        items: [
             { icon: CalendarDays, label: 'Agenda', path: '/agenda' },
             { icon: Globe, label: 'Agenda Online', path: '/agenda-online' },
             { icon: ClipboardList, label: 'Comandas', path: '/comandas-atendimento' },
        ]
    },
    {
        title: 'ADMINISTRAÇÃO',
        items: [
             { icon: Scissors, label: 'Serviços', path: '/servicos' },
             { icon: Package, label: 'Pacotes', path: '/pacotes' },
             { icon: UsersRound, label: 'Colaboradores', path: '/colaboradores' },
             { icon: Shield, label: 'Perfis de Acesso', path: '/perfis-acesso' },
             { icon: Tag, label: 'Produtos', path: '/produtos' },
             { icon: Calculator, label: 'Taxas Maquininha', path: '/taxas' },
        ]
    },
    {
        title: 'SISTEMA',
        items: [
             { icon: Crown, label: 'Plano e Pagamento', path: '/plano' },
             { icon: Settings, label: 'Configurações', path: '/configuracoes' },
             { icon: ShieldCheck, label: 'Termos e Privacidade', path: '/termos' },
             { icon: HelpCircle, label: 'Central de Ajuda', path: '/ajuda' },
        ]
    }
  ];

  return (
    <aside className="w-64 bg-[#4a148c] text-white flex flex-col h-full min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Gestor Beauty</h1>
        <p className="text-sm text-purple-200">Studio Management</p>
      </div>

      <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group, index) => (
            <div key={index} className="mb-6">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 px-4">
                    {group.title}
                </h3>
                <div className="space-y-1">
                    {group.items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                        cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium",
                            isActive 
                            ? "bg-white text-[#4a148c] shadow-md" 
                            : "text-purple-100 hover:bg-white/10"
                        )
                        }
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </NavLink>
                    ))}
                </div>
            </div>
        ))}
      </nav>

      <div className="p-4 border-t border-purple-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-purple-100 hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
