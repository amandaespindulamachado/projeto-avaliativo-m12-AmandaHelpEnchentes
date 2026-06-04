import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(form.email, form.senha);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌊</div>
          <h1 className="text-2xl font-bold text-gray-900">HelpEnchentes</h1>
          <p className="text-gray-500 text-sm mt-1">Acesso restrito a gestores e voluntários</p>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.senha}
              onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Credenciais de demonstração:</p>
          <p>Gestor: gestor@helpenchentes.com / senha123</p>
          <p>Voluntário: joao@helpenchentes.com / senha123</p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/" className="text-blue-600 hover:underline">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}
