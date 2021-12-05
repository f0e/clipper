export default interface CustomControl {
	settings: any;
	changeSetting: (section: string, key: string, value: any) => void;
	section: string;
	variable: string;
	label: string;
}
