import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

interface AccessDeniedScreenProps {
  message?: string;
  isUnauthenticated?: boolean;
}

export default function AccessDeniedScreen({ message = 'Access Denied', isUnauthenticated = false }: AccessDeniedScreenProps) {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        {isUnauthenticated ? (
          <Button
            onClick={handleLogin}
            disabled={loginStatus === 'logging-in'}
            className="px-6 py-2"
          >
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Login to Continue'}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Please contact an administrator if you believe this is an error.
          </p>
        )}
      </div>
    </div>
  );
}
