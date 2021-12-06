import React, { ReactElement, useContext } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import ThemeContext from '../../context/ThemeContext';

const DarkModeToggler = (): ReactElement => {
	const { darkTheme, toggleDarkTheme } = useContext(ThemeContext);

	return (
		<div className="dark-toggler">
			<FormControlLabel
				control={
					<Switch
						checked={darkTheme}
						onChange={(): void => toggleDarkTheme()}
					/>
				}
				label="Dark mode"
			/>
		</div>
	);
};

export default DarkModeToggler;
