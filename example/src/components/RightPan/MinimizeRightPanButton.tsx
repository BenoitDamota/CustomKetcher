import styles from './MinimizeButton.module.css';

interface Props {
  minimizeRightPan: () => void;
}

const MinimizeButton: React.FC<Props> = ({ minimizeRightPan }) => {
  return (
    <>
      <button className={styles.minimize_btn} onClick={minimizeRightPan}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 28"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Minimize</title>
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="
    M3 3
    h18
    a2 2 0 0 1 2 2
    v18
    a2 2 0 0 1-2 2
    H3
    a2 2 0 0 1-2-2
    V5
    a2 2 0 0 1 2-2
    z

    M7 13
    h10
    v2
    H7
    z
  "
          />
        </svg>
      </button>
    </>
  );
};

export default MinimizeButton;
