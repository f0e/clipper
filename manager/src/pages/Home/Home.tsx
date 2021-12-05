import React, { ReactElement, useContext, useEffect, useState } from 'react';
import ApiContext from '../../context/ApiContext';
import Demo from '../../../../types/demo.types';
import DemoList from '../../components/DemoList/DemoList';
import Loader from '../../components/Loader/Loader';
import MessageContext from '../../context/MessageContext';
import LoadingButton from '../../components/LoadingButton/LoadingButton';

const Home = (): ReactElement => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [clips, setClips] = useState<Demo[]>([]);
	const [archives, setArchives] = useState<Demo[]>([]);
	const [demosNeedParsing, setDemosNeedParsing] = useState(false);

	const Api = useContext(ApiContext);
	const { setMessage } = useContext(MessageContext);

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
		getClips();
	}, []);

	if (loading) return <Loader message="Loading demos..." />;
	if (error) return <h2>Failed to load demos.</h2>;

	return (
		<div>
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
		</div>
	);
};

export default Home;
