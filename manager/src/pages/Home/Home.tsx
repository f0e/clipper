import React, { ReactElement, useContext, useEffect, useState } from 'react';
import ApiContext from '../../context/ApiContext';
import Demo from '../../../../types/demo.types';
import DemoCard from '../../components/DemoCard/DemoCard';
import Loader from '../../components/Loader/Loader';
import MessageContext from '../../context/MessageContext';
import LoadingButton from '../../components/LoadingButton/LoadingButton';

// import "./Home.scss";

const Home = (): ReactElement => {
	const [loading, setLoading] = useState(true);
	const [clips, setClips] = useState<Demo[]>([]);
	const [archives, setArchives] = useState<Demo[]>([]);
	const [demosNeedParsing, setDemosNeedParsing] = useState(false);

	const Api = useContext(ApiContext);
	const { setMessage } = useContext(MessageContext);

	const getClips = async () => {
		setLoading(true);

		const demos = await Api.get('/get-demos');
		setClips(demos.clips);
		setArchives(demos.archives);

		setDemosNeedParsing(
			[...demos.clips, ...demos.archives].find((demo) => !demo.parsed)
		);

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

	return (
		<div>
			{loading ? (
				<Loader message="Loading demos..." />
			) : (
				<>
					<h2>Clips</h2>
					{clips.map((clip) => (
						<DemoCard demo={clip} />
					))}

					<br />

					<h2>Archives</h2>
					{archives.map((archive) => (
						<DemoCard demo={archive} />
					))}
				</>
			)}

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
