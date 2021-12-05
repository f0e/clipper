import { CircularProgress } from '@mui/material';
import React, { ReactElement } from 'react';

import './Loader.scss';

interface LoaderProps {
	message: string;
}

const Loader = ({ message }: LoaderProps): ReactElement => {
	return (
		<div className="loader">
			<CircularProgress color="secondary" />
			<span>{message}</span>
		</div>
	);
};

export default Loader;
