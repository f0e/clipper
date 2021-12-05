import React, { ReactElement, useContext, useEffect, useState } from 'react';
import ApiContext from '../../context/ApiContext';
import Demo from '../../../../types/demo.types';
import DemoCard from '../../components/DemoCard/DemoCard';

// import "./Home.scss";

const Home = (): ReactElement => {
	const [loading, setLoading] = useState(true);
	const [clips, setClips] = useState<Demo[]>([]);
	const [archives, setArchives] = useState<Demo[]>([]);

	const Api = useContext(ApiContext);

	const getClips = async () => {
		setLoading(true);

		const demos = await Api.get('/get-demos');
		setClips(demos.clips);
		setArchives(demos.archives);

		setLoading(false);
	};

	useEffect(() => {
		getClips();
	}, []);

	return (
		<div>
			<h1>Hi</h1>

			{loading ? (
				<h4>Loading...</h4>
			) : (
				<>
					<h2>Clips</h2>
					{clips.map((clip) => (
						<DemoCard demo={clip} />
					))}

					<h2>Archives</h2>
					{archives.map((archive) => (
						<DemoCard demo={archive} />
					))}
				</>
			)}
		</div>
	);
};

export default Home;
