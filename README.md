# Aura Bot

Bot Discord de votação de aura.

## Variáveis de ambiente (.env)
```
TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id
GUILD_ID=seu_guild_id
```

## Rodar local
```bash
npm install
node deploy-commands.js   # registra comandos (só precisar rodar uma vez)
node index.js
```

## Deploy Railway
1. Suba o repositório no GitHub
2. No Railway: New Project → Deploy from GitHub repo
3. Adicione as variáveis TOKEN, CLIENT_ID, GUILD_ID em Settings → Variables
4. O Railway detecta `npm start` automaticamente
