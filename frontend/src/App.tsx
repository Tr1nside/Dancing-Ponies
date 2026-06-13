import { useEffect } from "react";

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                ready: () => void;
                expand: () => void;
                themeParams?: Record<string, string>;
            };
        };
    }
}


export default function App() {
    const tg = window.Telegram?.WebApp;

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        tg?.ready();
        tg?.expand();

    }, [tg]);

    const bgColor = tg?.themeParams?.bg_color ?? "#f4f4f5";
    const textColor = tg?.themeParams?.text_color ?? "#111111";
    const buttonColor = tg?.themeParams?.button_color ?? "#2aabee";
    const buttonTextColor = tg?.themeParams?.button_text_color ?? "#ffffff";
    const secondaryBg = tg?.themeParams?.secondary_bg_color ?? "#ffffff";

    return (
        <main className="page" style={{ background: bgColor, color: textColor }}>
            <section className="card" style={{ background: secondaryBg }}>
                <span className="badge">Telegram Mini App</span>
                <h1>Простая статическая страница</h1>
                <p>React, TypeScript и чуть БДСМ.</p>
                <button
                    className="button"
                    style={{ background: buttonColor, color: buttonTextColor }}
                >
                    Открыть далее
                </button>
            </section>
        </main>
    );
}
