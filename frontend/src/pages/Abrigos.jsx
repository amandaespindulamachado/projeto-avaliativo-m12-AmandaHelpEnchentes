import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErroMensagem from '../components/ErroMensagem';

const statusOpcoes = ['', 'ativo', 'lotado', 'inativo'];

export default function Abrigos() {
  const { isAutenticado } = useAuth();
  const [abrigos, setAbrigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState({ cidade: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', endereco: '', cidade: '', estado: 'RS', capacidade_total: '', contato: '', responsavel: '' });
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setLoading(true);
    setErro('');
    try {
      const params = {};
      if (filtros.cidade) params.cidade = filtros.cidade;
      if (filtros.status) params.status = filtros.status;
      const { data } = await api.get('/abrigos', { params });
      setAbrigos(data);
    } catch {
      setErro('Não foi possível carregar os abrigos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [filtros]);

  async function handleCriar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post('/abrigos', { ...form, capacidade_total: Number(form.capacidade_total) });
      setShowForm(false);
      setForm({ nome: '', endereco: '', cidade: '', estado: 'RS', capacidade_total: '', contato: '', responsavel: '' });
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao criar abrigo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏠 Abrigos</h1>
          <p className="text-gray-500 text-sm mt-1">Encontre abrigos disponíveis na sua região</p>
        </div>
        {isAutenticado && (
          <button onClick={() => setShowForm(v => !v)} className="btn-primary">
            {showForm ? 'Cancelar' : '+ Novo Abrigo'}
          </button>
        )}
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <form onSubmit={handleCriar} className="card mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="col-span-full font-semibold text-gray-700">Novo Abrigo</h2>
          <input className="input-field" placeholder="Nome*" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
          <input className="input-field" placeholder="Endereço*" value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} required />
          <input className="input-field" placeholder="Cidade*" value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} required />
          <input className="input-field" placeholder="Estado" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} />
          <input className="input-field" type="number" placeholder="Capacidade total" value={form.capacidade_total} onChange={e => setForm(f => ({ ...f, capacidade_total: e.target.value }))} />
          <input className="input-field" placeholder="Contato / Telefone" value={form.contato} onChange={e => setForm(f => ({ ...f, contato: e.target.value }))} />
          <input className="input-field" placeholder="Responsável" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} />
          <div className="col-span-full flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary">{salvando ? 'Salvando...' : 'Cadastrar Abrigo'}</button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="input-field max-w-xs"
          placeholder="Filtrar por cidade..."
          value={filtros.cidade}
          onChange={e => setFiltros(f => ({ ...f, cidade: e.target.value }))}
        />
        <select
          className="input-field max-w-xs"
          value={filtros.status}
          onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">Todos os status</option>
          {statusOpcoes.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && erro && <ErroMensagem mensagem={erro} onRetry={carregar} />}

      {!loading && !erro && (
        <>
          <p className="text-sm text-gray-500 mb-3">{abrigos.length} abrigo(s) encontrado(s)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {abrigos.map(abrigo => (
              <Link key={abrigo.id} to={`/abrigos/${abrigo.id}`} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{abrigo.nome}</h3>
                  <StatusBadge status={abrigo.status} />
                </div>
                <p className="text-gray-500 text-sm">{abrigo.endereco}</p>
                <p className="text-gray-500 text-sm">{abrigo.cidade} — {abrigo.estado}</p>
                {abrigo.contato && <p className="text-gray-500 text-sm mt-1">📞 {abrigo.contato}</p>}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium text-blue-700">{abrigo.vagas_disponiveis}</span>
                    <span className="text-gray-500"> / {abrigo.capacidade_total} vagas</span>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${abrigo.status === 'lotado' ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, abrigo.capacidade_total > 0 ? (abrigo.ocupacao_atual / abrigo.capacidade_total) * 100 : 0)}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {abrigos.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-5xl mb-3">🏠</p>
              <p>Nenhum abrigo encontrado com os filtros aplicados.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
