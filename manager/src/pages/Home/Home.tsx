import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button } from '@mui/material';
import ApiContext from '../../context/ApiContext';
import Demo from '../../../../types/demo.types';
import DemoList from '../../components/DemoList/DemoList';
import Loader from '../../components/Loader/Loader';
import LoadingButton from '../../components/LoadingButton/LoadingButton';
import MessageContext from '../../context/MessageContext';

import './Home.scss';

const Home = (): ReactElement => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [configValid, setConfigValid] = useState(true);
	const [clips, setClips] = useState<Demo[]>([]);
	const [archives, setArchives] = useState<Demo[]>([]);
	const [demosNeedParsing, setDemosNeedParsing] = useState(false);

	const Api = useContext(ApiContext);
	const { setMessage } = useContext(MessageContext);

	const getConfigValid = async () => {
		const valid = await Api.get('/config-valid');
		setConfigValid(valid);
	};

	const getClips = async () => {
		setLoading(true);

		try {
			const demos = await Api.get('/get-demos');
			setClips(demos.clips);
			setArchives(demos.archives);

			setDemosNeedParsing(
				[...demos.clips, ...demos.archives].find((demo) => !demo.parsed)
			);
		} catch (e) {
			setError(true);
		}

		setLoading(false);
	};

	const parseDemos = async () => {
		await Api.post('/parse-demos');

		setMessage({
			type: 'success',
			message: 'Successfully parsed new demos',
		});

		getClips();
	};

	useEffect(() => {
		getConfigValid();
		getClips();
	}, []);

	return (
		<main className="home-page">
			{!configValid && (
				<Alert severity="error" style={{ marginBottom: '1rem' }}>
					Config not valid.{' '}
					<Link to="/settings" className="link">
						Manage config
					</Link>
				</Alert>
			)}

			{loading ? (
				<Loader message="Loading demos..." />
			) : error ? (
				<h2>Failed to load demos.</h2>
			) : (
				<>
					<DemoList title="Clips" demos={clips} />
					<br />
					<DemoList title="Archives" demos={archives} />
					<br />
					{demosNeedParsing && (
						<LoadingButton
							variant="contained"
							onClick={parseDemos}
							label="Parse demos"
						/>
					)}
				</>
			)}
		</main>
	);
};

export default Home;
