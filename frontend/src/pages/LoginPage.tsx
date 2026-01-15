/**
 * Login Page
 *
 * Simple wrapper page for the LoginForm component
 */

import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return <LoginForm />;
};

export default LoginPage;
