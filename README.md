# HM Work·Kit

Biblioteca de artigos e orçamentos para gestão de projectos.

## Stack
- React 18 + Vite
- Firebase (Firestore + Authentication)
- GitHub Pages (hosting)
- PWA (instalável em qualquer dispositivo)

## Instalação local

```bash
npm install
npm run dev
```

## Deploy

Qualquer push para `main` faz deploy automático via GitHub Actions.

## Estrutura

```
src/
├── firebase.js          # configuração Firebase
├── App.jsx              # navegação principal + autenticação
├── context/
│   └── AuthContext.jsx  # estado de autenticação global
├── hooks/
│   └── useToast.js      # notificações
├── components/
│   └── Toast.jsx        # componente de notificação
├── pages/
│   ├── Login.jsx        # ecrã de login Google
│   ├── Biblioteca.jsx   # módulo principal
│   ├── Modelos.jsx      # tabelas modelo (próximo)
│   ├── Orcamentos.jsx   # orçamentos (próximo)
│   └── IA.jsx           # assistente IA (próximo)
└── styles/
    └── global.css       # design system completo
```
