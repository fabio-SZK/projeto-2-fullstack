# TheCocktailDB Recreation - Fullstack SPA & API 

> Projeto acadêmico Fullstack desenvolvido para o curso de Engenharia de Software da Universidade Tecnológica Federal do Paraná (UTFPR).

Uma recriação simples da API TheCocktailDB. O ecossistema é composto por uma Single-Page Application (SPA) no Front-end e uma API RESTful segura no Back-end. O sistema permite a busca, listagem e o gerenciamento de coquetéis, garantindo alta performance com cache de dados e proteção contra as principais vulnerabilidades web.

---

## Funcionalidades

* **Autenticação e Segurança:** Sistema de login com persistência de token JWT. O Back-end intercepta requisições privadas e implementa defesas rigorosas contra ataques (XSS, CSRF, Rate Limiting para evitar força bruta e sanitização avançada).
* **Busca Dinâmica e Cache:** Pesquisa de coquetéis por nome ou ingrediente. O Back-end utiliza **Redis** para fazer o cache em memória das respostas da API, entregando resultados de busca quase instantâneos.
* **Formulário Reativo Interativo:** Tela de cadastro no Front-end com lista dinâmica (suportando até 15 ingredientes), cujos dados são validados e armazenados de forma persistente no **MongoDB**.
* **Comunicação Nativa:** Integração no Front-end 100% realizada com a **Fetch API** nativa, injetando automaticamente o cabeçalho `Authorization: Bearer`.
* **Monitoramento e Otimização:** Back-end estruturado com logs de acesso e erros (`winston` e `morgan`), além de compressão de respostas HTTP.

---

## 🛠️ Tecnologias Utilizadas

### Back-end (API)
* **Node.js & Express (v5)** - Motor e roteamento do servidor.
* **MongoDB & Mongoose** - Banco de dados NoSQL e modelagem de dados.
* **Redis & express-redis-cache** - Sistema de cache para otimização de *endpoints*.
* **Segurança:** `jsonwebtoken`, `bcrypt`, `express-rate-limit`, `perfect-express-sanitizer`, `xss`, `csurf`.
* **Logging e Utils:** `winston`, `morgan`, `cors`, `compression`, `dotenv`.

### Front-end (SPA)
* **React 19 & Vite** - Construção e empacotamento da interface.
* **Material-UI (MUI v9) & Emotion** - Biblioteca de componentes visuais fluida e responsiva.
* **React Router DOM v7** - Gerenciamento de rotas e blindagem no lado do cliente.

---

## Pré-requisitos

Para rodar o projeto localmente, os seguintes serviços devem estar instalados e rodando na sua máquina:
1. **Node.js** (v18+ recomendado).
2. **MongoDB** (Rodando localmente ou via conexão Atlas).
3. **Redis** (Rodando localmente na porta padrão 6379).
4. **OpenSSL** (Para geração dos certificados locais do Back-end).

---

## Como Executar o Projeto

O projeto é dividido em dois ambientes. É necessário rodar o Back-end e o Front-end simultaneamente em terminais separados.

### 1. Iniciando o Back-end
Abra o primeiro terminal, navegue até a pasta do `backend` e execute:

```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente em .env
.env.example .env

# Crie a pasta para os certificados e gere a chave SSL local
mkdir certs
openssl req -nodes -new -x509 -keyout certs/server.key -out certs/server.cert -days 365

# Popule o banco de dados com os dados iniciais
npm run seed

# Inicie o servidor de desenvolvimento
npm run dev

```

O servidor HTTPS estará escutando na porta `3000`. O arquivo `.env` gerado a partir do `.env.example` já contém as portas padrão do MongoDB (`27017`) e Redis (`6379`), além da origem liberada para o CORS (`http://localhost:3001`).


### 2. Iniciando o Front-end

Abra um segundo terminal, navegue até a pasta do `frontend` e execute:

```bash
# Instale as dependências
npm install

# Inicie o servidor Vite
npm run dev

```

A aplicação estará disponível no navegador em `https://localhost:3001` A partir daqui, toda a comunicação com a API ocorrerá automaticamente.


---

## Autores

Fábio - https://github.com/fabio-SZK/

Alefh - https://github.com/alefhbr123/

```
