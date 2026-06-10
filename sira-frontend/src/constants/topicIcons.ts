import type { ElementType } from 'react';
import {
  Cpu, Landmark, Scale, LineChart, GraduationCap,
  Activity, TrendingUp, Users, Globe,
  Calculator, Atom, FlaskConical, Code2, Dna,
  Terminal, Building2, Cog, Factory, Stethoscope,
  HeartPulse, Brain, Sprout, PawPrint, Briefcase,
  Megaphone, BookMarked, Lightbulb, Map, Type, Palette,
} from 'lucide-react';

export const TOPIC_ICONS: Record<string, ElementType> = {
  // — áreas originais —
  ia:  Cpu,
  gp:  Landmark,
  dir: Scale,
  cd:  LineChart,
  edu: GraduationCap,
  sau: Activity,
  eco: TrendingUp,
  soc: Users,
  amb: Globe,
  // — Exatas e da Terra —
  mat:  Calculator,
  fis:  Atom,
  qui:  FlaskConical,
  comp: Code2,
  // — Biológicas —
  bio:  Dna,
  // — Engenharias —
  esoft: Terminal,
  eciv:  Building2,
  emec:  Cog,
  eprod: Factory,
  // — Saúde —
  med: Stethoscope,
  enf: HeartPulse,
  psi: Brain,
  // — Agrárias —
  agro: Sprout,
  vet:  PawPrint,
  // — Sociais Aplicadas —
  adm: Briefcase,
  com: Megaphone,
  // — Humanas —
  hist: BookMarked,
  fil:  Lightbulb,
  geog: Map,
  // — Linguística, Letras e Artes —
  let: Type,
  art: Palette,
};
