## Projeto Integrador 4

## Descrição do Projeto

Sistema de Gerenciamento de Perguntas e Informações. Propomos a criação de um Quiz Interativo com foco na análise de habilidades e comportamentos de iniciantes no mundo da tecnologia, especialmente voltado para a preparação para a Olimpíada Brasileira de Informática (OBI). O quiz simula desafios práticos e teóricos, oferecendo aos participantes uma forma de identificar suas competências, pontos a melhorar e as estratégias de estudo mais eficazes para a competição.

---

## Tecnologias Utilizadas

### Frontend
- **ReactJS**: Biblioteca para construção de interfaces de usuário.
- **Typescript**: Superset do JavaScript que adiciona tipagem estática ao código.
- **TailwindCSS**: Framework para estilização rápida e eficiente.

### Backend
- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express**: Framework minimalista para criação de APIs.
- **Prisma**: ORM moderno para manipulação do banco de dados.
- **SQLite**: Banco de dados leve e simples, ideal para projetos de pequeno a médio porte.

---

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas antes de começar:

- **Node.js** (versão 14.x.x ou superior)
  - [Download Node.js](https://nodejs.org/)

---

## Instalação

### 1. Clone o repositório

Para clonar o repositório do projeto, execute o seguinte comando no terminal:

```bash
git clone https://github.com/carlos-aldrim/ProjetoIntegrador4.git
```

### 2. Instale as dependências

#### Frontend

```bash
cd ProjetoIntegrador4 && cd frontend && npm install
```

#### Backend

```bash
cd ProjetoIntegrador4 && cd backend && npm install
```

### 3. Configure o banco de dados

Rode as migrations para configurar o esquema do banco de dados:

```bash
cd backend && npx prisma migrate dev
```

---

## Atualização de Migrations

Caso haja alterações no esquema do banco de dados, siga os passos abaixo:

1. **Resetar o banco de dados** (⚠️ Isso apagará todos os dados existentes):

```bash
cd backend && npx prisma migrate reset
```

2. **Gerar novas migrations**:

Após ajustar o schema do Prisma, execute:

```bash
cd backend && npx prisma migrate dev
```

---

## Configuração do `.env`

Para configurar variáveis de ambiente, crie um arquivo `.env` na raiz da pasta `backend` com o seguinte conteúdo:

```env
JWT_SECRET=e00c58a52af16ecc4c4a7b2a8b8f931d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu email
EMAIL_PASS=senha de aplicativo
```

Substitua os valores das variáveis `EMAIL_USER` e `EMAIL_PASS` com suas próprias informações. Para gerar a **senha de aplicativo**, siga as instruções no [site do Google](https://support.google.com/accounts/answer/185833?hl=pt-BR).

---

## Execução do Sistema

### 💻 Frontend

Para iniciar o servidor do frontend:

```bash
cd frontend && npm run dev
```

Por padrão, o sistema estará disponível em: [http://localhost:5173/](http://localhost:5173/)

### ⚙ Backend

Para iniciar o servidor do backend:

```bash
cd backend && npm run dev
```

Por padrão, a API estará disponível em: [http://localhost:3000/](http://localhost:3000/)

---

## Visualizar o Banco de Dados (Opcional)

Use a interface gráfica do Prisma Studio para gerenciar os dados:

```bash
cd backend && npx prisma studio
```

Acesse no navegador: [http://localhost:5555/](http://localhost:5555/)

---

## Estrutura de Pastas do Projeto

```plaintext
ProjetoIntegrador2/
├── frontend/        # Aplicação React (Frontend)
│   ├── public/      # Arquivos estáticos
│   ├── src/         # Código fonte
│   └── ...
├── backend/         # API Node.js (Backend)
│   ├── prisma/      # Arquivos do Prisma (schema, migrations)
│   ├── src/         # Código fonte
│   └── ...
└── README.md        # Documentação do projeto
```

---

## Funcionalidades Principais

- Cadastro de usuários com validação de dados.
- Listagem e gerenciamento de informações cadastradas.
- Integração entre frontend e backend com rotas otimizadas.

---

## Contribuição

Contribuições são bem-vindas! Siga os passos abaixo para colaborar:

1. Faça um fork do projeto.
2. Clone o repositório do fork:

```bash
git clone https://github.com/seu-usuario/ProjetoIntegrador2.git
```

3. Crie uma branch com a feature/correção desejada:

O padrão de nome para branches de feature utiliza o prefixo "feature/US" seguido de seis dígitos, representando o número da User Story correspondente. Exemplo:

```bash
git checkout -b feature/US000001
```

4. Commit suas alterações:

```bash
git commit -m 'US000001 - Implementação da funcionalidade de Cadastro de Usuários.'
```

5. Faça o push para sua branch:

```bash
git push origin feature/US000001
```

6. Abra um Pull Request no repositório original.

---
