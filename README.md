# Orbis

MVP front-end de agendamento com catálogo de serviços e combos. A aplicação simula o fluxo de reserva, consulta, reagendamento e cancelamento usando dados de demonstração e `localStorage`; não há backend nem autenticação real.

## Executar localmente

```sh
npm install
npm run dev
```

Para validar a versão de produção:

```sh
npm run build
npm run preview
```

## Fluxos disponíveis

- **Catálogo:** navegue por serviços e combos, pesquise e monte uma seleção.
- **Agendamento:** escolha serviços, profissional, data e horário; informe seus dados e confirme a reserva.
- **Meus agendamentos:** consulte as reservas de demonstração, filtre por status, reagende ou cancele.
- **Persistência local:** seleção e agendamentos ficam no navegador. Use “Restaurar demonstração” para repor as reservas de exemplo.

Os dados de demonstração incluem profissionais, serviços, combos e reservas fictícias.

## Organização do código

- `src/pages`: catálogo, agendamento e consulta de reservas.
- `src/components`: layout, cartões, resumos, diálogos e componentes reutilizáveis.
- `src/hooks` e `src/context`: acesso e estado compartilhado da aplicação.
- `src/services`: persistência local e regras de disponibilidade/preço.
- `src/data`: dados fictícios; `src/types`: modelos TypeScript.
