import React, {
	createContext,
	Dispatch,
	FunctionComponent,
	SetStateAction,
	useState,
} from 'react';
import { AlertColor } from '@mui/material';

export interface Message {
	message: string;
	type: AlertColor;
}

export interface MessageContextInterface {
	setMessage: (message: Message | null) => void;
	message?: Message | null;
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

const MessageContext = createContext({} as MessageContextInterface);

export const MessageStore: FunctionComponent = ({ children }) => {
	const [message, _setMessage] = useState<Message | null>();
	const [open, setOpen] = useState(false);

	const setMessage = (message: Message | null): void => {
		_setMessage(message);
		setOpen(true);
	};

	return (
		<MessageContext.Provider
			value={{ message: message, setMessage, open, setOpen }}
		>
			{children}
		</MessageContext.Provider>
	);
};

export default MessageContext;
