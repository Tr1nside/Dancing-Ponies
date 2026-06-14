import axios from "axios";

const initDataRaw =
    window.Telegram?.WebApp?.initData ||
    import.meta.env.VITE_DEV_INIT_DATA ||
    "";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "x-init-data": initDataRaw,
    },
});

export default client;
