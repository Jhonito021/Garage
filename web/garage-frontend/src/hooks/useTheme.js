// frontend/src/hooks/useTheme.js
import { useTheme as useThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
    const { theme, toggleTheme, isDark, isLight } = useThemeContext();
    return { theme, toggleTheme, isDark, isLight };
};