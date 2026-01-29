import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditMode } from './EditModeContext';
import { useAuth } from '@/contexts/AuthContext';

export const EditModeToggle = () => {
  const { isAdmin } = useAuth();
  const { isEditing, toggleEditMode } = useEditMode();

  // Only show for admin users
  if (!isAdmin) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <Button
        onClick={toggleEditMode}
        variant={isEditing ? "default" : "outline"}
        className={`
          gap-2 shadow-lg transition-all duration-300
          ${isEditing 
            ? 'bg-community-green hover:bg-community-green/90 text-white' 
            : 'bg-white hover:bg-gray-50 border-2 border-community-navy text-community-navy'
          }
        `}
      >
        {isEditing ? (
          <>
            <Check className="h-4 w-4" />
            Exit Edit Mode
          </>
        ) : (
          <>
            <Pencil className="h-4 w-4" />
            Edit Page
          </>
        )}
      </Button>
    </div>
  );
};
