import React, { ReactElement, useEffect, useRef } from 'react';

import './MapIcon.scss';

interface MapIconProps {
	map: string;
}

const MapIcon = ({ map }: MapIconProps): ReactElement => {
	const mapIconImage = useRef(null);

	const setIcon = () => {
		return new Promise((resolve, reject) => {
			if (!mapIconImage.current) return;
			const imageElement = mapIconImage.current as HTMLImageElement;

			const fakeImg = new Image();

			fakeImg.onload = () => {
				// image is valid, so set it
				imageElement.src = fakeImg.src;
			};

			fakeImg.onerror = () => {
				// image isn't valid, set the 'map not found' icon
				// todo: this
			};

			fakeImg.src = `map-icons/map_icon_${map}.png`;
		});
	};

	useEffect(() => {
		setIcon();
	}, []);

	return <img className="map-icon" ref={mapIconImage} />;
};

export default MapIcon;
