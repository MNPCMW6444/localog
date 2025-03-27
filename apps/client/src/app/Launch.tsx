/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { launchStore } from './store';

export const Launch = () => {
  const value = useStore();
  const [tick, setTick] = React.useState(0);

  // 🔁 Force re-render every .2 second
  React.useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(interval);
  }, []);

  if (!value) return <p css={styles.placeholder}>Waiting for data...</p>;

  const { data, timestamp } = value;
  const now = Date.now();
  const ageSec = (now - timestamp) / 1000;

  if (ageSec > 9) return <p css={styles.placeholder}>empty</p>;

  const freshnessStyle = getFreshnessStyle(ageSec);

  return (
    <div css={styles.card}>
      <h2 css={styles.title}>{data.mission_name}</h2>
      <p css={styles.text}>
        <strong>Date:</strong> {new Date(data.launch_date_utc).toLocaleString()}
      </p>
      <p css={styles.text}>
        <strong>Rocket:</strong> {data.rocket.rocket_name}
      </p>
      <p css={[styles.freshness, freshnessStyle]}>
        freshness: {ageSec.toFixed(1)}s
      </p>
    </div>
  );
};

function getFreshnessStyle(age: number) {
  if (age > 6) {
    return css`color: #f87171;`; // red
  } else if (age > 3) {
    return css`color: #facc15;`; // yellow-orange
  } else {
    return css`color: #4ade80;`; // green
  }
}

const styles = {
  card: css`
    background: #1f2937;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 28rem;
    text-align: center;
    margin-bottom: 1rem;
  `,
  title: css`
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: white;
  `,
  text: css`
    color: #d1d5db;
    margin-bottom: 0.5rem;
  `,
  freshness: css`
    font-family: monospace;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  `,
  placeholder: css`
    color: #9ca3af;
    font-size: 1rem;
    margin-top: 2rem;
  `,
};

function useStore() {
  const subscribe = React.useCallback(launchStore.subscribe, []);
  const getSnapshot = React.useCallback(launchStore.get, []);
  return React.useSyncExternalStore(subscribe, getSnapshot);
}
