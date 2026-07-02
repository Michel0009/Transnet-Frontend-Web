import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export const initEcho = (token) => {
  if (window.Echo) {
    window.Echo.disconnect();
  }

  window.Echo = new Echo({
    broadcaster: "pusher",
    key: process.env.REACT_APP_PUSHER_APP_KEY,
    cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
    forceTLS: false,
    authEndpoint: `${process.env.REACT_APP_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  window.Echo.connector.pusher.connection.bind("state_change", (states) => {
    console.log("Pusher state:", states.previous, "→", states.current);
  });
};
