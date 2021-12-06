import { ReactElement } from 'react';
import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import DarkModeToggler from '../DarkModeToggler/DarkModeToggler';

import './Navbar.scss';

const Navbar = (): ReactElement => {
	return (
		<div className="navbar-container">
			<AppBar className="navbar" position="static">
				<Toolbar>
					<Link to="/">
						<div className="navbar-title">Clipper</div>
					</Link>

					<div style={{ flexGrow: 1 }}></div>

					<DarkModeToggler />

					<Link to="/settings" className="navbar-link">
						Settings
					</Link>
				</Toolbar>
			</AppBar>
		</div>
	);
};

export default Navbar;
