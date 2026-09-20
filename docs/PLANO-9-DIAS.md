# Resolve Aí — Plano de 9 dias

**Hoje:** domingo, 20/09/2026 · **Entrega:** 29/09/2026 (confirmada) · **Solo**, autorizado · **Capacidade:** 20h+
Contrato de implementação em `ESPEC-TECNICA.md` · Requisitos em `DESAFIO-RESOLVE-AI.md`

---

## 1. O que o enunciado trava, e o que é escolha nossa

Conferido linha a linha no PDF: **nenhuma tecnologia é imposta.** Não há menção a linguagem, framework, banco ou provedor de nuvem.

| | Situação |
|---|---|
| **Docker** | **Obrigatório** — único nome próprio citado no enunciado |
| **Deploy em Cloud** | **Obrigatório**, provedor livre |
| Arquitetura, backend, APIs, banco, frontend, testes, documentação | Obrigatórios como **áreas**; a tecnologia é escolha nossa |

Tudo o mais neste plano é escolha deliberada, feita para manter coerência com o que a pós ensinou — e cada escolha precisa aparecer **justificada** no relatório. Demonstrar critério vale mais do que acumular ferramenta.

### Escolhas e suas justificativas (vão para o relatório)

| Escolha | Justificativa |
|---|---|
| Node + Express + MongoDB + React + Vite | Continuidade direta das Fases 2, 3 e 4 |
| **Clean Architecture** | Módulo da Fase 5 com 8 aulas; "Arquitetura de software" é o 1º item exigido. Custo baixo, retorno alto |
| **Monolito modular** | Aula 2 de Microsserviços — "Quando usar microsserviços e monolitos". Equipe de um, domínio único, 9 dias. As fronteiras da Clean Architecture deixam a extração futura mecânica |
| Docker | Exigido pelo enunciado e Aula 5 da fase |
| **Nuvem: decisão hoje à noite** | Ver seção 3 |

---

## 2. Os 9 dias

| Dia | Data | Horas | Entrega ao fim do dia |
|---|---|---|---|
| **D1** | dom 20/09 | 4h | **Decisão de nuvem + infra no ar.** Contas criadas, repo publicado, API com `/health` respondendo na nuvem, front publicado, CI verde |
| **D2** | seg 21/09 | 2h | Domínio e casos de uso de auth · repositórios Mongoose · `RegistrarUsuario`, `AutenticarUsuario` · middlewares `auth` e `requirePerfil` · testes de auth |
| **D3** | ter 22/09 | 2h | `RegistrarOcorrencia` + `ListarOcorrencias` · upload Cloudinary funcionando **em produção** · histórico de abertura gravado |
| **D4** | qua 23/09 | 2h | `AlterarStatusOcorrencia` com máquina de estados no domínio + trilha de auditoria · comentários · testes unitários dos casos de uso |
| **D5** | qui 24/09 | 2h | Prioridade · responsável · solução · avaliação · filtros · `ObterIndicadores`. **🔒 Backend fechado** |
| **D6** | sex 25/09 | 2h | Front: AuthContext, PrivateRoute, Navbar, login/registro, lista, formulário de nova ocorrência |
| **D7** | sáb 26/09 | 5h | Front: detalhe com **timeline do histórico**, painel do gestor com filtros, dashboard com Recharts. **🔒 Congelamento de features às 23h59** |
| **D8** | dom 27/09 | 4h | Seed de demonstração · caça-bugs · README · `docs/ARQUITETURA.md` · Postman · **vídeo do MVP gravado** |
| **D9** | seg 28/09 | 3h | **Vídeo do pitch** · Drive público · submissão |
| — | **ter 29/09** | — | **Deadline** — entrega já feita na véspera |

**Total: ~26h.** Se a nuvem for Azure, some 4h a 6h e o D2 e o D6 ficam mais apertados.

Depois de 26/09 à noite, nenhuma funcionalidade nova entra.

---

## 3. A decisão de nuvem — hoje, com prazo

**Tente ativar o Azure for Students agora.** São ~15 minutos, dá US$ 100 de crédito por 12 meses e **não pede cartão de crédito** — basta o e-mail acadêmico `rm365669@fiap.com.br`.

👉 `azure.microsoft.com/free/students`

**Ao mesmo tempo, crie a organização no Azure DevOps** (`dev.azure.com`, gratuita e independente da assinatura) e **solicite imediatamente a concessão do job paralelo gratuito**. Organizações novas precisam pedir, e a liberação leva alguns dias úteis. Hoje é domingo — pedindo agora, entra na fila de segunda.

### Ponto de decisão: hoje, 22h

| Se… | Então |
|---|---|
| Assinatura Azure ativa | **Caminho A — Azure.** Seguir 3.1 |
| Azure travou ou não aprovou | **Caminho B — Render + Vercel.** Seguir 3.2, sem culpa e sem perder tempo insistindo |

Em qualquer dos dois, o Azure Boards pode ser usado para as tarefas — é gratuito, independe da assinatura, e vira evidência de processo no relatório.

### 3.1 Caminho A — Azure

1. **Resource group** `rg-resolveai` (região Brazil South ou East US).
2. **ACR** `acrresolveai` — SKU Basic. Não há camada gratuita; consome ~US$ 5/mês do crédito.
3. **Build e push** da imagem da API para o ACR.
4. **Web App for Containers** (Aula 8), plano **B1 Linux**, apontando para a imagem no ACR. Habilitar *continuous deployment*.
5. **Application Settings** do Web App: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `CORS_ORIGIN`, `PORT=3000` — nunca no repositório.
6. **Front:** Static Web App, ou Vercel se quiser poupar tempo (é defensável: o front é estático).
7. **Azure Pipelines multi-stage** (Aulas 3 e 4): `build → test → push ACR → deploy Web App`.
8. Ao terminar a entrega, **pare o Web App** para não queimar crédito.

