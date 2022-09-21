import React, { ReactElement, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@mui/material';
import Demo from '../../../../types/demo.types';
import ApiContext from '../../context/ApiContext';
import LoadingButton from '../LoadingButton/LoadingButton';
import MapIcon from '../MapIcon/MapIcon';

import './DemoCard.scss';

interface DemoCardProps {
	demo: Demo;
}

const DemoCard = ({ demo }: DemoCardProps): ReactElement => {
	const [waitingToPlay, setWaitingToPlay] = useState(false);
	// const [parsing, setParsing] = useState(false);

	const Api = useContext(ApiContext);

	const playDemo = async () => {
		setWaitingToPlay(true);

		await Api.post('/play-demo', {
			mode: demo.mode,
			demoName: demo.filename,
		});

		setWaitingToPlay(false);
	};

	return (
		<Card className="demo-card" variant="outlined">
			<CardContent className="demo-card-content">
				{demo.parsed && (
					<div className="demo-map-icon">
						<MapIcon map={demo.info.headers.map} />
					</div>
				)}

				<div className="demo-info">
					<span className="demo-name">{demo.name}</span>

					{!demo.parsed ? (
						<div>Not yet parsed</div>
					) : (
						<div className="demo-info">
							<span className="demo-player">
								{demo.info.headers.localPlayer}
							</span>

							{' on '}

							<span className="demo-map">{demo.info.headers.map}</span>

							{' ('}
							<span className="demo-length">
								{demo.info.headers.time.toFixed(0)}s
							</span>
							{')'}
						</div>
					)}
				</div>

				<div className="demo-spacer"></div>

				<div className="demo-buttons">
					<LoadingButton
						variant="contained"
						onClick={playDemo}
						label="play"
						loading={waitingToPlay}
					/>

					<Link to={`${demo.mode}/${demo.name}`}>
						<Button variant="contained">Edit</Button>
					</Link>

					{/* <LoadingButton
						variant="contained"
						onClick={parse}
						label="re-parse"
						loading={parsing}
					/> */}
				</div>
			</CardContent>
		</Card>
	);
};

export default DemoCard;
