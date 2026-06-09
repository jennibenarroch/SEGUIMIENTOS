import { Target, RefreshCw, FileText, Lightbulb, Users, Plane, BarChart3, Layout } from "lucide-react";
import { Zap } from "lucide-react";

const modules = [
  {
    icon: Target,
    tag: "Módulo 1",
    title: "Prospección Inteligente",
    description: "Cuota semanal de 10 prospectos. Secuencia WhatsApp → Email → Llamada activada automáticamente por la IA.",
    accent: "blue",
    href: "/dashboard/prospeccion",
  },
  {
    icon: RefreshCw,
    tag: "Módulo 2",
    title: "Seguimiento Multicanal",
    description: "Deals Internacionales. Seguimiento semanal por país: mercancía, exhibición e inventario. La IA redacta el email, tú apruebas.",
    accent: "indigo",
    href: "/dashboard/seguimiento",
  },
  {
    icon: FileText,
    tag: "Módulo 3",
    title: "Materiales de Ventas con IA",
    description: "Presentaciones PPTX y guiones de video personalizados por prospecto en segundos, con link de tracking incluido.",
    accent: "violet",
    href: "/dashboard/materiales",
  },
  {
    icon: Lightbulb,
    tag: "Módulo 4",
    title: "Propuestas Creativas con IA",
    description: "3 conceptos creativos por solicitud (exhibidores, activaciones, temporadas). PPTX + PDF listos en < 30 seg.",
    accent: "purple",
    href: "/dashboard/propuestas",
    badge: "Nuevo",
  },
  {
    icon: Users,
    tag: "Módulo 5",
    title: "Retención de Clientes Activos",
    description: "Ciclos A/B/C (7, 15 o 30 días). Semáforo de salud por cliente. La secuencia nunca se detiene sin aprobación.",
    accent: "teal",
    href: "/dashboard/retencion",
    badge: "Nuevo",
  },
  {
    icon: Plane,
    tag: "Módulo 6",
    title: "Alertas de Viaje por País",
    description: "30 días de anticipación al viaje ideal. Kit automático: lista de clientes, propuestas y calendario de visitas.",
    accent: "cyan",
    href: "/dashboard/viajes",
    badge: "Nuevo",
  },
  {
    icon: BarChart3,
    tag: "Módulo 7",
    title: "Informes Semanales",
    description: "Cada lunes a las 7 AM (Panamá) el gerente recibe en Monday y Email el informe desglosado por vendedor.",
    accent: "emerald",
    href: "/dashboard/informes",
    badge: "Nuevo",
  },
  {
    icon: Layout,
    tag: "Módulo 8",
    title: "Integración Monday CRM",
    description: "Bandeja de aprobaciones, automatizaciones y sincronización bidireccional desde Monday como interfaz principal.",
    accent: "blue",
    href: "/dashboard/monday",
  },
];

const border: Record<string, string> = {
  blue:    "border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5",
  indigo:  "border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/5",
  violet:  "border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/5",
  purple:  "border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/5",
  teal:    "border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-500/5",
  cyan:    "border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/5",
  emerald: "border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5",
};

const iconCls: Record<string, string> = {
  blue:    "text-blue-400 bg-blue-400/10",
  indigo:  "text-indigo-400 bg-indigo-400/10",
  violet:  "text-violet-400 bg-violet-400/10",
  purple:  "text-purple-400 bg-purple-400/10",
  teal:    "text-teal-400 bg-teal-400/10",
  cyan:    "text-cyan-400 bg-cyan-400/10",
  emerald: "text-emerald-400 bg-emerald-400/10",
};

const badgeCls: Record<string, string> = {
  blue:    "text-blue-400 bg-blue-400/10",
  indigo:  "text-indigo-400 bg-indigo-400/10",
  violet:  "text-violet-400 bg-violet-400/10",
  purple:  "text-purple-400 bg-purple-400/10",
  teal:    "text-teal-400 bg-teal-400/10",
  cyan:    "text-cyan-400 bg-cyan-400/10",
  emerald: "text-emerald-400 bg-emerald-400/10",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white">SalesAI</span>
        </div>
        <a href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          Salir
        </a>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Selecciona un módulo para comenzar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <a
              key={mod.title}
              href={mod.href}
              className={`group relative p-6 rounded-2xl bg-slate-900 border transition-all cursor-pointer ${border[mod.accent] ?? border.blue}`}
            >
              {mod.badge && (
                <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                  {mod.badge}
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconCls[mod.accent] ?? iconCls.blue}`}>
                <mod.icon className="w-5 h-5" />
              </div>
              <p className={`text-xs font-semibold mb-1 ${badgeCls[mod.accent] ?? badgeCls.blue}`}>{mod.tag}</p>
              <h2 className="text-sm font-semibold text-white mb-2 leading-snug">{mod.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{mod.description}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
