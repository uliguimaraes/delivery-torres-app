# 🏖️ Delivery Torres App — Arquitetura Monolítica Modular

Projeto prático da disciplina de **Arquitetura de Software (3º Semestre — ADS)**.  
Cenário: Time inicial de startup (5 desenvolvedores), orçamento reduzido de infraestrutura e prazo de **1 mês** para colocar no ar um aplicativo de delivery focado na alta temporada de verão em **Torres/RS**.

### 👥 Integrantes do Grupo
* **Ulisses**
* **Leonardo Borba**
* **Joel**
* **Pedro**
* **Adalicio**

---

## 1. Diagrama da Arquitetura (Monolito Modular + Marcação de Corte)

```text
┌────────────────────────── delivery-torres-app (1 processo, 1 deploy) ──────────────────────────┐
│                                                                                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌┐  ┌──────────────┐ │
│  │ usuarios │  │ restaurantes │  │ cardapio │  │ pedidos  │  ╎ pagamentos ✂️╎  │ notificacoes │ │
│  └──────────┘  └──────────────┘  └──────────┘  └──────────┘  └╌╌╌╌╌╌╌╌╌╌╌╌╌┘  └──────────────┘ │
│                                        │                                                       │
│                  pedidos orquestra os outros módulos via chamadas de função                    │
│                                                                                                │
│  ┌─────────────────────────────────────── shared/ ───────────────────────────────────────────┐ │
│  │                        AuthGuard (autenticação)  |  LoggerService                         │ │
│  └───────────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                │ (conexão única)
                                        ┌───────┴───────┐
                                        │  Banco Único  │
                                        │ (PostgreSQL)  │
                                        └───────────────┘