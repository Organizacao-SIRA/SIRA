/* eslint-disable react-refresh/only-export-components -- arquivo de config de rotas: exporta `router`, não componentes para HMR */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { screenLoaders } from '../app/screenLoaders';
import { RootLayout } from './RootLayout';
import { AuthGate } from './AuthGate';
import { ProtectedLayout } from './ProtectedLayout';
import { AppShell } from './AppShell';

const Home = lazy(screenLoaders.home);
const Recommendations = lazy(screenLoaders.results);
const Details = lazy(screenLoaders.details);
const Catalog = lazy(screenLoaders.catalog);
const Favorites = lazy(screenLoaders.favorites);
const Profile = lazy(screenLoaders.profile);
const Login = lazy(screenLoaders.login);
const Register = lazy(screenLoaders.register);
const Onboarding = lazy(screenLoaders.onboarding);
const ForgotPassword = lazy(screenLoaders['forgot-password']);
const ResetPassword = lazy(screenLoaders['reset-password']);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <AuthGate />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
          { path: '/forgot-password', element: <ForgotPassword /> },
          { path: '/reset-password', element: <ResetPassword /> },
        ],
      },
      {
        element: <ProtectedLayout />,
        children: [
          { path: '/onboarding', element: <Onboarding /> },
          {
            element: <AppShell />,
            children: [
              { index: true, element: <Home /> },
              { path: '/buscar', element: <Recommendations /> },
              { path: '/catalogo', element: <Catalog /> },
              { path: '/favoritos', element: <Favorites /> },
              { path: '/material/:id', element: <Details /> },
              { path: '/perfil', element: <Profile /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
