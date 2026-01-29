import { createContext, useContext, useState, ReactNode } from 'react';

interface EditModeContextType {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  toggleEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    return {
      isEditing: false,
      setIsEditing: () => {},
      toggleEditMode: () => {},
    };
  }
  return context;
};

interface EditModeProviderProps {
  children: ReactNode;
}

export const EditModeProvider = ({ children }: EditModeProviderProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => setIsEditing(prev => !prev);

  return (
    <EditModeContext.Provider value={{ isEditing, setIsEditing, toggleEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
};
