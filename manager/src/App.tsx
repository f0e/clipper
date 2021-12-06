import React, { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageStore } from './context/MessageContext';
import { ThemeStore } from './context/ThemeContext';
import { ApiStore } from './context/ApiContext';
import Navbar from './components/Navbar/Navbar';
import MessageBar from './components/MessageBar/MessageBar';
import Home from './pages/Home/Home';
import Settings from './pages/Settings/Settings';

import './styles/variables.scss';
import './App.scss';

const App = (): ReactElement => {
	return (
		<div className="App">
			<Router>
				<ThemeStore>
					<MessageStore>
						<ApiStore>
							<Navbar />

							<Routes>
								<Route path="/" element={<Home />} />
								<Route path="/settings" element={<Settings />} />
							</Routes>

							<MessageBar />
						</ApiStore>
					</MessageStore>
				</ThemeStore>
			</Router>
		</div>
	);
};

export default App;
