import {
  Target,
  Star,
  MapPin,
  Heart,
  Calendar,
  Clock,
  FileText,
  Package,
  ShoppingCart,
  Zap,
  TrendingUp,
  Award,
  Gift,
  Sparkles,
  Rocket,
  type LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Target,
  Star,
  MapPin,
  Heart,
  Calendar,
  Clock,
  FileText,
  Package,
  ShoppingCart,
  Zap,
  TrendingUp,
  Award,
  Gift,
  Sparkles,
  Rocket,
};

export const iconOptions = Object.keys(iconMap);

export const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Target;
};
