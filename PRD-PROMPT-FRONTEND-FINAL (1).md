# PRD-PROMPT: Frontend Completo - Sistema JS Beauty Studio

## CONTEXTO E OBJETIVO

Você é um desenvolvedor frontend sênior responsável por criar TODA a interface do sistema de gestão JS Beauty Studio baseado EXATAMENTE no design de referência fornecido. O sistema completo inclui:

- **3 Dashboards**: Financeiro (pixel-perfect conforme imagem), Atendimento, Comercial
- **4 Módulos principais**: Financeiro, Comercial, Atendimento, Administração
- **Múltiplas telas**: Clientes, Agenda, Vendas, Despesas, Serviços, Colaboradores, etc.

O dashboard financeiro DEVE seguir pixel-perfect o layout da imagem de referência, incluindo cores exatas, espaçamentos, componentes e funcionalidades.

---

## REGRAS DE NEGÓCIO CRÍTICAS

### PREVISÃO DE ENTRADA DE VALORES

O salão trabalha com **dois tipos de clientes** com formas diferentes de quitação:

#### 1. SERVIÇOS SOCIAIS (Madrinhas, Formandas, Damas)
- Cliente faz **entrada** (sinal/adiantamento) ao agendar
- **Saldo restante** é quitado **no dia do atendimento**
- Exemplo: Serviço R$ 400, entrada R$ 100 → **R$ 300 a receber no dia**

#### 2. PACOTES (Noivas, Debutantes)
- Cliente compra **pacote** com vários serviços inclusos
- Pode parcelar o valor do pacote
- **REGRA CRÍTICA**: Pacote deve estar **100% quitado até 10 dias ANTES da data do evento**
- Exemplo: Evento 20/02 → Prazo quitação: 10/02

**Lógica do Filtro de Período:**
- **Próximos 7 dias**: 
  - Serviços: atendimentos de hoje até +7 dias
  - Pacotes: eventos entre +10 e +17 dias
- **Próximos 15 dias**:
  - Serviços: atendimentos até +15 dias
  - Pacotes: eventos entre +10 e +25 dias
- **Próximos 30 dias**:
  - Serviços: atendimentos até +30 dias
  - Pacotes: eventos entre +10 e +40 dias

---

## PALETA DE CORES OFICIAL

```css
/* Cores Primárias */
--primary-pink: #E91E63;        /* Rosa principal (botões, destaques) */
--primary-pink-light: #FCE4EC;  /* Rosa claro (backgrounds) */
--primary-pink-hover: #C2185B;  /* Rosa escuro (hover states) */

/* Cores Secundárias */
--secondary-blue-dark: #3B4A5C; /* Azul escuro (gráficos, texto) */
--secondary-blue: #1E40AF;      /* Azul médio (avatares, ícones) */
--secondary-blue-light: #DBEAFE; /* Azul claro (backgrounds) */

/* Cores de Status */
--success-green: #10B981;       /* Verde (positivo, sucesso) */
--success-green-light: #ECFDF5; /* Verde claro (backgrounds) */
--error-red: #EF4444;           /* Vermelho (negativo, erro) */
--error-red-light: #FEE2E2;     /* Vermelho claro (backgrounds) */
--warning-yellow: #F59E0B;      /* Amarelo (aviso, pendente) */
--warning-yellow-light: #FEF3C7; /* Amarelo claro (backgrounds) */

/* Cores Neutras */
--gray-50: #F9FAFB;   --gray-500: #6B7280;
--gray-100: #F3F4F6;  --gray-600: #4B5563;
--gray-200: #E5E7EB;  --gray-700: #374151;
--gray-300: #D1D5DB;  --gray-800: #1F2937;
--gray-400: #9CA3AF;  --gray-900: #111827;
```

---

## STACK TECNOLÓGICA OBRIGATÓRIA

### Core
- **Framework**: React 18.2+ com TypeScript 5+
- **Build Tool**: Vite 5+
- **Node**: 18+ (LTS)

### UI/Estilo
- **CSS Framework**: TailwindCSS 3.4+
- **Ícones**: Lucide React
- **Fontes**: Inter (Google Fonts)

### Estado e Data Fetching
- **Estado Global**: Zustand 4+
- **Server State**: TanStack Query (React Query) 5+
- **HTTP Client**: Axios 1.6+

### Formulários
- **Forms**: React Hook Form 7.48+
- **Validação**: Zod 3.22+

### Utilitários
- **Datas**: date-fns 3+
- **Formatação**: Intl.NumberFormat
- **Notificações**: React Hot Toast
- **Máscaras**: react-input-mask

---

## DASHBOARD FINANCEIRO (PIXEL-PERFECT)

### 1. CARDS DE MÉTRICAS (Topo - 4 Cards)

