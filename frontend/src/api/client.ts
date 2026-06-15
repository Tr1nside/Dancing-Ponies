import axios from "axios";

// const initDataRaw =
// 	window.Telegram?.WebApp?.initData || import.meta.env.VITE_DEV_INIT_DATA || "";

const client = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	// headers: {
	// 	"x-init-data": initDataRaw,
	// },
});

client.interceptors.request.use((config) => {
	console.log("WebApp object:", window.Telegram?.WebApp);
	console.log("initData:", window.Telegram?.WebApp?.initData);

	const initData =
		window.Telegram?.WebApp?.initData ||
		import.meta.env.VITE_DEV_INIT_DATA ||
		"";
	config.headers["x-init-data"] = initData;
	return config;
});

export default client;
