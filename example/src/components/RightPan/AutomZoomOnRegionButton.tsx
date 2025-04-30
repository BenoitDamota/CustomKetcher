import React from 'react';

interface Props {
  autoZoomOnRegion: boolean;
  setAutoZoomOnRegion: React.Dispatch<React.SetStateAction<boolean>>;
}

const AutoZoomOnRegionButton: React.FC<Props> = ({
  autoZoomOnRegion,
  setAutoZoomOnRegion,
}) => {
  const handleOnClick = () => {
    setAutoZoomOnRegion((prev) => !prev);
  };

  return (
    <button
      title="Toggle Auto Zoom On Region"
      onClick={handleOnClick}
      className={`auto-zoom-in-region material-symbols-outlined ${
        !autoZoomOnRegion
          ? 'hover-primary'
          : 'color-primary hover-brightness-130'
      }`}
    >
      center_focus_strong
    </button>
  );
};

export default AutoZoomOnRegionButton;
