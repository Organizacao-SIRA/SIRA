# Plano: Melhorar o Resumo do Usuário para a IA

Este documento descreve como evoluir as informações do onboarding/configurações que compõem o **"resumo do usuário"** enviado à IA, de modo a gerar recomendações mais relevantes. O foco é duplo: **conteúdo** (quais campos, com qual taxonomia) e **arquitetura** (montar esse resumo de forma que mudar sua composição seja barato e seguro).

> Princípio norteador: *a composição do resumo vai mudar com o tempo.* Portanto, ela deve ter **uma única fonte de verdade**, declarativa e config-driven — não espalhada por prompts.

---

## 1. Diagnóstico

### 1.1. Duas trilhas de IA tratam o perfil de formas opostas
- **Busca conversacional** (`materials/services/materials-orchestrator.service.ts`) — é a trilha **ativa** (usada pela UI). Monta o perfil com os campos **crus**.
- **Recomendações** (`recommendations/recommendations.service.ts`) — **bem construída** (resolve IDs→labels, usa keywords, inclui subáreas), porém **órfã** (o frontend removeu as chamadas).

Resultado: a lógica boa está desligada e a ativa desperdiça sinal.

### 1.2. O sinal está sendo desperdiçado (alto impacto, conserto barato)
- **IDs crípticos em vez de labels:** a busca ativa faz `Interests: ${user.interests.join(', ')}` → a IA recebe `gp, dir, cd`, não "Gestão Pública, Direito, Ciência de Dados". O `mainArea` idem (`Main area: ia`).
- **Descrições e keywords das áreas nunca usadas** na busca ativa (só na trilha órfã).
- **`subAreas` coletado mas não enviado** à IA na busca ativa — é o texto livre mais rico do perfil.

### 1.3. Conteúdo dos campos
- **Áreas de interesse:** apenas **9**, com viés setor público/ciências sociais (Gestão Pública, Direito, Economia, Sociologia, Educação, Meio Ambiente) + 2 de tech + Saúde. **Lacunas enormes** (Engenharias, Computação além de IA/Dados, Exatas, Biológicas, Humanas, Psicologia, Administração privada, Artes, Agrárias…). Como `mainArea` é preso a essa lista, usuários fora dela ficam sem opção real.
- **Objetivos** (`TCC, Pesquisa científica, Estudo introdutório, Aprofundamento técnico, Concursos, Trabalho profissional`): mistura níveis de abstração (entregável × atividade × contexto × aplicação).
- **`subAreas`:** texto livre único com rótulo plural — ambíguo (uma? várias?) e sem orientação.
- **Falta um sinal-chave:** "no que o usuário está trabalhando agora" (tema de TCC/projeto/disciplina) — provavelmente o dado mais valioso para relevância e que **não existe**.
- **Nível de formação** e **Nível de material** são bons sinais (parcialmente redundantes). **Idiomas** funcionam de verdade (viram filtro ISO nas APIs). Manter.

---

## 2. Estratégia de Arquitetura (projetar para mudança)

### 2.1. Construtor único do resumo: `buildUserAiProfile`
Criar **uma** função/serviço (backend) que converte o usuário persistido no resumo para a IA. Características:
- **Config-driven:** uma lista declarativa de campos `{ chave, rótulo, resolver, incluirSe }`. Adicionar/remover/reordenar um campo do resumo é **uma linha**.
- **Resolve IDs→labels** num só lugar (reusar `getPreferenceTopicLabels` / descrições/keywords).
- **Saída estável e cacheável:** o resumo entra no `system` (cacheado pela Anthropic enquanto o perfil não muda). Manter formatação determinística.
- **Consumido por TODAS as trilhas** (busca + recomendações) → fim do drift entre prompts.

Esboço (referência, não final):
```ts
// materials|users/ai/user-ai-profile.ts
type ProfileField = {
  key: string;
  label: string;                         // rótulo em inglês p/ o prompt
  resolve: (u: UserProfileForAi) => string | null;
  includeIf?: (u: UserProfileForAi) => boolean;
};

const AI_PROFILE_FIELDS: ProfileField[] = [
  { key: 'course',        label: 'Course',            resolve: u => u.course },
  { key: 'educationLevel',label: 'Education level',   resolve: u => u.educationLevel },
  { key: 'mainArea',      label: 'Main area',         resolve: u => topicLabel(u.mainArea) },
  { key: 'subAreas',      label: 'Subareas',          resolve: u => u.subAreas },
  { key: 'currentWork',   label: 'Currently working on', resolve: u => u.currentWork }, // novo
  { key: 'interests',     label: 'Interests',         resolve: u => topicLabels(u.interests).join(', ') },
  { key: 'academicGoal',  label: 'Academic goal',     resolve: u => u.academicGoal },
  { key: 'materialLevels',label: 'Preferred material level', resolve: u => u.materialLevels.join(', ') },
  { key: 'languages',     label: 'Languages',         resolve: u => u.languages.join(', ') },
];

export const buildUserAiProfile = (u: UserProfileForAi): string => /* monta as linhas não-vazias */;
```