⚠️ Se na terça 22/09 o pipeline do Azure ainda não estiver rodando, **migre a CI para GitHub Actions** e mantenha só o deploy no Azure. Não deixe o CI/CD consumir dias.

### 3.2 Caminho B — Render + Vercel

1. **Render → New Web Service**, Root Directory `api`, Runtime **Docker**, plano Free. Variáveis em Environment.
2. **Vercel**, Root Directory `web`, framework Vite, `VITE_API_URL` apontando para o Render.
3. Ajustar `CORS_ORIGIN` no Render para a URL da Vercel.
4. CI: o `.github/workflows/ci.yml` já está pronto no repositório.

⚠️ **Três armadilhas do Render free:** exige cartão no cadastro (mesmo grátis) · **hiberna após 15 min sem tráfego** e leva ~1 min para acordar — **aqueça a URL antes de gravar o vídeo e antes da banca abrir** · **sem disco persistente**, que é o motivo de o Cloudinary ser obrigatório nos dois caminhos.

### 3.3 Comum aos dois

- **MongoDB Atlas** M0 free. Network Access em `0.0.0.0/0` — nem Render nem Web App têm IP fixo nos planos baixos.
- **Cloudinary** free: `Cloud Name`, `API Key`, `API Secret`.
- Anotar as URLs públicas no README — vão para a documentação e para o Drive.

---

## 4. Checklist das 18 capacidades

**Solicitante**

- [ ] Criar uma conta · [ ] Autenticar-se · [ ] Registrar uma ocorrência
- [ ] Informar título, descrição e categoria · [ ] Informar localização · [ ] Anexar uma imagem
- [ ] Acompanhar o andamento · [ ] Adicionar comentários · [ ] Consultar o histórico · [ ] Avaliar a resolução

**Gestor**

- [ ] Visualizar todas · [ ] Filtrar por categoria, status e prioridade · [ ] Alterar prioridade
- [ ] Atribuir responsável · [ ] Atualizar status · [ ] Adicionar comentários
- [ ] Registrar a solução aplicada · [ ] Dashboard de indicadores

**Camadas exigidas**

- [ ] Arquitetura de software documentada e justificada · [ ] Backend · [ ] APIs · [ ] Banco
- [ ] Frontend · [ ] Testes · [ ] Docker · [ ] Deploy em Cloud · [ ] Documentação

---

## 5. Se atrasar — escada de cortes

Nenhuma das 18 capacidades pode sumir. Corta-se profundidade, nesta ordem:

1. **Azure → Render.** O primeiro a cair, porque é o que menos afeta a nota e o que mais consome tempo
2. **Dashboard** → quatro cartões numéricos, sem Recharts
3. **Upload** → uma imagem, sem preview
4. **Front** → styled-components no essencial, sem responsividade caprichada
5. **Testes** → só os unitários dos casos de uso, que rodam sem banco
6. **Paginação** → lista simples

**Intocáveis:** os dois perfis · os cinco status · a trilha de auditoria · Docker · deploy em Cloud · a estrutura da Clean Architecture.

**Gatilho automático:** se na noite de 24/09 o backend não estiver fechado, aplique os cortes 1, 2 e 3 sem deliberar.

---

## 6. Seed de demonstração (D8)

`api/scripts/seed.js` criando:

- 1 gestor (`gestor@resolveai.com`) e 2 solicitantes
- 8 ocorrências espalhadas pelos cinco status e por categorias diferentes
- **1 resolvida com avaliação e histórico completo de quatro transições** — é a que você abre no vídeo
- 1 cancelada, para mostrar o caminho alternativo

Dashboard com números redondos e uma timeline cheia valem mais no vídeo do que qualquer refino de CSS.

---

## 7. Roteiro do vídeo do MVP (D8)

1. **(30s)** O problema: ocorrências por WhatsApp, sem rastreio
2. **(1min)** Solicitante cria conta, registra ocorrência com foto e localização
3. **(2min)** Gestor filtra no painel, prioriza, atribui responsável, move para Em análise e Em atendimento com observação
4. **(1min30)** **A timeline de auditoria** — status anterior, novo, data, usuário, observação. É o ponto alto
5. **(1min)** Gestor registra a solução e resolve; solicitante avalia
6. **(1min)** Dashboard de indicadores
7. **(1min)** Arquitetura: camadas da Clean Architecture, Docker, pipeline, deploy em Cloud, testes passando

Antes de gravar: aqueça a URL, rode o seed, feche as abas.

---

## 8. Riscos

| Risco | Mitigação |
|---|---|
| Azure consumir 2 dias e não ficar pronto | Ponto de decisão hoje às 22h; corte 1 da escada existe para isso |
| Concessão do job paralelo do Azure DevOps demorar | Pedir **hoje**; GitHub Actions como rede de segurança desde já |
| Front consumir mais que as 7h de D6+D7 | São os dias de maior risco; cortes 2 e 4 caem primeiro |
| Trilha de auditoria pela metade | Gravar o histórico dentro do caso de uso que altera o status |
| Render hibernando na hora da avaliação | Aquecer antes de gravar e antes de entregar; avisar no README |
| Gravar vídeo no último dia | D8 grava, D9 é colchão. Não inverta |
| Clean Architecture virar over-engineering | Quatro camadas, nada além. Se um caso de uso tem 5 linhas, está certo |
