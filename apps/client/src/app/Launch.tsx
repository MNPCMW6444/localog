// Launch.tsx
import React from 'react';
import { launchStore } from './store';

export const Launch = () => {
  const launch = useStore();

  if (!launch) return <p className="text-gray-400">Waiting for data...</p>;

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
      <h2 className="text-2xl font-semibold mb-4">{launch.mission_name}</h2>
      <p className="text-lg mb-2">
        <span className="font-bold">Date:</span>{' '}
        {new Date(launch.launch_date_utc).toLocaleString()}
      </p>
      <p className="text-lg">
        <span className="font-bold">Rocket:</span> {launch.rocket.rocket_name}
      </p>
    </div>
  );
};

function useStore() {
  const subscribe = React.useCallback(launchStore.subscribe, []);
  const getSnapshot = React.useCallback(launchStore.get, []);
  return React.useSyncExternalStore(subscribe, getSnapshot);
}
