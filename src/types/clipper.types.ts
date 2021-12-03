export enum ERecordingError {
	ALREADY_RECORDING,
	WAIT_FOR_ROUND_OVER,
	RECORDING_DIFFERENT_DEMO,
}

export enum EStopRecordingError {
	NOT_RECORDING,
	STOP_AT_END_ROUND,
}

export class IRecordingError extends Error {
	code: ERecordingError | EStopRecordingError;

	constructor(code: ERecordingError | EStopRecordingError) {
		super(code.toString());
		this.code = code;
	}
}