```typescript
interface MetricCard {
  title: string;
  value: number;
  format: 'currency' | 'number';
  percentageChange: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

const metricsData = [
  {
    title: 'Faturamento Bruto',
    value: 42850.00,
    format: 'currency',
    percentageChange: 12.5,
    trend: 'up',
    icon: TrendingUp,
    iconColor: '#10B981',
    iconBg: '#ECFDF5'
  },
  {
    title: 'Despesas Pagas',
    value: 15200.00,
    format: 'currency',
    percentageChange: -3.2,
    trend: 'down',
    icon: ArrowDownRight,
    iconColor: '#EF4444',
    iconBg: '#FEE2E2'
  },
  {
    title: 'Novos Clientes',
    value: 128,
    format: 'number',
    percentageChange: 4.2,
    trend: 'up',
    icon: Users,
    iconColor: '#3B82F6',
    iconBg: '#DBEAFE'
  },
  {
    title: 'Atendimentos Mês',
    value: 452,
    format: 'number',
    percentageChange: 8.4,
    trend: 'up',
    icon: Calendar,
    iconColor: '#10B981',
    iconBg: '#ECFDF5'
  }
];
```

**Especificações Visuais:**
- Background branco, shadow-sm, hover:shadow-md
- Padding: 24px
- Border radius: 12px
- Ícone circular: 48x48px, canto superior direito
- Título: 14px, text-gray-500
- Valor: 28px, font-bold, text-gray-900
- Indicador: seta + %, verde (positivo) ou vermelho (negativo)

### 2. PREVISÃO DE ENTRADA DE VALORES (2/3 largura)

**Objetivo**: Mostrar quitações pendentes de serviços sociais e pacotes.

```typescript
interface PrevisaoEntradaData {
  servicosSociais: {
    valor: number;
    quantidade: number;
    descricao: string;
  };
  pacotes: {
    valor: number;
    quantidade: number;
    descricao: string;
  };
  total: {
    valor: number;
    quantidade: number;
    descricao: string;
  };
  proximasQuitacoes: ProximaQuitacao[];
}

interface ProximaQuitacao {
  id: number;
  tipo: 'servico_social' | 'pacote';
  cliente: string;
  descricao: string; // "Serviço Social" ou "Pacote Noiva"
  dataQuitacao: string;
  valorTotal: number;
  valorPago: number;
  saldoPendente: number;
  cor: string; // '#E91E63' ou '#3B4A5C'
}
```

