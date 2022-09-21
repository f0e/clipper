import { Alert } from '@mui/material';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import IConfig from '../../../../types/config.types';
import CustomSelect from '../../components/Controls/CustomSelect/CustomSelect';
import CustomSwitch from '../../components/Controls/CustomSwitch/CustomSwitch';
import CustomText from '../../components/Controls/CustomText/CustomText';
import Loader from '../../components/Loader/Loader';
import LoadingButton from '../../components/LoadingButton/LoadingButton';
import ApiContext from '../../context/ApiContext';
import MessageContext from '../../context/MessageContext';

import './Settings.scss';

// badbadbad todo: FIX THIS AND JUST USE config.types please
export enum EClipMode {
	clipper = 'clipper',
	archiver = 'archiver',
}

const Settings = (): ReactElement => {
	const [config, setConfig] = useState<IConfig | null>(null);
	const [error, setError] = useState(false);
	const [loadingConfig, setLoadingConfig] = useState(true);
	const [savingConfig, setSavingConfig] = useState(false);
	const [csgoPathError, setCsgoPathError] = useState(null);

	const Api = useContext(ApiContext);
	const { setMessage } = useContext(MessageContext);

	const getConfig = async () => {
		setLoadingConfig(true);

		try {
			const newConfig = await Api.get('/get-config');
			console.log('got config:', newConfig);
			setConfig(newConfig);
		} catch (e) {
			setError(true);
		}

		setLoadingConfig(false);
	};

	const saveConfig = async () => {
		setSavingConfig(true);

		try {
			await Api.post('/save-config', {
				config,
			});
		} catch (e) {}

		setMessage({
			type: 'success',
			message: 'Successfully saved config',
		});

		setSavingConfig(false);
	};

	const changeSetting = (section: string, key: string, value: any) => {
		setConfig((curConfig) => {
			const newConfig: any = { ...curConfig }; // todo: i hate all this
			newConfig[section][key] = value;
			return newConfig;
		});
	};

	const checkCsgoPath = async (path: string) => {
		const csgoPathValid = await Api.get('/csgo-path-valid', {
			path,
		});

		if (csgoPathValid.valid) {
			setCsgoPathError(null);
		} else {
			setCsgoPathError(csgoPathValid.error);
		}
	};

	useEffect(() => {
		getConfig();
	}, []);

	useEffect(() => {
		if (config) checkCsgoPath(config.paths.csgo);
	}, [config?.paths.csgo]);

	return (
		<main className="settings-page">
			<h1>Settings</h1>

			{loadingConfig ? (
				<Loader message="Loading config..." />
			) : error ? (
				<h2>Failed to load config.</h2>
			) : (
				<>
					<h3>main</h3>
					<CustomSelect
						settings={config}
						changeSetting={changeSetting}
						section="main"
						variable="clip_mode"
						label={'Clip mode'}
						options={EClipMode}
					/>
					<div className="setting-description">
						<p>
							<b>clipper:</b> Will record each round to a temporary demo, and if
							clipped will save the demo as a clip. Otherwise, the demo is
							discarded.
						</p>
						<p>
							<b>archiver:</b> Will record every match automatically, and
							doesn't require a trigger.
						</p>
					</div>

					<br />

					<h3>Clipper</h3>
					<CustomSwitch
						settings={config}
						changeSetting={changeSetting}
						section="clipper"
						variable="clip_at_round_end"
						label={'Clip at round end'}
					/>
					<div className="setting-description">
						Immediately stop recording clips as soon as the round ends. This
						will prevent the next round from also being recorded, but will cut
						off the extra period of time between winning a round and the start
						of the next round.
					</div>

					<br />

					<h3>Paths</h3>
					<CustomText
						settings={config}
						changeSetting={async (section: string, key: string, value: any) => {
							console.log('changed csgo path');
							changeSetting(section, key, value);
						}}
						section="paths"
						variable="csgo"
						label={'CS:GO'}
					/>
					<div className="setting-description">
						Your CSGO install path (where csgo.exe is located)
					</div>

					{csgoPathError && (
						<Alert severity="error" style={{ marginBottom: '0.5rem' }}>
							{csgoPathError}
						</Alert>
					)}

					<CustomText
						settings={config}
						changeSetting={changeSetting}
						section="paths"
						variable="base"
						label={'base'}
					/>
					<div className="setting-description">
						The subfolder inside csgo/ to store clipper-related files in
					</div>

					<CustomText
						settings={config}
						changeSetting={changeSetting}
						section="paths"
						variable="clipper"
						label={'clipper'}
					/>
					<div className="setting-description">
						The subfolder inside csgo/{'{'}base{'}'} to store clips in
					</div>

					<CustomText
						settings={config}
						changeSetting={changeSetting}
						section="paths"
						variable="archiver"
						label={'archiver'}
					/>
					<div className="setting-description">
						The subfolder inside csgo/{'{'}base{'}'} to store archives in
					</div>

					<CustomText
						settings={config}
						changeSetting={changeSetting}
						section="paths"
						variable="demo_info"
						label={'demo_info'}
					/>
					<div className="setting-description">
						The subfolder inside csgo/{'{'}base{'}'} to store demo information
						in
					</div>

					<br />

					<h3>Ports</h3>
					<CustomText
						settings={config}
						changeSetting={changeSetting}
						section="ports"
						variable="gamestate"
						label={'gamestate'}
					/>

					<CustomText
						settings={config}
						changeSetting={changeSetting}
						section="ports"
						variable="netcon"
						label={'netcon'}
					/>

					<br />

					<LoadingButton
						onClick={saveConfig}
						loading={savingConfig}
						label="Save"
					/>
				</>
			)}
		</main>
	);
};

export default Settings;
