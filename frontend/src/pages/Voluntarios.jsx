import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErroMensagem from '../components/ErroMensagem';

const disponibilidades = ['manha', 'tarde', 'noite', 'integral', 'fins_de_semana'];

export default function Voluntarios() {
  const { isAutenticado, isGestor } = useAuth();
  const [voluntarios, setVoluntarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState({ cidade: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', habilidades: '', disponibilidade: 'integral', cidade: '', estado: 'RS' });
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    setLoading(true);
    setErro('');
    try {
      const params = {};
      if (filtros.cidade) params.cidade = filtros.cidade;
      if (filtros.status) params.status = filtros.status;
      const { data } = await api.get('/voluntarios', { params });
      setVoluntarios(data);
    } catch {
      setErro('Não foi possível carregar os voluntários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [filtros]);

  async function handleCriar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post('/voluntarios', form);
      setShowForm(false);
      setForm({ nome: '', email: '', telefone: '', habilidades: '', disponibilidade: 'integral', cidade: '', estado: 'RS' });
      setSucesso('Voluntário cadastrado com sucesso!');
      setTimeout(() => setSucesso(''), 4000);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao cadastrar voluntário.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🤝 Voluntários</h1>
          <p className="text-gray-500 text-sm mt-1">Cadastre-se ou encontre voluntários disponíveis</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Quero Voluntariar'}
        </button>
      </div>

      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
          ✅ {sucesso}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCriar} className="card mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="col-span-full font-semibold text-gray-700">Cadastro de Voluntário</h2>
          <input className="input-field" placeholder="Nome completo *" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
          <input className="input-field" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="input-field" placeholder="Telefone / WhatsApp" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
          <input className="input-field" placeholder="Habilidades (Ex: Enfermagem, Logística)" value={form.habilidades} onChange={e => setForm(f => ({ ...f, habilidades: e.target.value }))} />
          <input className="input-field" placeholder="Cidade *" value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} required />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Disponibilidade</label>
            <select className="input-field" value={form.disponibilidade} onChange={e => setForm(f => ({ ...f, disponibilidade: e.target.value }))}>
              {disponibilidades.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="col-span-full flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary">{salvando ? 'Salvando...' : 'Cadastrar'}</button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input className="input-field max-w-xs" placeholder="Filtrar por cidade..." value={filtros.cidade} onChange={e => setFiltros(f => ({ ...f, cidade: e.target.value }))} />
        <select className="input-field max-w-xs" value={filtros.status} onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}>
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="alocado">Alocado</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && erro && <ErroMensagem mensagem={erro} onRetry={carregar} />}

      {!loading && !erro && (
        <>
          <p className="text-sm text-gray-500 mb-3">{voluntarios.length} voluntário(s) encontrado(s)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voluntarios.map(v => (
              <div key={v.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{v.nome}</h3>
                  <StatusBadge status={v.status} />
                </div>
                {v.habilidades && <p className="text-sm text-blue-700 mb-1">🎯 {v.habilidades}</p>}
                <p className="text-sm text-gray-500">{v.cidade} — {v.estado}</p>
                <p className="text-sm text-gray-500 capitalize">⏰ {v.disponibilidade.replace('_', ' ')}</p>
                {v.telefone && <p className="text-sm text-gray-500 mt-1">📞 {v.telefone}</p>}
                {v.status === 'alocado' && v.abrigo_nome && (
                  <p className="text-sm text-green-700 mt-2">🏠 Alocado em: {v.abrigo_nome}</p>
                )}
              </div>
            ))}
          </div>
          {voluntarios.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-5xl mb-3">🤝</p>
              <p>Nenhum voluntário encontrado.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