**3 Cards de Métricas:**
1. **SERVIÇOS SOCIAIS** (Rosa #E91E63)
   - Valor total a receber
   - "X quitações a receber"
   
2. **PACOTES (NOIVAS/DEBUTS)** (Azul #3B4A5C)
   - Valor total a receber
   - "X pacotes a quitar"
   
3. **TOTAL PREVISTO** (Verde #10B981)
   - Soma dos dois anteriores
   - "X quitações no período"

**Lista de Próximas Quitações:**
Abaixo dos 3 cards, lista com:
- Barra colorida vertical esquerda (1px, rosa ou azul)
- Nome do cliente + tipo
- Data + descrição
- Saldo pendente em destaque: "R$ 300,00"
- Valor total menor: "de R$ 400,00"
- Hover: bg-gray-100

**Controles:**
- Dropdown: Próximos 7 dias | 15 dias | 30 dias | Data personalizada
- Botão exportar (ícone download)

**Endpoint API:**
```
GET /api/dashboard/previsao-entrada?periodo=7d
```

### 3. SERVIÇOS POPULARES (1/3 largura)

**Gráfico Donut:**
```typescript
const servicosData = [
  { name: 'Manicure', value: 40, color: '#E91E63' },
  { name: 'Corte/Estética', value: 30, color: '#3B4A5C' },
  { name: 'Estética Facial', value: 20, color: '#6B7280' },
  { name: 'Design Sobrancelha', value: 10, color: '#F59E0B' }
];
```

**Lista abaixo do gráfico:**
- Bullet colorido (8px círculo)
- Nome do serviço
- Percentual alinhado à direita

### 4. PRÓXIMAS QUITAÇÕES (Inferior Esquerda)

```typescript
interface QuitacaoPendente {
  id: number;
  avatar: string; // Iniciais
  avatarColor: string;
  clienteName: string;
  serviceType: string;
  date: string;
  value: number;
  status: 'PENDENTE' | 'VENCIDO' | 'PAGO';
}
```

**Especificações:**
- Avatar circular (40px) com iniciais
- Nome + tipo de serviço
- Data
- Valor + badge de status
- Link "Ver Todas" (rosa)

### 5. FATURAMENTO POR COLABORADOR (Inferior Direita)

```typescript
interface ColaboradorFaturamento {
  id: number;
  name: string;
  value: number;
  percentage: number; // Para barra de progresso
  color: string;
}
```

**Barra de progresso:**
- Altura: 8px
- Background: gray-200
- Fill: cor específica do colaborador
- Cantos arredondados
- Transição suave

---

## COMPONENTES REUTILIZÁVEIS

### MetricCard
```typescript
// src/components/dashboard/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: number | string;
  format?: 'currency' | 'number';
  percentageChange: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}
```

### PrevisaoEntradaCard
```typescript
// src/components/dashboard/PrevisaoEntradaCard.tsx
interface PrevisaoEntradaCardProps {
  data: PrevisaoEntradaData;
  periodo: string;
  onPeriodoChange: (periodo: string) => void;
  onExport: () => void;
}
```

### Button
```typescript
// src/components/common/Button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### Input
```typescript
// src/components/common/Input.tsx
interface InputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  mask?: 'phone' | 'cpf' | 'cep' | 'currency';
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  disabled?: boolean;
}
```

### Modal
```typescript
// src/components/common/Modal.tsx
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
}
```

---

## HOOKS PERSONALIZADOS

### useDashboardFinanceiro
```typescript
// src/hooks/useDashboardFinanceiro.ts
export function useDashboardFinanceiro() {
  return useQuery({
    queryKey: ['dashboard', 'financeiro'],
    queryFn: () => dashboardService.getFinanceiro(),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
}
```

### usePrevisaoEntrada
```typescript
// src/hooks/usePrevisaoEntrada.ts
interface UsePrevisaoEntradaParams {
  periodo: '7d' | '15d' | '30d' | 'personalizado';
  dataInicio?: string;
  dataFim?: string;
}

export function usePrevisaoEntrada(params: UsePrevisaoEntradaParams) {
  return useQuery({
    queryKey: ['previsao-entrada', params],
    queryFn: () => dashboardService.getPrevisaoEntrada(params),
    staleTime: 1000 * 60 * 5,
  });
}
```

### useClientes
```typescript
// src/hooks/useClientes.ts
export function useClientes(params?: ListClientesParams) {
  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => clientesService.getAll(params),
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente cadastrado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao cadastrar cliente');
    }
  });
}
```

---

## SERVICE LAYER

### dashboardService
```typescript
// src/services/dashboard.service.ts
export const dashboardService = {
  getFinanceiro: async () => {
    const response = await api.get('/dashboard/financeiro');
    return response.data;
  },
  
  getPrevisaoEntrada: async (params: any) => {
    const response = await api.get('/dashboard/previsao-entrada', { params });
    return response.data;
  },
  
  exportPDF: async () => {
    const response = await api.get('/dashboard/financeiro/export-pdf', {
      responseType: 'blob'
    });
    return response.data;
  }
};
```

### clientesService
```typescript
// src/services/clientes.service.ts
export const clientesService = {
  getAll: async (params?: any) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },
  
  create: async (data: CreateClienteDto) => {
    const response = await api.post('/clientes', data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateClienteDto) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/clientes/${id}`);
  }
};
```

---

## ESTRUTURA DE TIPOS

### Cliente
```typescript
// src/types/cliente.types.ts
export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  status: 'ativo' | 'inativo' | 'prospecto';
  ultimaVisita?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteDto {
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
}
```

### Atendimento
```typescript
// src/types/atendimento.types.ts
export interface Atendimento {
  id: number;
  clienteId: number;
  cliente?: Cliente;
  colaboradorId: number;
  colaborador?: Colaborador;
  dataAtendimento: string;
  horarioInicio: string;
  horarioFim: string;
  status: 'agendado' | 'em_atendimento' | 'concluido' | 'cancelado';
  valorTotal: number;
  valorPago: number;
  observacoes?: string;
  servicos: AtendimentoServico[];
}

export interface AtendimentoServico {
  id: number;
  servicoId: number;
  servico?: Servico;
  quantidade: number;
  valorUnitario: number;
  desconto: number;
}
```

---

## UTILIDADES

### Formatadores
```typescript
// src/utils/formatters.ts
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export const formatCPF = (cpf: string): string => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};
```

### Validadores
```typescript
// src/utils/validators.ts
import { z } from 'zod';

export const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos').optional().or(z.literal('')),
});
```

---

## RESPONSIVIDADE

```typescript
// Breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Laptop
xl: 1280px  // Desktop
2xl: 1536px // Large desktop

// Grid de métricas
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"

// Seção previsão + serviços
className="grid grid-cols-1 lg:grid-cols-3 gap-6"

// Tabelas inferiores
className="grid grid-cols-1 lg:grid-cols-2 gap-6"
```

---

## CRITÉRIOS DE ACEITE

### Visual
- [ ] Cores EXATAS da paleta
- [ ] Espaçamentos e paddings corretos
- [ ] Ícones nos tamanhos especificados
- [ ] Fontes e pesos corretos
- [ ] Sombras e bordas aplicadas
- [ ] Responsivo em todos os breakpoints

### Funcional
- [ ] Dados carregam da API
- [ ] Loading states funcionam
- [ ] Error handling implementado
- [ ] Filtros aplicam corretamente
- [ ] Tooltips aparecem
- [ ] Modais abrem/fecham
- [ ] Toasts de feedback

### Performance
- [ ] FCP < 1.5s
- [ ] TTI < 3s
- [ ] Lighthouse > 90
- [ ] Code splitting
- [ ] Lazy loading

### Qualidade
- [ ] 0 erros TypeScript
- [ ] 0 warnings ESLint
- [ ] Componentes < 300 linhas
- [ ] Coverage > 60%

---

**Este PRD é a fonte única de verdade para o frontend do JS Beauty Studio.**
