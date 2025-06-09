import { Card, CardContent } from '@/components/ui/card';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

interface CategoryCardProps {
  category: BusinessCategory;
  onSelect: (categoryId: string) => void;
}

const CategoryCard = ({ category, onSelect }: CategoryCardProps) => (
  <Card 
    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
    onClick={() => onSelect(category.id)}
  >
    <CardContent className="p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-community-green/10 rounded-full">
        <div className="text-community-green text-2xl">📍</div>
      </div>
      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
      <p className="text-sm text-gray-600">{category.description}</p>
    </CardContent>
  </Card>
);

export default CategoryCard;