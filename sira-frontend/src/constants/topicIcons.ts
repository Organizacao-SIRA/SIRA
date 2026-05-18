import type { ElementType } from 'react';
import {
  Cpu, Landmark, Scale, LineChart, GraduationCap,
  Activity, TrendingUp, Users, Globe,
} from 'lucide-react';

export const TOPIC_ICONS: Record<string, ElementType> = {
  ia:  Cpu,
  gp:  Landmark,
  dir: Scale,
  cd:  LineChart,
  edu: GraduationCap,
  sau: Activity,
  eco: TrendingUp,
  soc: Users,
  amb: Globe,
};
