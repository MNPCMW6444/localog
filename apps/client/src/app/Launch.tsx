import React from 'react';
import { launchStore } from './store';

export const Launch = () => {
  const value = useStore();
  const [tick, setTick] = React.useState(0);

  // 🔁 Force re-render every .1 second
  React.useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  if (!value) return <p style={{ color: '#9ca3af' }}>Waiting for data...</p>;

  const { data, timestamp } = value;
  const now = Date.now();
  const ageSec = (now - timestamp) / 1000;

  if (ageSec > 9) return <p style={{ color: '#6b7280' }}>empty</p>;

  // 🧠 Inline color logic
  let freshnessColor = '#4ade80'; // green
  if (ageSec > 6) freshnessColor = '#f87171'; // red
  else if (ageSec > 3) freshnessColor = '#facc15'; // yellow-orange

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>{data.mission_name}</h2>
      <p style={styles.text}>
        <strong>Date:</strong> {new Date(data.launch_date_utc).toLocaleString()}
      </p>
      <p style={styles.text}>
        <strong>Rocket:</strong> {data.rocket.rocket_name}
      </p>
      <p style={{ ...styles.freshness, color: freshnessColor }}>
        freshness: {ageSec.toFixed(1)}s
      </p>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#1f2937',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '28rem',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: 'white',
  },
  text: {
    color: '#d1d5db',
    marginBottom: '0.5rem',
  },
  freshness: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  },
};

function useStore() {
  const subscribe = React.useCallback(launchStore.subscribe, []);
  const getSnapshot = React.useCallback(launchStore.get, []);
  return React.useSyncExternalStore(subscribe, getSnapshot);
}
