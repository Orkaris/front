export const lightTheme = {
    dark: false,
    colors: {
        background: '#ffffff',
        primary: '#7367EB',
        text: '#222222',
        textButton : '#ffffff',
        textSecondary: '#888888',
        error: '#f44336',
        outline: '#888888',
        surfaceVariant: '#f0f0f0',
    },
};

export const darkTheme = {
    dark: true,
    colors: {
        background: '#1C202B',
        primary: '#7367EB',
        text: '#ffffff',
        textButton : '#ffffff',
        textSecondary: '#888888',
        error: '#f44336',
        surfaceVariant: '#444444',
    },
};

export type ThemeType = typeof lightTheme;
