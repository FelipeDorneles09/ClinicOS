# ClinicOS — Sistema de Gestão Clínica

ClinicOS é uma plataforma full-stack moderna para gestão hospitalar e clínica, projetada para oferecer eficiência operacional com uma interface premium inspirada no design system do TailAdmin.

![Dashboard Preview](https://img.shields.io/badge/UI-TailAdmin-3C50E0?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

## 🚀 Tecnologias Utilizadas

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **Animações**: Framer Motion
- **Ícones**: Phosphor Icons
- **Design System**: TailAdmin (Dark Mode customizado)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Prisma (PostgreSQL)
- **Linguagem**: TypeScript
- **Autenticação**: JWT (JSON Web Tokens)

### Infraestrutura
- **Containerização**: Docker & Docker Compose
- **Banco de Dados**: PostgreSQL

---

## 🛠️ Como Rodar o Projeto

### Pré-requisitos
- [Docker](https://www.docker.com/) instalado.
- [Docker Compose](https://docs.docker.com/compose/) instalado.

### Passo a Passo

1. **Clonar o Repositório** (ou entrar na pasta do projeto).

2. **Configurar Variáveis de Ambiente**
   O projeto já possui arquivos `.env` configurados para o ambiente Docker, mas certifique-se de que o arquivo principal na raiz contém:
   ```env
   DATABASE_URL="postgresql://admin:admin123@db:5432/clinicos?schema=public"
   JWT_SECRET="sua_chave_secreta_aqui"
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   INTERNAL_API_URL="http://api:3001/api"
   ```

3. **Subir os Containers**
   Execute o comando abaixo na raiz do projeto:
   ```bash
   docker-compose up --build
   ```

4. **Popular o Banco de Dados (Seed)**
   Com os containers rodando, abra um novo terminal e execute o seed para criar os usuários de teste:
   ```bash
   docker exec -it clinicos_api npm run seed
   ```

5. **Acessar o App**
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API (Backend)**: [http://localhost:3001](http://localhost:3001)

---

## 🔐 Credenciais de Demo

Para testar as diferentes visões do sistema, utilize as seguintes contas:

| Perfil | E-mail | Senha |
|---|---|---|
| **Administrador** | `admin@clinicos.com` | `admin123` |
| **Recepcionista** | `marina.recep@clinicos.com` | `recep123` |
| **Médico** | `augusto.ferreira@clinicos.com` | `medico123` |

---

## ✨ Funcionalidades Principais

- **Role-Based Access Control (RBAC)**: Dashboards específicos para Admin, Recepcionista e Médico.
- **Gestão de Agendamentos**: Sistema inteligente de marcação de consultas com verificação de conflitos de horário.
- **Corpo Clínico**: Cadastro de médicos e especialidades.
- **Gestão de Pacientes**: Prontuário básico e histórico de consultas.
- **Interface Responsiva**: Adaptado para Desktop e Mobile com Sidebar tipo "Drawer".
- **Real-time Feedback**: Notificações e estados de carregamento (Skeletons).

---

Desenvolvido com foco em performance, estética e usabilidade.
