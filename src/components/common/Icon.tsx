import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

// Create a type-safe icon map
const iconMap = {
  Activity: LucideIcons.Activity,
  ShieldCheck: LucideIcons.ShieldCheck,
  HelpCircle: LucideIcons.HelpCircle,
  // Add more icons as needed
} as const;

const iconNames = Object.entries(iconMap).map((icon) => icon[0]);

type Props = {
  iconName: string;
} & LucideProps;

export default function Icon({ iconName, ...props }: Props) {
  if (!iconNames.includes(iconName)) {
    return <LucideIcons.HelpCircle {...props} />;
  }

  const IconComponent = iconMap[iconName as keyof typeof iconMap];

  if (!IconComponent) {
    return <LucideIcons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
}
