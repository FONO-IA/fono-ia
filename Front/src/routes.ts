import { createElement } from "react";
import { createBrowserRouter } from "react-router";
import { EntryPortal } from "./app/EntryPortal";
import { CadastroFonoPage } from "./app/CadastroFonoPage";
import { ChildLogin } from "./app/ChildLogin";
import { AdminDashboard } from "./app/AdminDashboard";
import { AddPatient } from "./app/AddPatient";
import { PatientProgress } from "./app/PatientProgress";
import { ChildExercise } from "./app/ChildExercise";
import { AddExercise } from "./app/AddExercise";
import { ChildExerciseList } from "./app/ChildExerciseList";
import { GamifiedFeedback } from "./app/GamifiedFeedback";
import { ProtectedRoute, PublicRoute } from "./routes/ProtectedRoute";

import { SettingsPerfil } from "./app/components/settings/SettingsPerfil";
import { SettingsNotificacoes } from "./app/components/settings/SettingsNotificacoes";
import { SettingsPrivacidade } from "./app/components/settings/SettingsPrivacidade";
import { SettingsPlano } from "./app/components/settings/SettingsPlano";
import { SettingsSuporte } from "./app/components/settings/SettingsSuporte";
import { SettingsSair } from "./app/components/settings/SettingsSair";

export const router = createBrowserRouter([
  {
    element: createElement(PublicRoute),
    children: [
      {
        path: "/",
        Component: EntryPortal,
      },
      {
        path: "/child-login",
        Component: ChildLogin,
      },
    ],
  },
  {
    path: "/cadastro-fono",
    Component: CadastroFonoPage,
  },

  {
    element: createElement(ProtectedRoute, {
      allowedRoles: ["profissional", "fonoaudiologo"],
    }),
    children: [
      {
        path: "/admin",
        Component: AdminDashboard,
      },
      {
        path: "/add-patient",
        Component: AddPatient,
      },
      {
        path: "/add-exercise",
        Component: AddExercise,
      },
      {
        path: "/patient/:id",
        Component: PatientProgress,
      },
      {
        path: "/feedback/:state",
        Component: GamifiedFeedback,
      },
      {
        path: "/exercise",
        Component: ChildExercise,
      },
      {
        path: "/settings/perfil",
        Component: SettingsPerfil,
      },
      {
        path: "/settings/notificacoes",
        Component: SettingsNotificacoes,
      },
      {
        path: "/settings/privacidade",
        Component: SettingsPrivacidade,
      },
      {
        path: "/settings/plano",
        Component: SettingsPlano,
      },
      {
        path: "/settings/suporte",
        Component: SettingsSuporte,
      },
      {
        path: "/settings/sair",
        Component: SettingsSair,
      },
    ],
  },

  {
    element: createElement(ProtectedRoute, {
      allowedRoles: ["profissional", "fonoaudiologo", "responsavel", "paciente"],
    }),
    children: [
      {
        path: "/child/exercise/:exerciseId",
        Component: ChildExercise,
      },
      {
        path: "/exercise/:exerciseId",
        Component: ChildExercise,
      },
    ],
  },

  {
    element: createElement(ProtectedRoute, {
      allowedRoles: ["responsavel", "paciente"],
    }),
    children: [
      {
        path: "/child/home",
        Component: ChildExerciseList,
      },
    ],
  },
]);
