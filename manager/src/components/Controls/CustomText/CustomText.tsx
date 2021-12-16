import { Input } from '@mui/material';
import CustomControl from '../CustomControl';
import ControlContainer from '../ControlContainer/ControlContainer';

interface CustomTextProps extends CustomControl {}

export default function CustomText({
	settings,
	changeSetting,
	section,
	variable,
	label,
}: CustomTextProps) {
	const value = settings[section][variable];

	return (
		<ControlContainer className="blur-text" margin="1rem">
			<div>{label}</div>

			<Input
				value={value}
				onChange={(e) => changeSetting(section, variable, e.target.value)}
				size="small"
				style={{ width: '100%' }}
			/>
		</ControlContainer>
	);
}
