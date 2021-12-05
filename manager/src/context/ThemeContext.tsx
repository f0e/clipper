import { createTheme, ThemeProvider } from '@mui/material';
import React, { createContext, FunctionComponent } from 'react';

const ThemeContext = createContext({});

export const ThemeStore: FunctionComponent = ({ children }) => {
	const theme = createTheme({});

	return (
		<ThemeContext.Provider value="">
			<ThemeProvider theme={theme}>{children}</ThemeProvider>
		</ThemeContext.Provider>
	);
};

export default ThemeContext;
