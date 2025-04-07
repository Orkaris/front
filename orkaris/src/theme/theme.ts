export const lightTheme = {
    dark: false,
    colors: {
        background: '#ffffff',
        text: '#000000',
    },
};

export const darkTheme = {
    dark: true,
    colors: {
        background: '#000000',
        text: '#ffffff',
    },
};

export type ThemeType = typeof lightTheme;
