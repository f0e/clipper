import { Mark, Slider } from '@mui/material';
import AutosizeInput from 'react-input-autosize';
import CustomControl from '../CustomControl';
import ControlContainer from '../ControlContainer/ControlContainer';

import './CustomSlider.scss';

interface SliderProps extends CustomControl {
	min: number;
	max: number;
	step: number;
	marks?: Mark[];
	valuePrefix?: string;
}

export default function CustomSlider({
	settings,
	changeSetting,
	section,
	variable,
	label,
	min,
	max,
	step,
	marks,
	valuePrefix,
}: SliderProps) {
	const value = settings[section][variable];

	return (
		<ControlContainer className="blur-slider" margin="0.5rem">
			<div>
				{label}
				<br />
				{valuePrefix && (
					<span style={{ fontWeight: 'bold' }}>{valuePrefix}</span>
				)}
				<AutosizeInput
					inputClassName="label-value"
					type={Number(value) ? 'number' : 'text'}
					value={value}
					onChange={(e) => changeSetting(section, variable, e.target.value)}
				/>
			</div>

			<Slider
				value={value}
				min={min}
				max={max}
				step={step}
				marks={marks}
				onChange={(_e, value) => changeSetting(section, variable, value as any)}
			/>
		</ControlContainer>
	);
}
