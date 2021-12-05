import React, { ReactElement, useContext, useEffect, useState } from 'react';
import IConfig from '../../../../types/config.types';
import Loader from '../../components/Loader/Loader';
import ApiContext from '../../context/ApiContext';

const Settings = (): ReactElement => {
	const [config, setConfig] = useState<IConfig | null>(null);
	const [loadingConfig, setLoadingConfig] = useState(true);

	const Api = useContext(ApiContext);

	const getConfig = async () => {
		setLoadingConfig(true);

		const newConfig = await Api.get('/get-config');
		setConfig(newConfig);

		setLoadingConfig(false);
	};

	useEffect(() => {
		getConfig();
	}, []);

	if (loadingConfig) return <Loader message="Loading config..." />;

	return (
		<div>
			<h1>Settings</h1>
		</div>
	);
};

export default Settings;
