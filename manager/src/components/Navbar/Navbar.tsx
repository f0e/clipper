import { ReactElement } from 'react';
import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';

import './Navbar.scss';

const Navbar = (): ReactElement => {
	return (
		<AppBar className="navbar" position="static">
			<Toolbar>
				<Link to="/">
					<div className="navbar-title">Clipper</div>
				</Link>

				<div style={{ flexGrow: 1 }}></div>

				<Link to="/settings" className="navbar-link">
					Settings
				</Link>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
