# Plano de Refatoração: UX/UI e Componentização Frontend

Este documento detalha a estratégia para elevar a qualidade da experiência do usuário (UX) e a arquitetura da interface (UI) do frontend do SIRA+. O objetivo principal é remover antipadrões, melhorar a acessibilidade (A11y), consolidar o design system e eliminar a duplicação massiva de código.

## 1. Problemas Identificados (Diagnóstico)

*   **Dívida de Componentização:** Ausência de componentes base (Atoms). Botões, inputs, spinners e estados de erro/vazio possuem classes Tailwind gigantescas (`bg-[#...] hover:bg-[#...]`) copiadas e coladas por dezenas de arquivos.
*   **Micro-interações Deficientes:** Faltam affordances de interatividade (`cursor-pointer` em elementos clicáveis), feedbacks visuais durante requisições assíncronas (disabled states) e transições suaves de loading.
*   **Hardcoding de Tema:** As cores institucionais (ex: `#1351B4`, `#003157`) estão "chumbadas" no HTML. Uma mudança de branding exigiria um esforço hercúleo de find & replace.
*   **Acessibilidade (A11y) Comprometida:** Botões compostos apenas por ícones não possuem `aria-label`. Formulários não possuem vínculo explícito entre `<label>` (`htmlFor`) e `<input>` (`id`). Os estados de foco (focus rings) pelo teclado são muito sutis.
*   **UX de Carregamento (Loading):** Transições de tela dependem quase exclusivamente de spinners gigantes de tela inteira, causando "screen flickering". Falta adoção de Skeleton Loaders e loadings locais contextuais (ex: dentro de um botão).

---

## 2. Estratégia de Arquitetura Moderna (Design System)

A refatoração será conduzida aplicando os princípios do **Atomic Design** simplificado:

1.  **Configuração Global:** Estender o `tailwind.config.js` para abstrair as cores hexadecimais em variáveis semânticas (ex: `primary`, `secondary`, `surface`).
2.  **Atoms (Componentes Base):** Criar uma biblioteca de componentes reutilizáveis dentro de `src/components/ui/`.
3.  **Molecules & Organisms:** Refatorar formulários e cartões complexos para consumir os Atoms.
4.  **Pages:** Limpar o código das páginas, focando-as apenas na orquestração de dados e estado.

---

## 3. Checklist de Implementação

### Fase 1: Fundação do Design System
- [x] Atualizar `tailwind.config.js` mapeando as cores hexadecimais (azul primário, azul escuro, amarelo, etc.) para variáveis de tema semânticas (`primary`, `primary-dark`, `accent`, etc.).
- [x] Substituir todas as ocorrências de cores "chumbadas" (ex: `bg-[#1351B4]`) pelas novas classes de tema (`bg-primary`) em todo o projeto.

### Fase 2: Componentes Base (Atoms) - Criação
Criar a pasta `src/components/ui/` e implementar os seguintes componentes encapsulando as regras de acessibilidade e estados Tailwind:
- [x] `<Button />`: Suporte a `variant` (primary, secondary, ghost, danger), `size`, estado `isLoading` (com spinner interno), `disabled`, e `aria-label`.
- [x] `<Input />`: Suporte a `label`, `id` (para vínculo automático do htmlFor), `error` message e `focus:ring` adequado.
- [x] `<Select />`: Componente padronizado para dropdowns.
- [x] `<Checkbox />`: Componente estilizado acessível.
- [x] `<Spinner />`: Loader local e de tela inteira.
- [x] `<EmptyState />` / `<ErrorState />`: Componentes padronizados para telas sem dados ou quando a API falha.

### Fase 3: Refatoração de Formulários e Interfaces
Substituir o HTML bruto pelos novos componentes (Atoms) nos seguintes arquivos:
- [x] `Login.tsx` e `Register.tsx`
- [x] `Onboarding.tsx` e `Interests.tsx`
- [x] `Profile.tsx` (Remover a implementação gigante de formulário e potencialmente reviver/mesclar com `ProfileForm.tsx`).

### Fase 4: Refinamento de UX, Acessibilidade e Micro-interações
- [x] Revisar todos os botões/elementos clicáveis (`onClick`) para garantir que possuem a classe `cursor-pointer` (se não forem tags `<button>` ou `<a>` nativas) ou se comportam como botões nativos.
- [x] Adicionar `aria-label` a todos os botões icon-only (ex: botão de favoritar, voltar).
- [x] Implementar Skeleton Loaders (ex: `<CatalogCardSkeleton />`) para o carregamento da Home/Catálogo, eliminando a tela branca com spinner central.
- [x] Garantir que ações de formulário bloqueiem múltiplos cliques (estado `isLoading` = `disabled`) nos botões de submissão (Profile, Onboarding, Login).

### Fase 5: Verificação e Teste
- [ ] Validar a navegação completa usando apenas a tecla `TAB` (Keyboard Navigation).
- [ ] Testar o sistema com leitores de tela em pontos críticos (formulários e cards de recomendação).
- [ ] Realizar teste de consistência visual entre as telas para garantir uniformidade.