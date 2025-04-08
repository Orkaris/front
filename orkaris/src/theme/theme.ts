export const lightTheme = {
    dark: false,
    colors: {
        background: '#ffffff',
        text: '#222222',
        onBackground: '#ffffff',
        backdrop: '#f0f0f0',
        primary: '#222222',
    },
};

export const darkTheme = {
    dark: true,
    colors: {
        background: '#000000',
        text: '#ffffff',
        onBackground: '#ffffff',
        backdrop: '#f0f0f0',
        primary: '#6200ee',
    },
};

export type ThemeType = typeof lightTheme;
