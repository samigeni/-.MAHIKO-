const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const supportedDomains = [
  "facebook.com", "fb.watch",
  "youtube.com", "youtu.be",
  "tiktok.com",
  "instagram.com", "instagr.am",
  "likee.com", "likee.video",
  "capcut.com",
  "spotify.com",
  "terabox.com",
  "twitter.com", "x.com",
  "drive.google.com",
  "soundcloud.com",
  "ndown.app",
  "pinterest.com", "pin.it"
];

module.exports = {
  config: {
    name: "autodl",
    version: "2.0",
    author: "Christus",
    role: 0,
    shortDescription: "Téléchargeur vidéo/média tout-en-un",
    longDescription:
      "Télécharge automatiquement des vidéos ou médias depuis Facebook, YouTube, TikTok, Instagram, Likee, CapCut, Spotify, Terabox, Twitter, Google Drive, SoundCloud, NDown, Pinterest et plus.",
    category: "utility",
    guide: { fr: "Envoyez simplement un lien média supporté (https://) pour le télécharger automatiquement." }
  },

  onStart: async function({ api, event }) {
    api.sendMessage(
      "📥 Envoyez un lien vidéo/média (https://) depuis n'importe quel site supporté (YouTube, Facebook, TikTok, Instagram, Likee, CapCut, Spotify, Terabox, Twitter, Google Drive, SoundCloud, NDown, Pinterest, etc.) pour le télécharger automatiquement.",
      event.threadID,
      event.messageID
    );
  },

  onChat: async function({ api, event }) {
    const content = event.body ? event.body.trim() : "";
    if (content.toLowerCase().startsWith("auto")) return;
    if (!content.startsWith("https://")) return;
    if (!supportedDomains.some(domain => content.includes(domain))) return;

    api.setMessageReaction("🎀", event.messageID, () => {}, true);

    try {
      const API = `https://xsaim8x-xxx-api.onrender.com/api/auto?url=${encodeURIComponent(content)}`;
      const res = await axios.get(API);

      if (!res.data) throw new Error("Pas de réponse de l'API");

      const mediaURL = res.data.high_quality || res.data.low_quality;
      const mediaTitle = res.data.title || "Titre inconnu";
      if (!mediaURL) throw new Error("Média introuvable");

      const extension = mediaURL.includes(".mp3") ? "mp3" : "mp4";
      const buffer = (await axios.get(mediaURL, { responseType: "arraybuffer" })).data;
      const filePath = path.join(__dirname, "cache", `auto_media_${Date.now()}.${extension}`);

      await fs.ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, Buffer.from(buffer));

      api.setMessageReaction("☣️", event.messageID, () => {}, true);
      
      const domain = supportedDomains.find(d => content.includes(d)) || "Plateforme inconnue";
      const platformName = domain.replace(/(\.com|\.app|\.video|\.net)/, "").toUpperCase();

      const infoMsg = 
`✅ Média téléchargé !
Titre     : ${mediaTitle}
Plateforme: ${platformName}
Statut    : Succès`;

      api.sendMessage(
        { body: infoMsg, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    } catch {
      api.setMessageReaction("❌️", event.messageID, () => {}, true);
    }
  }
};
