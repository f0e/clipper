import React, { ReactElement } from 'react';
import { Button, CircularProgress } from '@mui/material';

import './LoadingButton.scss';

interface LoadingButtonProps {
	onClick?: () => void;
	label: string;
	style?: Record<string, unknown>;
	loading?: boolean;
	fullWidth?: boolean;
	variant?: 'text' | 'outlined' | 'contained';
	color?:
		| 'inherit'
		| 'primary'
		| 'secondary'
		| 'success'
		| 'error'
		| 'info'
		| 'warning';
	className?: string;
}

const LoadingButton = ({
	onClick,
	label,
	style,
	loading,
	fullWidth,
	className,
	variant = 'contained',
	color = 'primary',
}: LoadingButtonProps): ReactElement => {
	return (
		<div className={`loading-button ${loading ? 'loading' : ''} ${className}`}>
			<Button
				type="submit"
				variant={variant}
				color={color}
				fullWidth={fullWidth}
				onClick={onClick}
				disabled={loading}
				style={{ ...style, height: 35 }}
			>
				<span className="spinner">
					<CircularProgress
						className="loader"
						style={{ color: 'white' }}
						size={24}
					/>
				</span>
				<span className="label">{label}</span>
			</Button>
		</div>
	);
};

export default LoadingButton;