### 2.2. Taxonomia como dado, não como código ad-hoc
A lista de áreas deve ser **dado configurável** (já é, em `preferences-options.ts`), idealmente baseada num padrão reconhecido para reduzir viés e dar cobertura ampla.

**Proposta:** adotar as **Grandes Áreas do Conhecimento (CNPq/CAPES)** como `mainArea`, e usar `interests` como **subáreas/temas** (lista expandida, opcionalmente filtrada pela grande área):
1. Ciências Exatas e da Terra · 2. Ciências Biológicas · 3. Engenharias · 4. Ciências da Saúde · 5. Ciências Agrárias · 6. Ciências Sociais Aplicadas · 7. Ciências Humanas · 8. Linguística, Letras e Artes · 9. Multidisciplinar.

Vantagens: padrão local conhecido, cobertura completa, sem viés de nicho, e o modelo de IA já "entende" essas categorias.

> **Decisão de produto (Fase 0):** confirmar o **público-alvo** — geral acadêmico (recomendado, taxonomia CNPq) vs. foco em concursos/setor público (manteria as áreas atuais como um subconjunto). Isso muda a taxonomia adotada.

### 2.3. Novo sinal de alto valor: "trabalho atual"
Adicionar `currentWork` (texto livre, ~1 frase): *"tema do TCC, projeto ou disciplina atual"*. É o melhor preditor de relevância e integra naturalmente ao construtor da Seção 2.1.

### 2.4. Continuidade com o contrato Zod existente
Todo campo novo flui pelo contrato único do frontend (`domain/academicPreferences.ts`) e pelo DTO do backend (`complete-onboarding.dto.ts`), que devem evoluir juntos (o compilador garante a paridade — já estabelecido). A taxonomia deve ser a **mesma fonte** consultada por frontend e backend (hoje duplicada; ver Fase 3).

---

## 3. Checklist de Implementação

> **Sequenciamento:** as **Fases 1–2 são independentes da decisão de produto** (Fase 0) — corrigem a arquitetura e o vazamento de sinal sem mudar a taxonomia nem o schema, então podem começar imediatamente e já entregam ganho. As **Fases 3–4** (nova taxonomia e campo novo) dependem da Fase 0.

### Fase 0 — Decisões de produto ⏸️ (pendente — bloqueia Fase 3 e 4)
- [ ] Confirmar público-alvo (geral acadêmico vs. concursos/setor público) → define a taxonomia.
- [ ] Aprovar a taxonomia de áreas (CNPq grandes áreas + subáreas) e a lista de subáreas/temas.
- [ ] Aprovar o campo "trabalho atual" e os ajustes de objetivos.

### Fase 1 — Construtor único + conserto da trilha ativa (ganho rápido, sem mudar dados) ✅
- [x] Criar `buildUserAiProfile` (Seção 2.1) como fonte única do resumo. → `users/ai/user-ai-profile.ts`
- [x] Incluir `subAreas: true` no `select` de `getUserForChat` (`material-persistence.service`).
- [x] Ligar `materials-orchestrator.service` a ele → envia **labels** (não IDs) e inclui **subAreas**. (descrições/keywords: opcional, adiado.)
- [ ] Cobrir com teste de snapshot do resumo. **Bloqueado:** backend sem infra de testes (sem jest). Validado por ora via `tsx` manual.

### Fase 2 — Unificar as trilhas ✅
- [x] Migrar `recommendations.service` para consumir `buildUserAiProfile` (remove o `buildPreferencesText` duplicado; corrige `mainArea` que ia como ID cru também ali).
- [x] Decisão: **manter o código unificado e pronto para reativar** (UI de recomendações **não** reativada agora).

