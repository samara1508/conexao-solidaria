import { useState, useRef, useEffect } from "react";
import {
  Bell, UserCircle, LogOut,
  Home, Users, User, Gift, Package, Building2,
  ArrowUp, ArrowDown, BarChart2, Search, ArrowLeftRight,
  ChevronRight, ChevronLeft, ChevronDown,
  Eye, EyeOff,
  CirclePlus, HandHeart, Boxes, Heart, Handshake, Stethoscope,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import heroImage  from "@/imports/image.png";
import logoIcon   from "@/imports/Gemini_Generated_Image_s27eeas27eeas27e.png";

import { FamiliasPage }     from "@/app/FamiliasPage";
import { InstituicoesPage } from "@/app/InstituicoesPage";
import { EstoquePage }      from "@/app/EstoquePage";
import { ItensPage }        from "@/app/ItensPage";
import { UsuariosPage }     from "@/app/UsuariosPage";
import { HistDoacoesPage }  from "@/app/HistDoacoesPage";
import { MovEstoquePage }   from "@/app/MovEstoquePage";
import { DoadoresPage }     from "@/app/DoadoresPage";
import { ParceirosPage }    from "@/app/ParceirosPage";
import { Dashboard }        from "@/app/components/Dashboard";
import { EstoqueInstPage }  from "@/app/EstoqueInstPage";
import { AtendimentosPage } from "@/app/AtendimentosPage";

// ─── palette ─────────────────────────────────────────────────────
const P = {
  darkBlue:     "#1a2744",
  blue:         "#2b65bf",
  teal:         "#2b7a8c",
  tealLight:    "#b8dde8",
  bg:           "linear-gradient(135deg, #dce5f4 0%, #eef1f8 50%, #d4ddf0 100%)",
  surface:      "#ffffff",
  label:        "#3d4f72",
  muted:        "#6b7a9e",
  inputBg:      "#f0f4fb",
  inputBorder:  "#d0daef",
  sidebarBg:    "#1e3050",
  sidebarHover: "#25395e",
  sidebarActive:"#2b65bf",
};

// ─── carousel actions ─────────────────────────────────────────────
const ACTIONS = [
  { label: "Registrar doação recebida",       icon: Gift },
  { label: "Cadastrar novo item",              icon: CirclePlus },
  { label: "Registrar doação realizada",       icon: HandHeart },
  { label: "Cadastrar família",                icon: Users },
  { label: "Consultar histórico das famílias", icon: Search },
  { label: "Consultar estoque instituições",   icon: Boxes },
];

const CARDS_PER_PAGE = 4;
const TOTAL_PAGES    = Math.ceil(ACTIONS.length / CARDS_PER_PAGE);

// ─── nav tree ────────────────────────────────────────────────────
type NavLeaf  = { id: string; label: string; icon: React.ElementType };
type NavGroup = { id: string; label: string; icon: React.ElementType; children: NavLeaf[] };

const NAV_TREE: (NavLeaf | NavGroup)[] = [
  { id: "inicio",    label: "Início",      icon: Home },
  {
    id: "cadastros", label: "Cadastros",   icon: Users,
    children: [
      { id: "familias",     label: "Famílias",     icon: Users    },
      { id: "usuarios",     label: "Usuários",     icon: User     },
      { id: "doadores",     label: "Doadores",     icon: Heart    },
      { id: "parceiros",    label: "Parceiros",    icon: Handshake},
      { id: "itens",        label: "Itens",        icon: Gift     },
      { id: "instituicoes", label: "Instituições", icon: Building2},
    ],
  },
  {
    id: "estoque",   label: "Estoque",     icon: Package,
    children: [
      { id: "entrada", label: "Entrada", icon: ArrowUp   },
      { id: "saida",   label: "Saída",   icon: ArrowDown },
    ],
  },
  {
    id: "relatorios", label: "Relatórios", icon: BarChart2,
    children: [
      { id: "hist-doacoes", label: "Histórico doações famílias", icon: Search         },
      { id: "mov-estoque",  label: "Movimentação estoque",       icon: ArrowLeftRight },
      { id: "estoque-instituicao", label: "Estoque por instituição", icon: Boxes },
    ],
  },
  { id: "atendimentos", label: "Atendimentos", icon: Stethoscope },
];

// ════════════════════════════════════════════════════════════════
//  SIDEBAR
// ════════════════════════════════════════════════════════════════
function Sidebar({
  activeId,
  onSelect,
  isCollapsed,
  onToggleCollapse
}: {
  activeId: string;
  onSelect: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ cadastros: true });
  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    if (isCollapsed) return; // Do not auto-expand groups if collapsed
    const parentGroup = NAV_TREE.find(
      item => "children" in item && item.children.some(c => c.id === activeId)
    );
    if (parentGroup) {
      setExpanded(p => ({ ...p, [parentGroup.id]: true }));
    }
  }, [activeId, isCollapsed]);

  const itemStyle = (active: boolean) => ({
    background: active ? P.sidebarActive : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.68)",
  });

  return (
    <aside
      className="flex flex-col shrink-0 py-6 gap-0.5 overflow-y-auto transition-all duration-300"
      style={{
        background: P.sidebarBg,
        width: isCollapsed ? "64px" : "224px",
        paddingLeft: isCollapsed ? "8px" : "12px",
        paddingRight: isCollapsed ? "8px" : "12px",
      }}
    >
      {/* Logo / Toggle button */}
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-3 mb-6">
          <ImageWithFallback src={logoIcon} alt="Conexão Solidária" className="w-9 h-9 object-contain" />
          <button onClick={onToggleCollapse}
            className="text-white opacity-60 hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Expandir Menu">
            <ChevronRight size={17} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1 mb-6">
          <div className="flex items-center gap-2">
            <ImageWithFallback src={logoIcon} alt="Conexão Solidária" className="w-9 h-9 object-contain shrink-0" />
            <span className="text-white font-semibold text-sm leading-tight">Conexão<br/>Solidária</span>
          </div>
          <button onClick={onToggleCollapse}
            className="text-white opacity-60 hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Minimizar Menu">
            <ChevronLeft size={17} />
          </button>
        </div>
      )}

      {NAV_TREE.map(item => {
        const Icon    = item.icon;
        const isGroup = "children" in item;
        const isOpen  = isGroup ? !!expanded[item.id] : false;

        if (!isGroup) {
          const active = activeId === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)}
              className={`flex items-center rounded-lg text-sm font-medium transition-all text-left w-full ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}`}
              style={itemStyle(active)}
              title={isCollapsed ? item.label : undefined}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = P.sidebarHover; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <Icon size={17} strokeWidth={active ? 2 : 1.6} />
              {!isCollapsed && <span className="flex-1">{item.label}</span>}
            </button>
          );
        }

        const anyChildActive = item.children.some(c => c.id === activeId);

        const handleGroupClick = () => {
          if (isCollapsed) {
            onToggleCollapse();
            setExpanded(p => ({ ...p, [item.id]: true }));
          } else {
            toggle(item.id);
          }
        };

        return (
          <div key={item.id}>
            <button onClick={handleGroupClick}
              className={`flex items-center rounded-lg text-sm font-medium transition-all text-left w-full ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}`}
              style={itemStyle(anyChildActive && (!isOpen || isCollapsed))}
              title={isCollapsed ? item.label : undefined}
              onMouseEnter={e => { if (!anyChildActive || isOpen || isCollapsed) e.currentTarget.style.background = P.sidebarHover; }}
              onMouseLeave={e => { if (!anyChildActive || isOpen || isCollapsed) e.currentTarget.style.background = (anyChildActive && (!isOpen || isCollapsed)) ? P.sidebarActive : "transparent"; }}>
              <Icon size={17} strokeWidth={1.6} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  <span className="transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <ChevronDown size={14} strokeWidth={2} />
                  </span>
                </>
              )}
            </button>
            {!isCollapsed && isOpen && (
              <div className="ml-2 mt-0.5 mb-0.5 flex flex-col gap-0.5 border-l pl-3" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                {item.children.map(child => {
                  const ChildIcon = child.icon;
                  const active    = activeId === child.id;
                  return (
                    <button key={child.id} onClick={() => onSelect(child.id)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left w-full"
                      style={itemStyle(active)}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = P.sidebarHover; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                      <ChildIcon size={14} strokeWidth={active ? 2 : 1.6} />
                      <span className="leading-tight">{child.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════
//  TOP BAR
// ════════════════════════════════════════════════════════════════
function TopBar({ username, onLogout }: { username: string; onLogout: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header className="flex items-center justify-end gap-3 px-6 py-3 shrink-0"
      style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(43,101,191,0.1)" }}>
      <button className="p-2 rounded-full transition-colors" style={{ color: P.teal }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(43,122,140,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
        <Bell size={22} strokeWidth={1.6} />
      </button>
      <div className="relative" ref={ref}>
        <button onClick={() => setProfileOpen(o => !o)}
          className="p-2 rounded-full transition-colors" style={{ color: P.blue }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(43,101,191,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
          <UserCircle size={26} strokeWidth={1.5} />
        </button>
        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 rounded-xl py-1 z-50"
            style={{ background: P.surface, boxShadow: "0 8px 24px rgba(26,39,68,0.14)", border: `1px solid ${P.inputBorder}` }}>
            <div className="px-4 py-2 border-b" style={{ borderColor: P.inputBorder }}>
              <p className="text-xs font-semibold truncate" style={{ color: P.darkBlue }}>{username}</p>
              <p className="text-xs" style={{ color: P.muted }}>Usuário</p>
            </div>
            <button onClick={onLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ color: "#c0392b" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fff5f5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <LogOut size={15} strokeWidth={1.8} /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
//  HOME CONTENT (carousel)
// ════════════════════════════════════════════════════════════════
function HomeContent({ username, onNavigate }: { username: string; onNavigate: (navId: string, view?: 'list' | 'form') => void }) {
  const [carouselPage, setCarouselPage] = useState(0);
  const pageActions = ACTIONS.slice(carouselPage * CARDS_PER_PAGE, carouselPage * CARDS_PER_PAGE + CARDS_PER_PAGE);

  const handleActionClick = (label: string) => {
    switch (label) {
      case "Registrar doação recebida":
        onNavigate("entrada");
        break;
      case "Cadastrar novo item":
        onNavigate("itens", "form");
        break;
      case "Registrar doação realizada":
        onNavigate("saida");
        break;
      case "Cadastrar família":
        onNavigate("familias", "form");
        break;
      case "Consultar histórico das famílias":
        onNavigate("hist-doacoes");
        break;
      case "Consultar estoque instituições":
        // Não faz nada (planejando)
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: P.darkBlue }}>Olá, {username}!</h1>
        <p className="text-base" style={{ color: P.label }}>Separamos algumas ações para você começar:</p>
      </div>

      <div className="relative">
        <div className="flex items-stretch gap-5">
          {/* Left arrow */}
          <div className="flex items-center" style={{ width: "36px", minWidth: "36px" }}>
            {carouselPage > 0 && (
              <button onClick={() => setCarouselPage(p => p - 1)}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90"
                style={{ background: P.surface, color: P.blue, boxShadow: "0 2px 10px rgba(43,101,191,0.18)", border: `1.5px solid ${P.inputBorder}` }}
                onMouseEnter={e => { e.currentTarget.style.background = P.blue; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = P.surface; e.currentTarget.style.color = P.blue; }}>
                <ChevronLeft size={20} />
              </button>
            )}
          </div>

          {/* Cards */}
          <div className="flex-1 grid gap-5"
            style={{ gridTemplateColumns: `repeat(${Math.min(pageActions.length, 4)}, 1fr)` }}>
            {pageActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button key={carouselPage * CARDS_PER_PAGE + i}
                  onClick={() => handleActionClick(action.label)}
                  className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl transition-all text-center active:scale-95 cursor-pointer"
                  style={{ background: P.surface, boxShadow: "0 2px 12px rgba(26,39,68,0.08)", border: `1.5px solid ${P.inputBorder}`, minHeight: "180px" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(43,101,191,0.18)"; e.currentTarget.style.borderColor = P.tealLight; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,39,68,0.08)"; e.currentTarget.style.borderColor = P.inputBorder; e.currentTarget.style.transform = "none"; }}>
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Icon size={52} strokeWidth={1.5} style={{ color: P.blue }} />
                  </div>
                  <span className="text-sm font-medium leading-snug" style={{ color: P.label }}>{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right arrow */}
          <div className="flex items-center" style={{ width: "36px", minWidth: "36px" }}>
            {carouselPage < TOTAL_PAGES - 1 && (
              <button onClick={() => setCarouselPage(p => p + 1)}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90"
                style={{ background: P.surface, color: P.blue, boxShadow: "0 2px 10px rgba(43,101,191,0.18)", border: `1.5px solid ${P.inputBorder}` }}
                onMouseEnter={e => { e.currentTarget.style.background = P.blue; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = P.surface; e.currentTarget.style.color = P.blue; }}>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button key={i} onClick={() => setCarouselPage(i)}
              className="rounded-full transition-all duration-200"
              style={{ width: carouselPage === i ? "20px" : "8px", height: "8px", background: carouselPage === i ? P.blue : P.tealLight }} />
          ))}
        </div>
      </div>

      <Dashboard />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  APP SHELL (authenticated layout)
// ════════════════════════════════════════════════════════════════
function AppShell({ username, onLogout }: { username: string; onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState("inicio");
  const [initialView, setInitialView] = useState<'list' | 'form'>('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (navId: string, view: 'list' | 'form' = 'list') => {
    setActiveNav(navId);
    setInitialView(view);
  };

  const renderContent = () => {
    switch (activeNav) {
      case "familias":     return <FamiliasPage initialView={initialView} key={`familias-${initialView}`} />;
      case "instituicoes": return <InstituicoesPage />;
      case "itens":        return <ItensPage initialView={initialView} key={`itens-${initialView}`} />;
      case "usuarios":     return <UsuariosPage />;
      case "doadores":     return <DoadoresPage key="doadores" />;
      case "parceiros":    return <ParceirosPage key="parceiros" />;
      case "hist-doacoes": return <HistDoacoesPage />;
      case "mov-estoque":  return <MovEstoquePage />;
      case "estoque-instituicao": return <EstoqueInstPage />;
      case "atendimentos": return <AtendimentosPage />;
      case "entrada":      return <EstoquePage tipoInicial="ENTRADA" key="entrada" />;
      case "saida":        return <EstoquePage tipoInicial="SAIDA" key="saida" />;
      case "inicio":
      default:             return <HomeContent username={username} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar
        activeId={activeNav}
        onSelect={setActiveNav}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ background: P.bg }}>
        <TopBar username={username} onLogout={onLogout} />
        <div className="flex-1 overflow-hidden flex flex-col">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }: { onLogin: (user: string) => void }) {
  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (username.trim()) onLogin(username.trim()); };

  const inp = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all";

  return (
    <div className="h-screen w-full flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #c8d8f0 0%, #a8bee8 40%, #8faedd 100%)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.18) 0%, transparent 60%)" }} />
        <ImageWithFallback src={heroImage} alt="Conexão Solidária — Bem-vindo(a)" className="relative z-10 w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center px-10 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-8 text-center tracking-tight" style={{ color: P.label }}>Login</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium" style={{ color: P.label }}>Usuário</label>
              <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className={inp} style={{ background: P.inputBg, border: `1.5px solid ${P.inputBorder}`, color: P.darkBlue }}
                onFocus={e => { e.target.style.borderColor = P.blue; e.target.style.boxShadow = "0 0 0 3px rgba(43,101,191,0.12)"; }}
                onBlur={e  => { e.target.style.borderColor = P.inputBorder; e.target.style.boxShadow = "none"; }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium" style={{ color: P.label }}>Senha</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha"
                  className={`${inp} pr-11`} style={{ background: P.inputBg, border: `1.5px solid ${P.inputBorder}`, color: P.darkBlue }}
                  onFocus={e => { e.target.style.borderColor = P.blue; e.target.style.boxShadow = "0 0 0 3px rgba(43,101,191,0.12)"; }}
                  onBlur={e  => { e.target.style.borderColor = P.inputBorder; e.target.style.boxShadow = "none"; }} />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded" style={{ color: P.muted }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <a href="#" className="text-xs font-medium hover:underline" style={{ color: P.blue }}>Esqueci a senha</a>
              </div>
            </div>
            <button type="submit"
              className="w-full rounded-xl py-3 text-sm font-semibold text-white mt-1 transition-all active:scale-95"
              style={{ background: `linear-gradient(135deg, #3b7dd8 0%, ${P.blue} 100%)`, boxShadow: "0 4px 14px rgba(43,101,191,0.35)" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 18px rgba(43,101,191,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(43,101,191,0.35)"; }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  ROOT
// ════════════════════════════════════════════════════════════════
export default function App() {
  const [page,     setPage]     = useState<"login" | "app">("login");
  const [username, setUsername] = useState("");

  if (page === "app") {
    return <AppShell username={username} onLogout={() => { setUsername(""); setPage("login"); }} />;
  }
  return <LoginPage onLogin={u => { setUsername(u); setPage("app"); }} />;
}
