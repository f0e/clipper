import React, { ReactElement } from 'react';
import Demo from '../../../../types/demo.types';
import DemoCard from '../DemoCard/DemoCard';

import './DemoList.scss';

interface DemoListProps {
	title: string;
	demos: Demo[];
}

const DemoList = ({ title, demos }: DemoListProps): ReactElement => {
	return (
		<div className="demo-list">
			<h2>{title}</h2>

			<div className="demos">
				{demos.map((demo) => (
					<DemoCard key={demo.filename} demo={demo} />
				))}
			</div>
		</div>
	);
};

export default DemoList;
