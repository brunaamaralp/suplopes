import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, CheckCircle } from 'lucide-react';
import logoUrl from '../assets/logo.png';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este email já está cadastrado');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-main">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-positive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-positive" />
          </div>
          <h2 className="text-2xl font-bold text-textPrimary mb-2">Conta criada!</h2>
          <p className="text-textSecondary mb-8">
            Enviamos um link de confirmação para <strong className="text-textPrimary">{email}</strong>. 
            Verifique sua caixa de entrada.
          </p>
          <button
            onClick={onSwitchToLogin}
            className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-all"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 sidebar-bg items-center justify-center p-12">
        <div className="text-center">
          <img
            src={logoUrl}
            alt="Supermercado Lopes"
            className="w-64 mx-auto mb-8"
          />
          <h1 className="text-2xl font-semibold text-white/90 mb-2">
            Sistema de Controle Financeiro
          </h1>
          <p className="text-white/60 text-sm">
            Gerencie suas finanças de forma simples e eficiente
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-main">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <img
              src={logoUrl}
              alt="Supermercado Lopes"
              className="h-16 mx-auto"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-textPrimary">Criar conta</h2>
            <p className="text-textSecondary mt-1">Preencha os dados para começar</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-input border border-border rounded-lg text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-textSecondary text-sm">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
