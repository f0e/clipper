export enum ERecordingError {
	RECORD_ALREADY_RECORDING,
	RECORD_WAIT_FOR_ROUND_OVER,
	RECORD_RECORDING_DIFFERENT_DEMO,
	RECORD_IN_DEMO,

	STOP_NOT_RECORDING,
	STOP_STOPPING_AT_END_ROUND,
}

export class IRecordingError extends Error {
	code: ERecordingError;

	constructor(code: ERecordingError) {
		super(code.toString());
		this.code = code;
	}
}
