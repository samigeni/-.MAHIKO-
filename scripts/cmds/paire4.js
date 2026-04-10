const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function getApiBase() {
  try {
    const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const res = await axios.get(GITHUB_RAW);
    return res.data.apiv1;
  } catch (e) {
    console.error("Erreur de récupération GitHub raw :", e.message);
    return null;
  }
}

async function toFont(text, id = 21) {
  try {
    const apiBase = await getApiBase();
    if (!apiBase) return text;
    const apiUrl = `${apiBase}/api/font?id=${id}&text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);
    return data.output || text;
  } catch (e) {
    console.error("Erreur API de police :", e.message);
    return text;
  }
}

module.exports = {
  config: {
    name: "pair4",
    aliases: ["lovepair4", "match4"],
    author: "Xavier",
    version: "2.0",
    role: 0,
    category: "love",
    shortDescription: { 
      en: "💘 Génère un match amoureux entre toi et un autre membre du groupe" 
    },
    longDescription: { 
      en: "Cette commande calcule un match amoureux basé sur le genre. Affiche les avatars, le fond et le pourcentage d'amour." 
    },
    guide: { 
      en: "{p}{n} — Utilise cette commande dans un groupe pour trouver un match amoureux" 
    }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderData = await usersData.get(event.senderID);
      let senderName = senderData.name;

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const myData = users.find(user => user.id === event.senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage("⚠️ Impossible de déterminer ton genre. Réessaie plus tard.", event.threadID, event.messageID);
      }

      const myGender = myData.gender.toUpperCase();
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== event.senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== event.senderID);
      } else {
        return api.sendMessage("⚠️ Ton genre est indéfini. Impossible de trouver un match.", event.threadID, event.messageID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage("❌ Aucun match compatible trouvé dans ce groupe.", event.threadID, event.messageID);
      }

      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      let matchName = selectedMatch.name;

      senderName = await toFont(senderName, 21);
      matchName = await toFont(matchName, 21);

      const avatar1 = `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2 = `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const apiBase = await getApiBase();
      if (!apiBase) {
        return api.sendMessage("❌ Impossible d’accéder à l’API. Réessaie plus tard.", event.threadID, event.messageID);
      }

      const apiUrl = `${apiBase}/api/pair4?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}`;
      const outputPath = path.join(__dirname, "pair_output.png");

      const imageRes = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(outputPath, Buffer.from(imageRes.data, "binary"));

      const lovePercent = Math.floor(Math.random() * 31) + 70;

      const message = `💞 𝗠𝗮𝘁𝗰𝗵 𝗮𝗺𝗼𝘂𝗿𝗲𝘂𝘀 𝗳𝗶𝗻𝗮𝗹𝗶𝘀𝗲́ 💞

🎀  ${senderName} ✨️  
🎀  ${matchName} ✨️  

🕊️ 𝓛𝓮 𝓭𝓮𝓼𝓽𝓲𝓷 𝓪 𝓾𝓷𝓲 𝓿𝓸𝓼 𝓷𝓸𝓶𝓼 🌹  
𝓠𝓾𝓮 𝓿𝓸𝓼 𝓵𝓲𝓮𝓷𝓼 𝓭𝓾𝓻𝓮𝓷𝓽 𝓮𝓽𝓮𝓻𝓷𝓮𝓵𝓵𝓮𝓶𝓮𝓷𝓽 ✨️  

💘 𝙽𝚒𝚟𝚎𝚊𝚞 𝚍𝚎 𝚌𝚘𝚖𝚙𝚊𝚝𝚒𝚋𝚒𝚕𝚒𝚝𝚎́ : ${lovePercent}% 💘`;

      api.sendMessage(
        { body: message, attachment: fs.createReadStream(outputPath) },
        event.threadID,
        () => fs.unlinkSync(outputPath),
        event.messageID
      );

    } catch (error) {
      api.sendMessage("❌ Une erreur s’est produite lors de la recherche d’un match. Réessaie plus tard.", event.threadID, event.messageID);
    }
  }
};
