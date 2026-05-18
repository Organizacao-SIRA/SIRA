import { Sparkles, BookOpen, Compass, BrainCircuit } from 'lucide-react';

interface WelcomeStepProps {
  userName?: string | null;
}

const HIGHLIGHTS = [
  { icon: Compass,      label: 'Recomendações personalizadas com base no seu perfil acadêmico.' },
  { icon: BookOpen,     label: 'Livros e artigos científicos curados para suas áreas de interesse.' },
  { icon: BrainCircuit, label: 'Busca conversacional com IA para encontrar exatamente o que precisa.' },
];

export const WelcomeStep = ({ userName }: WelcomeStepProps) => {
  const firstName = userName?.trim().split(' ')[0];

  return (
    <div className="text-center max-w-xl mx-auto">
      <div className="w-16 h-16 bg-primary-soft text-primary rounded-full flex items-center justify-center mx-auto mb-5">
        <Sparkles className="w-8 h-8" aria-hidden="true" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark dark:text-text mb-3">
        {firstName ? `Olá, ${firstName}!` : 'Bem-vindo ao SIRA+'}
      </h1>
      <p className="text-text-muted text-sm sm:text-base mb-8">
        Para personalizar suas recomendações acadêmicas, vamos conhecer rapidamente o seu perfil.
        Em poucos minutos você terá o SIRA+ adaptado ao seu jeito de estudar.
      </p>

      <ul className="space-y-3 text-left">
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-start gap-3 p-3 rounded-xl bg-surface-muted border border-border"
          >
            <span className="text-primary mt-0.5 flex-shrink-0">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="text-sm text-text">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
