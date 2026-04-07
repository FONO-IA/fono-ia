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


import { SettingsPerfil } from "./app/components/settings/SettingsPerfil";
import { SettingsNotificacoes } from "./app/components/settings/SettingsNotificacoes";
import { SettingsPrivacidade } from "./app/components/settings/SettingsPrivacidade";
import { SettingsPlano } from "./app/components/settings/SettingsPlano";
import { SettingsSuporte } from "./app/components/settings/SettingsSuporte";
import { SettingsSair } from "./app/components/settings/SettingsSair";

export const router = createBrowserRouter([
  // ── Entry ──────────────────────────────────────────────────────────────────
  {
    path: "/",
    Component: EntryPortal,
  },
  // ── Professional ───────────────────────────────────────────────────────────
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/cadastro-fono",
    Component: CadastroFonoPage,
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
  // ── Settings ───────────────────────────────────────────────────────────────
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
  // ── Child / Patient ────────────────────────────────────────────────────────
  {
    path: "/child-login",
    Component: ChildLogin,
  },
  {
    path: "/child/home",
    Component: ChildExerciseList,
  },
  {
    path: "/child/exercise/:exerciseId",
    Component: ChildExercise,
  },
  // Legacy redirect (keep compatibility)
  {
    path: "/exercise",
    Component: ChildExercise,
  },
]);