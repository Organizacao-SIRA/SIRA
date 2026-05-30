import { Sparkles, Library, MessageSquare } from 'lucide-react';
import { SiraLogo } from '../ui/SiraLogo';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Recomendações personalizadas',
    description: 'Sugestões acadêmicas baseadas no seu perfil e interesses.',
  },
  {
    icon: Library,
    title: 'Biblioteca acadêmica curada',
    description: 'Acesso integrado a livros e artigos científicos.',
  },
  {
    icon: MessageSquare,
    title: 'Busca conversacional',
    description: 'Pesquise materiais usando linguagem natural com IA.',
  },
];

export const AuthVisualPanel = () => (
  <aside
    aria-hidden="true"
    className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark text-white"
  >
    {/* Decorative gradient blobs */}
    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
    <div className="absolute -bottom-32 -left-16 w-[28rem] h-[28rem] rounded-full bg-accent/10 blur-3xl" />

    <div className="relative z-10 flex flex-col justify-between p-8 lg:p-10 xl:p-14 w-full">
      <div className="flex flex-col gap-6">
        <SiraLogo size="xl" tone="light" />
        <div className="space-y-3 max-w-md">
          <h1 className="text-2xl xl:text-4xl font-extrabold leading-tight tracking-tight">
            Sua jornada acadêmica, <span className="text-accent">potencializada por IA</span>.
          </h1>
          <p className="text-blue-100 text-sm xl:text-base leading-relaxed">
            Encontre livros, artigos e materiais de forma inteligente — adaptados ao seu curso, nível e objetivos.
          </p>
        </div>
      </div>

      <ul className="space-y-4 xl:space-y-5 mt-8 xl:mt-10">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex items-start gap-3.5">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-blue-100/80 leading-relaxed">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </aside>
);
