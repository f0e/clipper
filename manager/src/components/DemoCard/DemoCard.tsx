import React, { ReactElement, useContext } from 'react';
import { Card, CardContent } from '@mui/material';
import Demo from '../../../../types/demo.types';

interface DemoCardProps {
	demo: Demo;
}

const DemoCard = ({ demo }: DemoCardProps): ReactElement => {
	return (
		<Card variant="outlined">
			<CardContent>
				<h2>{demo.name}</h2>

				{!demo.parsed ? (
					<div>Not yet parsed</div>
				) : (
					<>
						<h4>{demo.info.headers.localPlayer}</h4>
						<h4>{demo.info.headers.map}</h4>
						<div>{JSON.stringify(demo.info)}</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default DemoCard;
