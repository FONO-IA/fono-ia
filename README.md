# FONO-IA

O **FONO-IA** é uma plataforma de apoio fonoaudiológico voltada para o acompanhamento de pacientes, criação de exercícios terapêuticos, execução de atividades de fala e análise de progresso.

A solução tem como objetivo auxiliar fonoaudiólogos no processo de acompanhamento clínico, permitindo o cadastro de pacientes, vínculo com responsáveis, criação de exercícios personalizados e acompanhamento da evolução por meio de dados e registros de atividades.

---

## 📌 Sobre o projeto

O FONO-IA foi desenvolvido como uma solução full stack para apoiar o trabalho de profissionais da fonoaudiologia, especialmente no acompanhamento de crianças em processo de desenvolvimento ou reabilitação da fala.

A plataforma possui dois fluxos principais:

- **Profissional/Fonoaudiólogo**
  - Cadastro e gerenciamento de pacientes
  - Cadastro de responsáveis
  - Criação de exercícios terapêuticos
  - Acompanhamento do progresso dos pacientes
  - Visualização dos exercícios cadastrados

- **Responsável/Paciente**
  - Acesso aos pacientes vinculados ao responsável
  - Visualização dos exercícios cadastrados
  - Execução dos exercícios
  - Captura de áudio pelo microfone
  - Acompanhamento das atividades realizadas

---

## 🚀 Tecnologias utilizadas

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- PostgreSQL
- drf-yasg / Swagger
- CORS Headers

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Motion/Framer Motion

---

## 🧠 Funcionalidades principais

### Autenticação

- Login de profissional
- Login de responsável/paciente
- Autenticação via JWT
- Rotas protegidas
- Logout com limpeza de dados locais
- Controle de acesso por tipo de usuário

### Profissional

- Dashboard do fonoaudiólogo
- Cadastro de pacientes
- Seleção de responsável cadastrado ao adicionar paciente
- Cadastro de exercícios
- Adição de múltiplas palavras ao exercício
- Visualização do progresso do paciente
- Acesso aos exercícios cadastrados do paciente

### Responsável/Paciente

- Home do paciente
- Listagem de pacientes vinculados ao responsável
- Listagem de exercícios por paciente
- Acesso à tela de execução do exercício
- Captura de áudio com microfone
- Feedback visual de gravação
- Logout com botão “Sair”

### Progresso do paciente

- Exibição de exercícios cadastrados
- Cards de progresso
- Status de exercícios
- Integração com sessões/resultados, quando disponíveis
- Responsividade ajustada para mobile e desktop

---

## 📁 Estrutura geral do projeto

```txt
fono-ia/
│
├── Back/
│   ├── fono_api/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── apps/
│   │   ├── fonoaudiologo/
│   │   ├── responsavel/
│   │   ├── paciente/
│   │   ├── exercicio/
│   │   ├── resultado/
│   │   └── core/
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── Front/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── routes/
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
