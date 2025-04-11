export const lightTheme = {
    dark: false,
    colors: {
        background: '#ffffff',
        text: '#222222',
        textSecondary: '#888888',
        onBackground: '#ffffff',
        backdrop: '#f0f0f0',
    },
};

export const darkTheme = {
    dark: true,
    colors: {
        background: '#222222',
        text: '#ffffff',
        textSecondary: '#888888',
        onBackground: '#ffffff',
        backdrop: '#f0f0f0',
    },
};

export type ThemeType = typeof lightTheme;
