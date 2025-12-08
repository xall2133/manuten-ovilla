# Maintenance360 - Villa Privilege

Um sistema moderno de gestão de manutenção predial, desenvolvido com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Como Rodar Localmente

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/maintenance360.git
    cd maintenance360
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Rode o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

## 📦 Como Deployar no Vercel

1.  Envie este projeto para o seu GitHub.
2.  Acesse [vercel.com](https://vercel.com) e faça login.
3.  Clique em "Add New Project" e importe o repositório do GitHub.
4.  A Vercel detectará automaticamente que é um projeto **Vite**.
5.  Clique em **Deploy**.

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** React 18, Vite, TypeScript
*   **Estilização:** Tailwind CSS (via CDN para simplicidade neste template) e Lucide React (ícones)
*   **Gráficos:** Recharts
*   **Backend / Banco de Dados:** Supabase
*   **Roteamento:** React Router DOM

## 📂 Estrutura de Pastas

*   `components/`: Componentes UI reutilizáveis e Páginas.
*   `context/`: Gerenciamento de estado global (Dados, Autenticação, Tema).
*   `lib/`: Configurações de serviços externos (Supabase).
*   `types.ts`: Definições de tipos TypeScript.
