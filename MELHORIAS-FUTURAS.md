# Melhorias futuras — LP Fórum Novo Comércio

Lista de melhorias identificadas após o deploy do form captura-first (commit `fd4fa29`). Ordem = prioridade por impacto.

---

## 1. Pixel Meta `Lead` no passo 0 (envio do contato) — alta alavanca

**Contexto:** hoje o evento `fbq("track", "Lead", ...)` dispara só quando a pessoa completa as 7 perguntas (em `sendToSheets` qualificado ou desqualificado). Se 100 pessoas preenchem nome/email/WhatsApp e só 60 chegam ao fim, o Meta Ads só vê 60 conversões e otimiza pra esse perfil — CPL sobe.

**O que fazer:**
- Disparar `fbq("track", "Lead", ...)` em `handleContactSubmit`, logo após validar o `contactSchema` e antes de `setStep(1)`.
- Mover o evento atual (no fim das perguntas) para `fbq("track", "CompleteRegistration", ...)` — diferencia "lead capturado" de "lead qualificado completo".
- Configurar `CompleteRegistration` como evento de otimização secundário no Meta Ads.

**Arquivos:** `src/pages/Index.tsx` — funções `handleContactSubmit` e `handleOptionSelect` (dentro do `MultiStepForm`).

**Trade-off:** o número de "Leads" no Ads Manager vai parecer subir (porque agora conta o que já era lead real). Não é inflação — é métrica honesta. Preparar Carlos pra essa leitura antes de subir.

---

## 2. Urgência dentro da moldura do form — baixo esforço, alto impacto

**Contexto:** o countdown só existe na nav (topo). No segundo fold, quando o lead chega na moldura, perdeu a referência de tempo. Reforço de urgência no ponto da decisão aumenta conversão.

**O que fazer (escolher uma das duas):**
- **Opção A:** linha "**Restam X vagas**" abaixo do heading "Garanta sua vaga em 2 minutos". Se a contagem for fixa/manual, manter como string. Se for dinâmica, expor via env ou Sheets.
- **Opção B:** mini-countdown (DD : HH : MM) reduzido, colado ao heading da seção do form. Pode reusar o `useCountdown` existente.

**Arquivos:** `src/pages/Index.tsx` — bloco do `<motion.div variants={fadeUp} className="text-center mb-8">` dentro da seção `#formulario`.

---

## 3. Conferir overflow horizontal no mobile pequeno (<380px)

**Contexto:** a moldura magnética usa `-inset-6 sm:-inset-8` no halo difuso (`absolute -inset-6 sm:-inset-8 bg-primary/20 blur-3xl`). Em telas muito pequenas (iPhone SE 1ª geração, ~320-375px), o halo pode estourar e causar barra de scroll horizontal sutil — o `overflow-x-hidden` do `motion.div` raiz deve segurar, mas vale validar.

**O que fazer:**
- Abrir DevTools, simular iPhone SE (375px) e Galaxy Fold (280px dobrado).
- Verificar se aparece scrollbar horizontal ou se o layout "pula" lateralmente.
- Se sim: reduzir o halo no mobile (`-inset-3 sm:-inset-6 md:-inset-8`) ou trocar por `inset-0` no breakpoint base.

**Arquivos:** `src/pages/Index.tsx` — div com `aria-hidden="true"` dentro da seção `#formulario`.

---

## 4. Prova social colada no form — só com material real

**Contexto:** depoimentos perto do CTA reduzem hesitação. Hoje a página tem stats, mas não tem rosto/nome/frase de cliente real no ponto de conversão (segundo fold).

**O que fazer:**
- 1 card só, entre o heading e a moldura: foto + nome + cargo/faturamento + frase curta (~2 linhas) de um empresário da edição anterior.
- Manter visual minimalista pra não competir com a moldura.

**Bloqueador:** depende de ter depoimento real à mão (com permissão de uso de imagem). Mock é pior que nada — quebra a confiança se a pessoa pesquisar.

---

## Notas operacionais

- **Coluna `Status` na planilha do Sheets:** o POST atual envia o campo `Status` (`"Qualificado"` ou `"Desqualificado"`). Verificar se a coluna foi criada e se o Apps Script está mapeando — sem isso o dado é gravado mas não fica visível.
- **A/B test (opcional):** rodar a versão atual (captura-first) por ~2 semanas antes de mexer em qualquer coisa pra ter baseline de conversão. Só então fazer mudanças incrementais (uma por vez) pra atribuir efeito.
