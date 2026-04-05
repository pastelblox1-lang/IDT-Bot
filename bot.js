const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require(“discord.js”);
const express = require(“express”);
const app = express();
app.use(express.json());

const CONFIG = {
TOKEN: process.env.DISCORD_TOKEN,
ROBLOX_SECRET: process.env.ROBLOX_SECRET || “IDT2025secreto”,
CANAL_VERIFICACAO_ID: process.env.CANAL_VERIFICACAO_ID,
CARGO_VERIFICADO_ID: process.env.CARGO_VERIFICADO_ID,
PORT: process.env.PORT || 3000,
};

const tokensPendentes = new Map();
const jogadoresVerificados = new Map();

const TORCIDAS = [
“Bamor”, “Cearamor”, “Furia Bicolor”, “Galoucura”,
“Camisa 12”, “Gavioes da Fiel”, “Geral do Gremio”,
“Independente”, “Jovem do Sport”, “Mafia Azul”,
“Terror Bicolor”, “Força Jovem Goias”, “Jovem Fla”,
“Força Jovem”, “Mancha Verde”, “Torcida Jovem”,
“Pavilhão 9”, “Guarda Popular”, “Império Alviverde”,
“Inferno Coral”, “Mancha Azul CSA”, “Fúria Jovem Botafogo”,
“Leões da TUF”, “Fanáticos”, “Remoçada”,
“Mancha Azul AVAI”, “Comando Alvi-Rubro”, “Raça Rubro”,
“Imbatíveis”, “Mafia Vermelha”, “Esquadrão Vila Novaense”,
“Garra Alvinegra”, “Young Flu”, “Gang da Ilha”,
];

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent,
],
});

client.once(“ready”, () => {
console.log(`✊ Bot IDT online como ${client.user.tag}`);
});

client.on(“messageCreate”, async (message) => {
if (message.author.bot) return;
if (!message.content.startsWith(”!verificar”)) return;

const partes = message.content.split(” “);
const token = partes[1];

if (!token) {
return message.reply({
embeds: [
new EmbedBuilder()
.setColor(0xff0000)
.setTitle(“❌ Token inválido”)
.setDescription(“Use: `!verificar SEU_TOKEN`\n\nO token aparece na tela do jogo quando você entra pela primeira vez.”),
],
});
}

if (!tokensPendentes.has(token)) {
return message.reply({
embeds: [
new EmbedBuilder()
.setColor(0xff0000)
.setTitle(“❌ Token não encontrado”)
.setDescription(“Token inválido ou expirado. Abra o jogo novamente para gerar um novo token.”),
],
});
}

const dadosToken = tokensPendentes.get(token);

if (Date.now() - dadosToken.timestamp > 30 * 60 * 1000) {
tokensPendentes.delete(token);
return message.reply({
embeds: [
new EmbedBuilder()
.setColor(0xff0000)
.setTitle(“⏰ Token expirado”)
.setDescription(“Seu token expirou. Abra o jogo novamente para gerar um novo.”),
],
});
}

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId(`form_${token}`)
.setLabel(“📋 Preencher Formulário”)
.setStyle(ButtonStyle.Primary)
);

await message.reply({
embeds: [
new EmbedBuilder()
.setColor(0xffffff)
.setTitle(“✅ Token válido!”)
.setDescription(`Olá <@${message.author.id}>!\n\nSeu token foi reconhecido. Clique no botão abaixo para preencher seu formulário e criar seu personagem no **Império das Torcidas**.`)
.setFooter({ text: “Império das Torcidas • IDT” }),
],
components: [row],
});
});

