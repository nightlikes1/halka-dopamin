// Oturum ViewModel'i: giriş, kayıt, çıkış ve açılışta oturumu geri yükleme
import { useCallback, useEffect } from 'react';
import { strings } from '@core/i18n/tr';
import type { LoginInput, RegisterInput } from '@features/auth/domain/entities';
import { useAuthStore } from '@features/auth/presentation/useAuthStore';
import { useDI } from '@presentation/providers/DIProvider';
import { showMessage } from '@presentation/utils/dialogs';

// Başarılıysa null, değilse kullanıcıya gösterilecek hata mesajı döner
type SubmitResult = string | null;

export function useAuth() {
  const { auth } = useDI();
  const session = useAuthStore((s) => s.session);
  const setSession = useAuthStore((s) => s.setSession);

  const login = useCallback(
    async (input: LoginInput): Promise<SubmitResult> => {
      const result = await auth.login.execute(input);
      if (!result.ok) return result.error.message;
      setSession(result.value);
      return null;
    },
    [auth, setSession],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<SubmitResult> => {
      const result = await auth.register.execute(input);
      if (!result.ok) return result.error.message;
      setSession(result.value);
      return null;
    },
    [auth, setSession],
  );

  const logout = useCallback(async () => {
    await auth.logout.execute();
    setSession(null);
  }, [auth, setSession]);

  const forgotPassword = useCallback(
    async (email: string): Promise<SubmitResult> => {
      const result = await auth.forgotPassword.execute({ email });
      if (!result.ok) return result.error.message;
      return null;
    },
    [auth],
  );

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<SubmitResult> => {
      const result = await auth.resetPassword.execute({ token, password });
      if (!result.ok) return result.error.message;
      return null;
    },
    [auth],
  );

  return {
    session,
    user: session?.user ?? null,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };
}

// Kök bileşende bir kez kullanılır
export function useSessionRestore(): void {
  const { auth } = useDI();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    let cancelled = false;
    void auth.restore.execute().then((result) => {
      if (!cancelled) setSession(result.ok ? result.value : null);
    });

    // Sunucu oturumu reddederse kullanıcıyı nazikçe giriş ekranına al
    auth.setUnauthorizedListener(() => {
      void auth.logout.execute().then(() => {
        setSession(null);
        showMessage(strings.common.appName, strings.errors.sessionExpired);
      });
    });

    return () => {
      cancelled = true;
      auth.setUnauthorizedListener(null);
    };
  }, [auth, setSession]);
}
