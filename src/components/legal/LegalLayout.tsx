import Link from "next/link";

type LegalLink = { href: string; label: string };

type Props = {
  title: string;
  updatedAt: string;
  otherLinks: LegalLink[];
  children: React.ReactNode;
};

export default function LegalLayout({ title, updatedAt, otherLinks, children }: Props) {
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors text-sm">
          ← Inicio
        </Link>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500 text-sm font-medium">SalesAI · Sicoben Ediciones</span>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-12 max-w-3xl mx-auto w-full">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Información legal</p>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-400 mb-10">Última actualización: {updatedAt}</p>

        <div className="
          [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-800 [&_h2]:mt-10 [&_h2]:mb-3
          [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-4
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
          [&_li]:text-slate-600
          [&_strong]:text-slate-800 [&_strong]:font-semibold
          [&_a]:text-blue-600 [&_a:hover]:underline
          [&_table]:w-full [&_table]:text-sm [&_table]:mb-6 [&_table]:border-collapse
          [&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:bg-slate-100 [&_th]:text-slate-700 [&_th]:font-semibold [&_th]:border [&_th]:border-slate-200
          [&_td]:px-3 [&_td]:py-2 [&_td]:text-slate-600 [&_td]:border [&_td]:border-slate-200
          [&_tr:nth-child(even)_td]:bg-slate-50
        ">
          {children}
        </div>
      </main>

      {/* Footer with links to the other two legal pages */}
      <footer className="border-t border-slate-200 px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Sicoben Ediciones. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {otherLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-slate-800 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