client.on(“interactionCreate”, async (interaction) => {
if (interaction.isButton() && interaction.customId.startsWith(“form_”)) {
const token = interaction.customId.replace(“form_”, “”);

```
if (!tokensPendentes.has(token)) {
  return interaction.reply({
    content: "❌ Token expirado. Abra o jogo novamente.",
    ephemeral: true,
  });
}

const modal = new ModalBuilder()
  .setCustomId(`submit_${token}`)
  .setTitle("Criar Personagem - IDT");

const nomeInput = new TextInputBuilder()
  .setCustomId("nome")
  .setLabel("Nome")
  .setStyle(TextInputStyle.Short)
  .setPlaceholder("Ex: João")
  .setMinLength(2)
  .setMaxLength(20)
  .setRequired(true);

const sobrenomeInput = new TextInputBuilder()
  .setCustomId("sobrenome")
  .setLabel("Sobrenome")
  .setStyle(TextInputStyle.Short)
  .setPlaceholder("Ex: Silva")
  .setMinLength(2)
  .setMaxLength(20)
  .setRequired(true);

const apelidoInput = new TextInputBuilder()
  .setCustomId("apelido")
  .setLabel("Apelido")
  .setStyle(TextInputStyle.Short)
  .setPlaceholder("Ex: Xerifão")
  .setMinLength(2)
  .setMaxLength(20)
  .setRequired(true);

const torcidaInput = new TextInputBuilder()
  .setCustomId("torcida")
  .setLabel("Torcida")
  .setStyle(TextInputStyle.Short)
  .setPlaceholder("Ex: Gavioes da Fiel, Mancha Verde...")
  .setMinLength(3)
  .setMaxLength(30)
  .setRequired(true);

modal.addComponents(
  new ActionRowBuilder().addComponents(nomeInput),
  new ActionRowBuilder().addComponents(sobrenomeInput),
  new ActionRowBuilder().addComponents(apelidoInput),
  new ActionRowBuilder().addComponents(torcidaInput),
);

await interaction.showModal(modal);
```

}

if (interaction.isModalSubmit() && interaction.customId.startsWith(“submit_”)) {
const token = interaction.customId.replace(“submit_”, “”);

```
if (!tokensPendentes.has(token)) {
  return interaction.reply({
    content: "❌ Token expirado. Abra o jogo novamente.",
    ephemeral: true,
  });
}

const nome = interaction.fields.getTextInputValue("nome").trim();
const sobrenome = interaction.fields.getTextInputValue("sobrenome").trim();
const apelido = interaction.fields.getTextInputValue("apelido").trim();
const torcida = interaction.fields.getTextInputValue("torcida").trim();

const torcidaValida = TORCIDAS.find(
  (t) => t.toLowerCase() === torcida.toLowerCase()
);

if (!torcidaValida) {
  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("❌ Torcida inválida")
        .setDescription(`A torcida **${torcida}** não existe no IDT.\n\n**Torcidas disponíveis:**\n${TORCIDAS.join(", ")}`),
    ],
    ephemeral: true,
  });
}

const dadosToken = tokensPendentes.get(token);

const dadosJogador = {
  nome,
  sobrenome,
  apelido,
  torcida: torcidaValida,
  discordId: interaction.user.id,
  robloxId: dadosToken.robloxId,
  criadoEm: Date.now(),
};

jogadoresVerificados.set(dadosToken.robloxId, dadosJogador);
tokensPendentes.delete(token);

if (CONFIG.CARGO_VERIFICADO_ID) {
  try {
    const membro = await interaction.guild.members.fetch(interaction.user.id);
    await membro.roles.add(CONFIG.CARGO_VERIFICADO_ID);
  } catch (e) {
    console.log("Erro ao dar cargo:", e.message);
  }
}

await interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✊ Bem-vindo ao Império!")
      .setDescription(
        `Personagem criado com sucesso!\n\n` +
        `**Nome:** ${nome} ${sobrenome}\n` +
        `**Apelido:** ${apelido}\n` +
        `**Torcida:** ${torcidaValida}\n\n` +
        `Agora volte ao jogo e sua tela será liberada automaticamente!`
      )
      .setFooter({ text: "Império das Torcidas • IDT" }),
  ],
  ephemeral: true,
});

console.log(`✅ Jogador verificado: ${nome} ${sobrenome} (${torcidaValida}) - Roblox ID: ${dadosToken.robloxId}`);
```

}
});

app.post(”/register-token”, (req, res) => {
const secret = req.headers[“x-secret”];
if (secret !== CONFIG.ROBLOX_SECRET) {
return res.status(403).json({ error: “Acesso negado” });
}
const { token, robloxId } = req.body;
if (!token || !robloxId) {
return res.status(400).json({ error: “Dados inválidos” });
}
tokensPendentes.set(token, {
robloxId: String(robloxId),
timestamp: Date.now(),
});
console.log(`🎮 Token registrado: ${token} para RobloxID: ${robloxId}`);
res.json({ success: true });
});

app.get(”/check-player/:robloxId”, (req, res) => {
const secret = req.headers[“x-secret”];
if (secret !== CONFIG.ROBLOX_SECRET) {
return res.status(403).json({ error: “Acesso negado” });
}
const robloxId = req.params.robloxId;
const dados = jogadoresVerificados.get(robloxId);
if (dados) {
res.json({ verificado: true, dados });
} else {
res.json({ verificado: false });
}
});

app.get(”/”, (req, res) => {
res.json({
status: “online”,
bot: “Império das Torcidas”,
jogadoresVerificados: jogadoresVerificados.size,
tokensPendentes: tokensPendentes.size,
});
});

app.listen(CONFIG.PORT, () => {
console.log(`🌐 Servidor HTTP rodando na porta ${CONFIG.PORT}`);
});

client.login(CONFIG.TOKEN);
