import {
  Activity,
  CheckCircle2,
  Database,
  HelpCircle,
  LucideProps,
  Shield,
  ShieldCheck,
  ShieldOff,
  ShieldPlus,
  SquareUser,
  Users,
  Zap,
} from 'lucide-react';

const iconMap = {
  Activity: Activity,
  ShieldCheck: ShieldCheck,
  HelpCircle: HelpCircle,
  CheckCircle2: CheckCircle2,
  Shield: Shield,
  Users: Users,
  Database: Database,
  Zap: Zap,
  SquareUser: SquareUser,
  ShieldPlus: ShieldPlus,
  ShieldOff: ShieldOff,
} as const;

const iconNames = Object.entries(iconMap).map((icon) => icon[0]);

type Props = {
  iconName: string;
} & LucideProps;

export default function Icon({ iconName, ...props }: Props) {
  if (!iconNames.includes(iconName)) {
    return <HelpCircle {...props} />;
  }

  const IconComponent = iconMap[iconName as keyof typeof iconMap];

  if (!IconComponent) {
    return <HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
}
