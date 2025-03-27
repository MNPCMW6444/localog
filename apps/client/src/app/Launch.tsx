import React from 'react';
import { launchStore } from './store';

export const Launch = () => {
  const value = useStore();
  const now = Date.now();

  if (!value) return <p className="text-gray-400">Waiting for data...</p>;

  const { data, timestamp } = value;
  const ageSec = (now - timestamp) / 1000;

  if (ageSec > 9) return <p className="text-gray-500">empty</p>;

  let freshnessColor = 'text-green-400';
  if (ageSec > 6) freshnessColor = 'text-red-400';
  else if (ageSec > 3) freshnessColor = 'text-orange-400';

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
      <h2 className="text-2xl font-semibold mb-4">{data.mission_name}</h2>
      <p className="text-sm mb-1">
        <span className="font-bold">Date:</span>{' '}
        {new Date(data.launch_date_utc).toLocaleString()}
      </p>
      <p className="text-sm mb-2">
        <span className="font-bold">Rocket:</span> {data.rocket.rocket_name}
      </p>
      <p className={`text-xs font-mono ${freshnessColor}`}>
        freshness: {ageSec.toFixed(1)}s
      </p>
    </div>
  );
};

function useStore() {
  const subscribe = React.useCallback(launchStore.subscribe, []);
  const getSnapshot = React.useCallback(launchStore.get, []);
  return React.useSyncExternalStore(subscribe, getSnapshot);
}
