export function detectChanges(
	oldObj: any,
	newObj: any,
	onChange: (oldValue: any, newValue: any, modifiedKey: string[]) => void,
	keyHistory: string[] = []
) {
	for (const key of Object.keys(oldObj)) {
		const newKeyHistory = keyHistory.concat(key);

		if (typeof oldObj[key] == 'object') {
			detectChanges(oldObj[key], newObj[key], onChange, newKeyHistory);
		} else if (!(key in newObj) || oldObj[key] != newObj[key]) {
			onChange(oldObj[key], newObj[key], newKeyHistory);
		}
	}
}

export function copyWithoutExtras(newObj: any, target: any) {
	for (const key of Object.keys(target)) {
		if (typeof target[key] == 'object') {
			copyWithoutExtras(newObj[key], target[key]);
		} else if (target[key] != newObj[key]) {
			target[key] = newObj[key];
		}
	}
}
