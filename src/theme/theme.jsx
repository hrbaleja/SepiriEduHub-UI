import { createTheme } from '@mui/material/styles'

const palette = {
  primary: {
    lighter: '#D0ECFE',
    light: '#073954',
    main: '#073954',
    dark: '#0C44AE',
    darker: '#042174',
    contrastText: '#FFFFFF',
  },
  secondary: {
    lighter: '#EFD6FF',
    light: '#C684FF',
    main: '#8E33FF',
    dark: '#5119B7',
    darker: '#27097A',
    contrastText: '#FFFFFF',
  },
  info: { main: '#00B8D9', contrastText: '#FFFFFF' },
  success: { main: '#22C55E', contrastText: '#ffffff' },
  warning: { main: '#FFAB00', contrastText: '#1C252E' },
  error: { main: '#FF5630', contrastText: '#FFFFFF' },
  grey: {
    50: '#FCFDFD',
    100: '#F9FAFB',
    200: '#F4F6F8',
    300: '#DFE3E8',
    400: '#C4CDD5',
    500: '#919EAB',
    600: '#637381',
    700: '#454F5B',
    800: '#1C252E',
    900: '#141A21',
  },
  background: {
    paper: '#FFFFFF',
    default: '#F9FAFB',
    neutral: '#F4F6F8',
  },
  text: {
    primary: '#1C252E',
    secondary: '#637381',
    disabled: '#919EAB',
  },
};

const customShadows = {
  card: 'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
};

const theme = createTheme({
  palette,
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"DM Sans", "Barlow", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemiBold: 600,
    fontWeightBold: 700,
    h1: { fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.25 },
    h2: { fontWeight: 800, fontSize: '2rem', lineHeight: 1.33 },
    h3: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.5 },
    h4: { fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.5 },
    h5: { fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.5 },
    h6: { fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.55 },
    subtitle1: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.57 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.57 },
    button: { fontWeight: 700, fontSize: '0.875rem', textTransform: 'unset' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          position: 'relative',
          boxShadow: customShadows.card,
          borderRadius: 16, // theme.shape.borderRadius * 2
          zIndex: 0,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: '24px 24px 0px' },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'unset',
          fontWeight: 700,
          boxShadow: 'none',
        },
        containedPrimary: {
          color: palette.primary.contrastText,
          backgroundColor: palette.primary.main,
          '&:hover': {
            backgroundColor: palette.primary.dark,
            boxShadow: 'rgba(24, 119, 242, 0.24) 0px 8px 16px 0px',
          },
        },
        containedSecondary: {
          color: palette.secondary.contrastText,
          backgroundColor: palette.secondary.main,
          '&:hover': {
            backgroundColor: palette.secondary.dark,
            boxShadow: 'rgba(142, 51, 255, 0.24) 0px 8px 16px 0px',
          },
        },
        sizeLarge: {
          minHeight: 48,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(6px)',
          color: palette.text.primary,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.background.paper,
          borderRight: `1px dashed ${palette.grey[300]}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '8px 16px',
          color: palette.text.secondary,
          '&.Mui-selected': {
            color: palette.primary.main,
            backgroundColor: 'rgba(24, 119, 242, 0.08)',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(24, 119, 242, 0.16)',
            },
            '& .MuiListItemIcon-root': {
              color: palette.primary.main,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& fieldset': {
            borderColor: 'rgba(145, 158, 171, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: 'rgba(145, 158, 171, 0.16)' },
      },
    },
  },
})

export default theme
