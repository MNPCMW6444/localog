import { launchStore } from './store';

const API_URL = 'https://spacex-production.up.railway.app/';

const LAUNCH_QUERY = `
  query ($offset: Int!) {
    launchesPast(limit: 1, offset: $offset) {
      mission_name
      launch_date_utc
      rocket {
        rocket_name
      }
    }
  }
`;


export function startPolling() {
  const poll = () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000); // 10s timeout

   
    
    const randomOffset = Math.floor(Math.random() * 150); // try 150-200 depending on how many launches you want to cover

fetch(API_URL, {
  method: 'POST',
  signal: controller.signal,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: LAUNCH_QUERY,
    variables: {
      offset: randomOffset,
    },
  }),
})
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data?.launchesPast?.[0];
        if (data) {
          launchStore.set(data);
        }
      })
      .catch((err) => {
        console.warn(
          err.name === 'AbortError'
            ? '[TIMEOUT] Request took too long'
            : `[ERROR] ${err.message}`
        );
      });
  };

  // fire immediately
  poll();

  // fire every 2s, no matter what
  setInterval(() => {
    poll();
  }, 2000);
}
