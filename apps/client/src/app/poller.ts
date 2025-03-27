import { launchStore } from './store';
import {toast} from "react-toastify"

const API_URL = 'https://localog-tyk.onrender.com/graphql/';



function showToast(message: string) {
  toast.error(message);
}


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
    const randomOffset = Math.floor(Math.random() * 150);
    const timestamp = Date.now(); // mark request time

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);

    fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: LAUNCH_QUERY,
        variables: { offset: randomOffset },
      }),
    })
      .then((res) => {
        if (!res.ok) {
          showToast(`🔥 ${res.status} ${res.statusText}`);
          return;
        }
        return res.json();
      })
      .then((json) => {
        const data = json?.data?.launchesPast?.[0];
        if (data) {
          launchStore.set({ data, timestamp });
        }
      })
      .catch((err: any) => {
        if (err.name === 'AbortError') {
          showToast('⏱️ Request timed out!');
        } else {
          showToast(`❌ ${err.message}`);
        }
      });
    
  };

  poll();
  setInterval(poll, 2000);
}
