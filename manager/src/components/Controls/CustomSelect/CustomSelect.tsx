import { MenuItem, Select } from '@mui/material';
import CustomControl from '../CustomControl';
import ControlContainer from '../ControlContainer/ControlContainer';

interface CustomSelectProps extends CustomControl {
	options: any;
}

export default function CustomSelect({
	settings,
	changeSetting,
	section,
	variable,
	label,
	options,
}: CustomSelectProps) {
	const value = settings[section][variable];

	return (
		<ControlContainer className="blur-select" margin="0.3rem">
			<div>{label}</div>

			<Select
				value={value}
				onChange={(e) => changeSetting(section, variable, e.target.value)}
				size="small"
			>
				{Object.entries(options).map(([optionName, optionAlias]: any) => (
					<MenuItem key={optionName} value={optionName}>
						{optionAlias}
					</MenuItem>
				))}
			</Select>
		</ControlContainer>
	);
}
