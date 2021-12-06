import React, {
	createContext,
	FunctionComponent,
	useEffect,
	useState,
} from 'react';
import { createTheme, ThemeProvider } from '@mui/material';

interface ThemeContextInterface {
	darkTheme: boolean;
	toggleDarkTheme: () => void;
}

const ThemeContext = createContext({} as ThemeContextInterface);

export const ThemeStore: FunctionComponent = ({ children }) => {
	const [darkTheme, setDarkTheme] = useState((): boolean => {
		try {
			return JSON.parse(localStorage.getItem('darkTheme') as string);
		} catch (e) {
			return false;
		}
	});

	useEffect(() => {
		document.documentElement.dataset.theme = `theme-${
			darkTheme ? 'dark' : 'light'
		}`;
	}, [darkTheme]);

	const toggleDarkTheme = (): void => {
		const newDarkTheme = !darkTheme;
		setDarkTheme(newDarkTheme);
		localStorage.setItem('darkTheme', JSON.stringify(newDarkTheme));
	};

	const theme = createTheme({
		palette: {
			mode: darkTheme ? 'dark' : 'light',
		},
	});

	return (
		<ThemeContext.Provider value={{ darkTheme, toggleDarkTheme }}>
			<ThemeProvider theme={theme}>{children}</ThemeProvider>
		</ThemeContext.Provider>
	);
};

export default ThemeContext;
