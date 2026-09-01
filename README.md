# AutoPainel

Sistema multimídia veicular para tablets, no estilo Android Auto / CarPlay, feito para rodar direto do navegador e ser hospedado gratuitamente no GitHub Pages.

## Funcionalidades

| Módulo | O que faz | Tecnologia |
|---|---|---|
| Painel / velocímetro | Mostra a velocidade em tempo real a partir do GPS do tablet, com modo demonstração quando não há GPS | `navigator.geolocation` (campo `speed`) |
| Navegação | Mapa ao vivo, busca de endereço e traçado de rota com distância/tempo | Leaflet + OpenStreetMap + OSRM + Nominatim (públicos e gratuitos) |
| Câmera de ré | Exibe o vídeo da câmera do tablet (ou de um capturador USB reconhecido como webcam) com linhas-guia de estacionamento | `getUserMedia` |
| Música | Toca arquivos de áudio do próprio tablet, com fila de reprodução e visualizador de espectro | `<audio>` + Web Audio API |
| Streaming | Atalhos para abrir Netflix, Prime Video, Disney+ e Spotify, além de um player para vídeos individuais do YouTube | Links externos + iframe do YouTube |
| Clima | Temperatura atual, sensação térmica, vento, umidade e previsão de 5 dias | API pública Open-Meteo |
| Ajustes | Unidade de velocidade (km/h ou mph), tema diurno/noturno e verificação de permissões | — |

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub e envie todos os arquivos desta pasta para ele.
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
4. Salve. Em alguns minutos o site ficará disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
5. No tablet, abra esse endereço no navegador (Chrome recomendado) e use **"Adicionar à tela inicial"** para que ele funcione como um app em tela cheia.

Também é possível testar localmente antes de publicar, servindo a pasta com qualquer servidor estático (por exemplo `python3 -m http.server`), já que o navegador bloqueia câmera/GPS quando o arquivo é aberto direto como `file://`.

## Limitações importantes (leia antes de usar em um veículo)

- **Netflix, Prime Video, Disney+ e Spotify não podem ser exibidos dentro do painel.** Esses serviços bloqueiam a incorporação em iframe por proteção de conteúdo (DRM) e pelos próprios termos de uso. O app abre o site/aplicativo oficial em uma nova guia — é o máximo que qualquer solução baseada em navegador consegue oferecer sem quebrar contrato com esses serviços.
- **YouTube funciona de verdade**, mas apenas reproduzindo um vídeo por vez (colando o link), porque o YouTube não permite incorporar sua página inicial completa.
- **A câmera de ré depende de hardware.** O navegador só enxerga o que o sistema operacional do tablet reconhece como câmera. Em uma instalação veicular real, isso normalmente exige um capturador de vídeo USB/AV conectado à câmera de ré do carro; sem esse hardware, o app usa a câmera do próprio tablet.
- **O velocímetro por GPS não funciona em tablets somente Wi-Fi** (sem chip de GPS dedicado) e pode ter atraso ou imprecisão em qualquer tablet. Por isso existe o "Modo demonstração".
- **Localização e câmera exigem HTTPS** (o GitHub Pages já fornece isso automaticamente) e a permissão do usuário no navegador.
- Este é um painel independente rodando no navegador — ele não se integra a sistemas do próprio veículo (CAN bus, rotação do motor, sensores de estacionamento, controles no volante etc.), o que exigiria hardware e acesso específicos do fabricante.

## Estrutura de arquivos

```
autopainel/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── modules/
│       ├── clock.js
│       ├── speedometer.js
│       ├── gps.js
│       ├── camera.js
│       ├── music.js
│       ├── weather.js
│       └── streaming.js
└── assets/
    └── favicon.svg
```

## Personalização rápida

- **Cores/tema**: variáveis CSS em `css/style.css`, no bloco `:root`.
- **Cidade padrão do clima/mapa** (usada quando o GPS não está disponível): constante `FALLBACK_COORDS` em `js/modules/gps.js` e `js/modules/weather.js`.
- **Velocidade máxima do velocímetro**: constante `MAX_SPEED` em `js/modules/speedometer.js`.
