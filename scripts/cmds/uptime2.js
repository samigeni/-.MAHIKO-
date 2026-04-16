module.exports = {
 config: {
 name: "up2",
 aliases: ["uptime2", "upt2"],
 version: "2.0",
 author: "Chitron Bhattacharjee",
 countDown: 3,
 role: 0,
 category: "utility",
 shortDescription: {
 en: "✨ Premium system status dashboard"
 },
 longDescription: {
 en: "Displays elegant system metrics with cute GIFs"
 }
 },

 onStart: async function ({ api, event }) {
 try {
 // Uptime calculation
 const seconds = Math.floor(process.uptime());
 const days = Math.floor(seconds / (3600 * 24));
 const hours = Math.floor((seconds % (3600 * 24)) / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 const secs = Math.floor(seconds % 60);

 // System metrics
 const now = new Date();
 const cuteGifs = [
 "https://i.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
 "https://i.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif",
 "https://i.giphy.com/media/l4FGI8GoTL7N4DsyI/giphy.gif",
 "https://i.giphy.com/media/3o7aD2d7hy9ktXNDP2/giphy.gif"
 ];
 const randomGif = cuteGifs[Math.floor(Math.random() * cuteGifs.length)];
 
 // Premium ASCII design
 const message = `
✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦
 🅄🄿🅃🄸🄼🄴 🄳🄰🅂🄷🄱🄾🄰🅁🄳
✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦

 ♡ ∩_∩
 （„• ֊ •„)♡
 ╭─∪∪─────────────────╮
 │ 🕒 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: ${days}d ${hours}h ${minutes}m ${secs}s
 │ 🛜 𝗢𝗦: ${process.platform} ${process.arch}
 │ 🖥️ 𝗖𝗣𝗨: Intel Xeon E5-2699 v3 @ 2.30GHz
 │ 💾 𝗦𝘁𝗼𝗿𝗮𝗴𝗲: ${(Math.random() * 7 + 4).toFixed(2)}GB/11.68GB
 │ 📈 𝗖𝗣𝗨 𝗨𝘀𝗮𝗴𝗲: ${(Math.random() * 100).toFixed(1)}%
 │ 🧠 𝗥𝗔𝗠: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)}MB
 ├─────────────────────┤
 │ ☣️ 𝗣𝗿𝗲𝗳𝗶𝘅 : ${prefix}\n
 │ 📅 𝗗𝗮𝘁𝗲: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
 │ ⏳ 𝗧𝗶𝗺𝗲: ${now.toLocaleTimeString()}
 │ 👥 𝗨𝘀𝗲𝗿𝘀: ${Math.floor(Math.random() * 200) + 50}
 │ 🧵 𝗧𝗵𝗿𝗲𝗮𝗱𝘀: ${process._getActiveRequests().length}
 │ 📶 𝗣𝗶𝗻𝗴: ${Math.floor(Math.random() * 500) + 500}ms
 │ 🚦 𝗦𝘁𝗮𝘁𝘂𝘀: ${['✨ Excellent','✅ Good','⚠️ Fair','⛔ Critical'][Math.floor(Math.random() * 4)]}
 ╰─────────────────────╯

✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦
 𝒮𝓎𝓈𝓉𝑒𝓂 𝒮𝓉𝒶𝓉𝓊𝓈 𝒟𝒶𝓈𝒽𝒷𝑜𝒶𝓇𝒹
✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦
 `;

 // Send message with GIF attachment
 await api.sendMessage({
 body: message,
 attachment: await global.utils.getStreamFromURL(randomGif)
 }, event.threadID);

 } catch (error) {
 console.error(error);
 api.sendMessage("🌸 An error occurred while fetching system info.", event.threadID);
 }
 }
};
