# GYM TRACKER PRO

Versão do Gym Tracker com frontend moderno + API REST + SQLite.

## Como rodar

1. Instale Node.js 18+ (recomendado 20+).
2. Abra o terminal dentro desta pasta.
3. Rode:

```bash
npm install
npm start
```

4. Abra `http://localhost:3000`.

O banco será criado automaticamente em `data/gym-tracker.db`.

## O que foi adicionado

- API REST em Express.
- Banco SQLite persistente.
- Planos e exercícios salvos no banco.
- Sessões de treino e todas as séries salvas.
- Histórico de treinos.
- Histórico de peso.
- Perfil/calorias salvo no banco.
- Biblioteca de exercícios com busca.
- Botão para abrir demonstração do exercício.
- Interface mobile-first mais viva, com cards, animações, indicadores e feedback visual.

## Principais endpoints

- `GET /api/health`
- `GET /api/state`
- `GET /api/exercises?q=...`
- `POST /api/plans`
- `POST /api/plans/:id/exercises`
- `POST /api/workouts`
- `GET /api/workouts/:exercise`
- `POST /api/weights`
- `PUT /api/profile`

> Observação: a biblioteca inicial usa imagens demonstrativas externas. Para produção, o ideal é trocar por uma fonte licenciada de GIFs/vídeos de exercícios.