### Fase 3 — Expansão da taxonomia de áreas ✅
Abordagem escolhida: **expandir** (manter as 9 originais + adicionar 21), evitando migração e mudança de contrato.
- [x] Expandir `PREFERENCE_TOPICS` (BE) de 9 → 30 áreas cobrindo as grandes áreas CNPq (label/description/keywords).
- [x] i18n pt/en (`topics.<id>`) e `TOPIC_ICONS` em paridade (30/30/30/30).
- [x] **Sem migração** (IDs antigos seguem válidos) e **sem mudar o contrato Zod** (mainArea/interests são string validada contra `PREFERENCE_TOPIC_IDS`, que auto-estende). Onboarding/config mapeiam tópicos dinamicamente — não precisaram de ajuste.
- [ ] *(Deferido)* Eliminar a duplicação FE×BE das listas (módulo/fonte compartilhada).
- [x] *(Avaliado e descartado)* Taxonomia em 2 níveis (grande área CNPq → subáreas filtradas). **Decisão: reenquadrar, não reestruturar.** Adotar grandes áreas como `mainArea` *dilui* o sinal da IA (`Main area: Engenharias` < `Main area: Engenharia de Software`), exige migração + manutenção de um mapa 30→9 e contraria a escolha da Fase 3 (expandir a lista plana). Em vez disso, o `mainArea` foi **redefinido** como "Área principal de interesse" (o tema que melhor define o foco de estudo/atuação), com hint no onboarding — a lista plana de 30 tópicos passa a fazer sentido como "escolha seu nº 1", sem ambiguidade de granularidade, sem migração. Mantido independente de `interests` (acoplar `mainArea ∈ interests` traria fragilidade entre os cards do Perfil; custo > benefício). Label da IA segue `Main area` (sinal estável; evita invalidar o cache do `system`).

### Fase 4 — Campo "trabalho atual" ✅
- [x] Schema Prisma (`currentWork String?`), aplicado via `db push` (fluxo do projeto).
- [x] Contrato Zod (FE) + DTOs (BE) + adaptador (`academicPreferencesFromProfile`).
- [x] UI: campo no onboarding (`AcademicProfileStep` + Review) e nas Configurações (`AcademicProfileCard`), com placeholder/exemplos e i18n pt/en.
- [x] Incluído no `buildUserAiProfile` ("Currently working on") + selects da busca e recomendações.

### Fase 5 — Refinos de conteúdo ✅
- [x] Reorganizar **objetivos** → eixo único de **propósito** (5 valores): `TCC / Monografia`, `Pesquisa científica`, `Estudo de disciplina`, `Concursos públicos`, `Atuação profissional`. Os antigos `Estudo introdutório`/`Aprofundamento técnico` (que duplicavam o nível de material) colapsaram em `Estudo de disciplina`. **Migração** `20260609120000_remap_academic_goals` remapeia os valores legados; valores `TCC`/`Concursos`/`Trabalho profissional` foram mantidos no banco (só o rótulo i18n mudou) → migração mínima.
- [x] Orientar **subAreas** — placeholder com exemplos (`Ex: Machine Learning, NLP`) já presente no onboarding. *(Multi-tag/estruturado: deferido.)*
- [x] Avaliar redundância **nível de formação × nível de material** → **manter ambos** (sinais distintos). Rótulos clareados: no perfil, `fields.level` (ambíguo, usado nos dois cards) virou `educationLevel` ("Nível de formação") e `materialLevel` ("Nível do material"); descrição da profundidade no onboarding explicita "independente da sua formação".

### Fase 6 — Verificação
- [x] `tsc` FE + BE verdes; **ESLint FE** verde. *(Backend não tem config de ESLint — `lint` script aponta para um config inexistente; gate de correção do BE é o `tsc`.)*
- [ ] Teste manual: perfis variados geram resumos legíveis (labels, subáreas, trabalho atual) no prompt.
- [ ] Comparar qualidade das recomendações antes/depois (amostra de buscas reais).
- [ ] Conferir que o cache de prompt continua estável (resumo determinístico).

---

## 4. Notas de Manutenção
- **Adicionar um campo ao resumo da IA** passa a ser: (1) campo no contrato Zod + DTO + schema; (2) uma linha em `AI_PROFILE_FIELDS`. Sem tocar em prompts.
- **Mudar a taxonomia** é editar a fonte única de áreas + migração — o resto deriva.
- **Estabilidade de cache:** mudanças na formatação do resumo invalidam o cache de `system` da Anthropic; manter o construtor determinístico e versionar mudanças relevantes.
- **Paridade FE×BE:** taxonomia e campos devem ter uma única fonte; enquanto houver duplicação, documentar e sincronizar (meta: módulo/contrato compartilhado).
