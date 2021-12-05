import { validationResult } from 'express-validator';

const validate = (req: any): Record<string, any> => {
	const errors = validationResult(req);
	if (!errors.isEmpty())
		throw ['Failed to validate parameters', errors.array()];

	return req.method == 'GET' ? req.query : req.body;
};

export default validate;
