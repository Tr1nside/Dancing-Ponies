import axios from "axios";

const initDataRaw =
	window.Telegram?.WebApp?.initData || import.meta.env.VITE_DEV_INIT_DATA || "";

const client = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	// headers: {
	// 	"x-init-data": initDataRaw,
	// },
});

client.interceptors.request.use((config) => {
	const initData =
		window.Telegram?.WebApp?.initData ||
		import.meta.env.VITE_DEV_INIT_DATA ||
		"";
	console.log("Sending initData:", initData.substring(0, 30));
	config.headers["x-init-data"] = initData;
	return config;
});

export default client;
