import { Switch } from '@mui/material';
import CustomControl from '../CustomControl';
import ControlContainer from '../ControlContainer/ControlContainer';

interface CustomSwitchProps extends CustomControl {}

export default function CustomSwitch({
	settings,
	changeSetting,
	section,
	variable,
	label,
}: CustomSwitchProps) {
	const value = settings[section][variable];

	return (
		<ControlContainer className="blur-select">
			<div>{label}</div>

			<Switch
				checked={value}
				onChange={(_e, checked) => changeSetting(section, variable, checked)}
			/>
		</ControlContainer>
	);
}
