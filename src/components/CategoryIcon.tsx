import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Tag, 
  Star, 
  Shirt, 
  Footprints, 
  Gamepad2, 
  Watch, 
  ShoppingBag,
  Zap,
  Gift
} from 'lucide-react';
import { CategoryId } from '../types';

interface CategoryIconProps {
  categoryId: CategoryId | string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryId,
  className = 'w-4 h-4',
  size = 16,
}) => {
  switch (categoryId) {
    case 'all':
      return <Sparkles className={className} size={size} />;
    case 'fashion':
      return <Shirt className={className} size={size} />;
    case 'footwear':
      return <Footprints className={className} size={size} />;
    case 'toys':
      return <Gamepad2 className={className} size={size} />;
    case 'accessories':
      return <Watch className={className} size={size} />;
    case 'deals':
      return <Flame className={className} size={size} />;
    case 'bestseller':
      return <Star className={className} size={size} />;
    default:
      return <ShoppingBag className={className} size={size} />;
  }
};
