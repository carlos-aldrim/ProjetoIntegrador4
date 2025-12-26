## Projeto Integrador 4

## Descrição do Projeto

Sistema de **Gerenciamento e Análise de Desempenho Escolar**, desenvolvido com o objetivo de centralizar, organizar e avaliar informações de estudantes. A plataforma permite o acompanhamento do desempenho educacional por meio de indicadores, registros e avaliações, oferecendo suporte à tomada de decisões pedagógicas. O sistema é voltado para instituições de ensino e educadores, possibilitando a análise de habilidades, progresso escolar e pontos de melhoria dos alunos.

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
git clone https://github.com/carlos-aldrim/ProjetoIntegrador2.git
```

### 2. Instale as dependências

#### Frontend

```bash
cd ProjetoIntegrador2
cd frontend
npm install
```

#### Backend

```bash
cd ProjetoIntegrador2
cd backend
npm install
```

### 3. Configure o banco de dados

Rode as migrations para configurar o esquema do banco de dados:

```bash
cd backend
npx prisma migrate dev
```

---

## Atualização de Migrations

Caso haja alterações no esquema do banco de dados, siga os passos abaixo:

1. **Resetar o banco de dados** (⚠️ Isso apagará todos os dados existentes):

```bash
cd backend
npx prisma migrate reset
```

2. **Gerar novas migrations**:

Após ajustar o schema do Prisma, execute:

```bash
cd backend
npx prisma migrate dev
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
cd frontend
npm start
```

Por padrão, o sistema estará disponível em: [http://localhost:5173/](http://localhost:5173/)

### ⚙ Backend

Para iniciar o servidor do backend:

```bash
cd backend
npm run dev
```

Por padrão, a API estará disponível em: [http://localhost:3000/](http://localhost:3000/)

---

## Visualizar o Banco de Dados (Opcional)

Use a interface gráfica do Prisma Studio para gerenciar os dados:

```bash
cd backend
npx prisma studio
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

## Atualização do Repositório (Git)

Para manter o projeto atualizado com o repositório remoto, utilize os comandos abaixo:

```bash
git status
git add .
git commit -m "descrição da alteração"
git pull origin master
git push origin master
```

---

## Rotas da API

### Autenticação e Registro

#### **1. Criar Novo Usuário**
`POST /usuario/new-user`  
Cadastra um novo usuário no sistema, incluindo dados pessoais e endereço.

**Exemplo de Corpo (JSON):**
```json
{
  "mail": "exemplo@email.com",
  "password": "senha_segura_123",
  "image": "[https://link-da-foto.com/perfil.jpg](https://link-da-foto.com/perfil.jpg)",
  "person": {
    "firstName": "João",
    "lastName": "Silva",
    "cpf": "123.456.789-00",
    "birthDate": "1990-05-15",
    "phone": "11988887777",
    "address": {
      "zipCode": "01234-567",
      "addressLine": "Rua das Flores",
      "addressLineNumber": "100",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP"
    }
  }
}
```

#### **2. Login (Solicitar Token)**
`POST /usuario/login`  
Valida as credenciais e envia um código de verificação de 6 dígitos para o e-mail do usuário.

**Exemplo de Corpo (JSON):**
```json
{
  "mail": "exemplo@email.com",
  "password": "senha_segura_123"
}
```

#### **3. Confirmar Token (Finalizar Login)**
`POST /usuario/confirm-token`  
Valida o código recebido por e-mail e retorna o Token JWT para autenticação.

**Exemplo de Corpo (JSON):**
```json
{
  "mail": "exemplo@email.com",
  "confirmToken": "123456"
}
```

### Gerenciamento de Usuário

#### **4. Obter Usuário Atual**
`GET /usuario/my`  
Retorna todos os dados do perfil do usuário autenticado no momento.

**Exemplo de Resposta (JSON):**
```json
{
  "id": "uuid-do-usuario",
  "mail": "exemplo@email.com",
  "isActive": true,
  "personId": "uuid-da-pessoa",
  "image": "url-da-imagem"
}
```

#### **5. Atualizar Usuário**
`POST /usuario/update-user`  
Permite atualizar dados cadastrais, senha ou informações da pessoa. O e-mail é obrigatório para identificação.

**Exemplo de Corpo (JSON):**
```json
{
  "mail": "exemplo@email.com",
  "isActive": true,
  "image": "nova-foto-perfil.png",
  "person": {
    "firstName": "João Atualizado",
    "phone": "11912345678"
  }
}
```

#### **6. Apagar Conta**
`GET /usuario/delete-user`  
Remove permanentemente a conta do usuário logado e todos os dados vinculados.

**Exemplo de Resposta (JSON):**
```json
{
  "message": "Conta apagada com sucesso"
}
```

---
