# Fluxograma — Resolve Aí

Item 10 da lista de exigências do enunciado. Ele nomeia quatro recortes, e cada
um tem um diagrama aqui:

1. [Fluxo geral](#1-fluxo-geral) — a ocorrência do registro à avaliação
2. [Perfis e responsabilidades](#2-perfis-e-responsabilidades) — quem faz o quê
3. [Ciclo de vida da ocorrência](#3-ciclo-de-vida-da-ocorrência) — a máquina de estados
4. [Perfis de usuário](#4-perfis-de-usuário) — o que cada um enxerga

Os diagramas são Mermaid versionado, não imagem: o GitHub renderiza direto e o
diff mostra quando alguém muda uma seta. **Nenhum deles foi desenhado de
cabeça** — as transições saem de `TRANSICOES` em
[`Ocorrencia.js`](../api/src/domain/entities/Ocorrencia.js) e as permissões saem
dos `requirePerfil` em
[`ocorrenciaRoutes.js`](../api/src/interfaces/http/routes/ocorrenciaRoutes.js).
Se o código mudar e o diagrama não, é divergência visível.

---

## 1. Fluxo geral

```mermaid
flowchart TD
    A([Solicitante acessa a plataforma]) --> B{Já tem conta?}
    B -- Não --> C[Criar conta]
    B -- Sim --> D[Autenticar-se]
    C --> D
    D --> E[Registrar ocorrência<br/>título · descrição · categoria<br/>localização · imagem]
    E --> F[[Status: aberta<br/>histórico gravado com status anterior nulo]]

    F --> G[Gestor visualiza a fila<br/>e filtra por categoria, status e prioridade]
    G --> H[Gestor define prioridade<br/>e atribui um responsável]
    H --> I[Gestor move o status<br/>com observação]
    I --> J[[Cada transição grava<br/>um registro de auditoria]]

    J --> K{Desfecho}
    K -- Resolvida --> L[Gestor registra<br/>a solução aplicada]
    K -- Cancelada --> M([Encerrada sem solução])

    L --> N[Solicitante avalia<br/>nota de 1 a 5]
    N --> O([Encerrada com avaliação])

    F -.-> P[Solicitante acompanha,<br/>comenta e consulta o histórico]
    J -.-> P
    P -.-> N

    J --> Q[Indicadores do dashboard<br/>recalculados]
```

As setas pontilhadas são o que o solicitante pode fazer **a qualquer momento**,
em paralelo ao trabalho do gestor: acompanhar, comentar e ler a trilha.

---

## 2. Perfis e responsabilidades

```mermaid
flowchart LR
    subgraph SOL [Solicitante]
        direction TB
        S1[Criar uma conta]
        S2[Autenticar-se]
        S3[Registrar uma ocorrência]
        S4[Informar título,<br/>descrição e categoria]
        S5[Informar localização]
        S6[Anexar uma imagem]
        S7[Acompanhar o andamento]
        S8[Adicionar comentários]
        S9[Consultar o histórico]
        S10[Avaliar a resolução]
    end

    subgraph GES [Gestor]
        direction TB
        G1[Visualizar todas<br/>as ocorrências]
        G2[Filtrar por categoria,<br/>status e prioridade]
        G3[Alterar prioridade]
        G4[Atribuir um responsável]
        G5[Atualizar o status]
        G6[Adicionar comentários]
        G7[Registrar a<br/>solução aplicada]
        G8[Visualizar indicadores<br/>em um dashboard]
    end

    OC[(Ocorrência)]

    SOL --> OC
    GES --> OC
```

**Adicionar comentários** é a única capacidade que os dois perfis têm — e é a
mesma rota (`POST /ocorrencias/:id/comentarios`), sem `requirePerfil`. A
diferença está no recorte de posse, na seção 4.

**Avaliar a resolução** é exclusiva do solicitante: a rota exige
`requirePerfil('solicitante')`. O gestor **lê** a nota, mas não a escreve.

---

## 3. Ciclo de vida da ocorrência

```mermaid
stateDiagram-v2
    direction LR
    [*] --> aberta: registro

    aberta --> em_analise
    aberta --> cancelada

    em_analise --> em_atendimento
    em_analise --> cancelada

    em_atendimento --> resolvida
    em_atendimento --> cancelada

    resolvida --> [*]
    cancelada --> [*]

    note right of aberta
        Único estado inicial.
        A abertura já grava histórico,
        com status anterior nulo.
    end note

    note right of resolvida
        Estados finais: não saem mais.
        Só 'resolvida' aceita avaliação,
        e só do solicitante dono.
    end note
```

Os cinco estados são os do enunciado. As setas são exatamente o objeto
`TRANSICOES`:

| De | Pode ir para |
|---|---|
| `aberta` | `em_analise` · `cancelada` |
| `em_analise` | `em_atendimento` · `cancelada` |
| `em_atendimento` | `resolvida` · `cancelada` |
| `resolvida` | — final |
| `cancelada` | — final |

**Qualquer seta que não está aí responde 409** (`TransicaoInvalidaError`),
inclusive o atalho tentador `aberta → resolvida`. A validação mora na entidade,
então vale venha a chamada de onde vier — HTTP, script ou teste.

**Toda transição grava auditoria na mesma operação** que muda o status, dentro
de `AlterarStatusOcorrencia`: status anterior, novo status, data e horário,
usuário responsável e observação. Se a segunda escrita falhar, a primeira é
desfeita. Não existe caminho no sistema que mude status sem deixar rastro.

---

## 4. Perfis de usuário

Quem enxerga o quê. Este é o diagrama que explica por que dois usuários logados
veem telas diferentes com os mesmos dados.

```mermaid
flowchart TD
    R[/Requisição com<br/>Authorization: Bearer token/] --> A{Token válido?}
    A -- Não --> E401[401<br/>NaoAutenticadoError]
    A -- Sim --> P{Qual perfil?}

    P -- gestor --> GA{Rota exige gestor?}
    GA -- Sim --> OK1[Autorizado]
    GA -- Não --> OK2[Autorizado<br/>sem recorte de posse]

    P -- solicitante --> SA{Rota exige gestor?}
    SA -- Sim --> E403[403<br/>NaoAutorizadoError]
    SA -- Não --> D{É dono<br/>da ocorrência?}
    D -- Não --> E404[404<br/>NaoEncontradoError]
    D -- Sim --> OK3[Autorizado<br/>só nas próprias]
```

| Rota | Quem passa |
|---|---|
| `POST /ocorrencias` · `GET /ocorrencias` · `GET /ocorrencias/:id` | autenticado — com recorte de posse para o solicitante |
| `GET /ocorrencias/:id/historico` · `POST · GET /ocorrencias/:id/comentarios` | idem |
| `PATCH /ocorrencias/:id/status` · `/prioridade` · `/responsavel` · `/solucao` | **só gestor** |
| `POST /ocorrencias/:id/avaliacao` | **só solicitante**, e só o dono |
| `GET /dashboard` · `GET /usuarios` | **só gestor** |
| `POST /auth/registrar` · `POST /auth/login` | público |

Duas decisões que valem explicação:

**Solicitante em ocorrência alheia recebe 404, não 403.** 403 confirmaria que o
recurso existe. Para quem não é dono, ela simplesmente não existe.

**O gestor lista sem recorte de posse.** Não é uma exceção à regra — é a
capacidade "visualizar todas as ocorrências" do enunciado.
