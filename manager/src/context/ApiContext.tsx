import React, { createContext, FunctionComponent, useContext } from 'react';
import axios from 'axios';
import MessageContext from './MessageContext';

type ApiCallParameters = {
	[key: string]: any;
};

export interface ApiContextInterface {
	get: (url: string, parameters?: ApiCallParameters) => Promise<any>;
	post: (url: string, body?: ApiCallParameters) => Promise<any>;
}

const ApiContext = createContext({} as ApiContextInterface);

export const ApiStore: FunctionComponent = ({ children }) => {
	const { setMessage } = useContext(MessageContext);

	const get = async (
		url: string,
		parameters?: ApiCallParameters
	): Promise<any> => {
		try {
			const res = await axios.get(url, {
				params: parameters,
			});

			return res.data;
		} catch (e: any) {
			const error = e.response?.data?.message;

			setMessage({
				type: 'error',
				message:
					error || 'An unexpected error has occurred, please try again later',
			});

			throw error;
		}
	};

	const post = async (
		url: string,
		parameters?: ApiCallParameters
	): Promise<any> => {
		try {
			const res = await axios.post(url, parameters);

			return res.data.data;
		} catch (e: any) {
			const error = e.response?.data?.message;

			setMessage({
				type: 'error',
				message:
					error || 'An unexpected error has occurred, please try again later',
			});

			throw error;
		}
	};

	return (
		<ApiContext.Provider value={{ get, post }}>{children}</ApiContext.Provider>
	);
};

export default ApiContext;
