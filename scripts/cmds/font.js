const axios = require("axios");

module.exports = {
  config: {
    name: "font",
    aliases: ["fonts", "style"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "tools",
    shortDescription: "Convertir du texte en polices stylées via API",
    longDescription: "Utilisez /font <id> <texte> ou /font list",
    guide: "{pn} list | {pn} 16 Christus"
  },

  onStart: async function ({ message, event, api, threadPrefix }) {
    try {
      const prefix = threadPrefix || "/font";
      const body = event.body || "";
      const args = body.split(" ").slice(1);

      if (!args.length) {
        return api.sendMessage(
          `❌ Utilisation invalide !\nUtilisez ${prefix} list pour voir les polices disponibles\nou ${prefix} [numéro] [texte] pour convertir`,
          event.threadID,
          event.messageID
        );
      }

      if (args[0].toLowerCase() === "list") {
        const preview = `✨ 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐅𝐨𝐧𝐭 𝐒𝐭𝐲𝐥𝐞𝐬 ✨
━━━━━━━━━━━━━━━━━━━━☆
1 ⟶ C̆̈h̆̈r̆̈ĭ̈s̆̈t̆̈ŭ̈s̆̈
2 ⟶ C̷h̷r̷i̷s̷t̷u̷s̷
3 ⟶ 𝗖𝗵'𝗿 𝗖𝗵𝗿𝗶𝘀𝘁𝘂𝘀
4 ⟶ 𝘊𝘩'𝘳 𝘊𝘩𝘳𝘪𝘴𝘵𝘶𝘀
5 ⟶ [C][h]'[r] [i][s][t][u][s]
6 ⟶ 𝕮𝖍'𝖗 𝕮𝖍𝖗𝖎𝖘𝖙𝖚𝖘
7 ⟶ Ｃh'ｒ Ｃｈｒｉｓｔｕｓ
8 ⟶ ᴄʰ'ʳ ᶜʰʳⁱˢᵗᵘˢ
9 ⟶ ǝɥ'ɹ sʇᴉɹɔʇns
10 ⟶ 🄲🄷'🅁 🄲🄷🅁🄸🅂🅃🅄🅂
11 ⟶ 🅲🅷'🆁 🅲🅷🆁🅸🆂🆃🆄🆂
12 ⟶ 𝐶𝒽'𝓇 𝒞𝒽𝓇𝒾𝓈𝓉𝓊𝓈
13 ⟶ Ⓒⓗ'ⓡ Ⓒⓗⓡⓘⓢⓣⓤⓢ
14 ⟶ 🅒🅗'🅡 🅒🅗🅡🅘🅢🅣🅤🅢
15 ⟶ 𝙲𝚑'𝚛 𝙲𝚑𝚛𝚒𝚜𝚝𝚞𝚜
16 ⟶ 𝐂𝐡'𝐫 𝐂𝐡𝐫𝐢𝐬𝐭𝐮𝐬
17 ⟶ 𝔠𝔥'𝔯 𝔠𝔥𝔯𝔦𝔰𝔱𝔲𝔰
18 ⟶ 𝓒𝓱'𝓻 𝓒𝓱𝓻𝓲𝓼𝓽𝓾𝓼
19 ⟶ 𝙲𝚑'𝚛 𝙲𝚑𝚛𝚒𝚜𝚝𝚞𝚜
20 ⟶ ᴄʜ'ʳ ꜱʜɪꜱᴛᴜꜱ
21 ⟶ 𝐶ʰ'ʳ 𝑪𝒉𝒓𝒊𝒔𝒕𝒖𝒔
22 ⟶ 𝑪𝒉'𝒓 𝑪𝒉𝒓𝒊𝒔𝒕𝒖𝒔
23 ⟶ 𝔠𝔥'𝔯 𝔠𝔥𝔯𝔦𝔰𝔱𝔲𝔰
24 ⟶ ꫀ᭙'᥅ ᦓꪖ꠸ꪑ
25 ⟶ єʜ'я ѕнισтυѕ
26 ⟶ ᏋᏇ'Ꮢ ᏕᏗᎥᎷ
27 ⟶ 乇山'尺 丂卂丨爪
28 ⟶ ᘿᘺ'ᖇ Sᗩᓰᘻ
29 ⟶ ɛʜ'ʀ ֆʜɨʍ
30 ⟶ 𐌂Ꮤ'𐌓 𐌔𐌀𐌉𐌌
31 ⟶ ΣЩ’Я ƧΛIM
━━━━━━━━━━━━━━━━━━━━━☆`;
        return api.sendMessage(preview, event.threadID, event.messageID);
      }

      const id = args[0];
      const text = args.slice(1).join(" ");
      if (!text) return api.sendMessage(`❌ Utilisation invalide ! Fournissez un texte à convertir.`, event.threadID, event.messageID);

      const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/font?id=${id}&text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);

      if (response.data.output) {
        return api.sendMessage(response.data.output, event.threadID, event.messageID);
      } else {
        return api.sendMessage(`❌ Police ${id} non trouvée !`, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Une erreur est survenue ! Veuillez réessayer plus tard.", event.threadID, event.messageID);
    }
  }
};
