import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErroMensagem from '../components/ErroMensagem';

const categorias = ['alimentos', 'roupas', 'higiene', 'medicamentos', 'utensilios', 'outros'];
const urgencias = ['critica', 'alta', 'media', 'baixa'];

export default function Doacoes() {
  const { isAutenticado } = useAuth();
  const [doacoes, setDoacoes] = useState([]);
  const [abrigos, setAbrigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState({ urgencia: '', categoria: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ abrigo_id: '', categoria: 'alimentos', descricao: '', quantidade_necessaria: 1, urgencia: 'media' });
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setLoading(true);
    setErro('');
    try {
      const params = {};
      if (filtros.urgencia) params.urgencia = filtros.urgencia;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.status) params.status = filtros.status;
      const [d, a] = await Promise.all([
        api.get('/doacoes', { params }),
        api.get('/abrigos'),
      ]);
      setDoacoes(d.data);
      setAbrigos(a.data);
    } catch {
      setErro('Não foi possível carregar as doações.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [filtros]);

  async function handleCriar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post('/doacoes', { ...form, abrigo_id: Number(form.abrigo_id), quantidade_necessaria: Number(form.quantidade_necessaria) });
      setShowForm(false);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao registrar necessidade.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleRegistrarRecebimento(id, quantidade) {
    try {
      await api.patch(`/doacoes/${id}/receber`, { quantidade });
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao registrar recebimento.');
    }
  }

  const urgenciaOrdem = { critica: 0, alta: 1, media: 2, baixa: 3 };
  const doacoesOrdenadas = [...doacoes].sort((a, b) => urgenciaOrdem[a.urgencia] - urgenciaOrdem[b.urgencia]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📦 Doações Necessárias</h1>
          <p className="text-gray-500 text-sm mt-1">Veja o que os abrigos precisam com mais urgência</p>
        </div>
        {isAutenticado && (
          <button onClick={() => setShowForm(v => !v)} className="btn-primary">
            {showForm ? 'Cancelar' : '+ Registrar Necessidade'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCriar} className="card mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="col-span-full font-semibold text-gray-700">Nova Necessidade de Doação</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Abrigo *</label>
            <select className="input-field" value={form.abrigo_id} onChange={e => setForm(f => ({ ...f, abrigo_id: e.target.value }))} required>
              <option value="">Selecione o abrigo</option>
              {abrigos.map(a => <option key={a.id} value={a.id}>{a.nome} — {a.cidade}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoria *</label>
            <select className="input-field" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
            <input className="input-field" placeholder="Ex: Caixas de leite integral 1L" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade necessária</label>
            <input type="number" min="1" className="input-field" value={form.quantidade_necessaria} onChange={e => setForm(f => ({ ...f, quantidade_necessaria: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Urgência</label>
            <select className="input-field" value={form.urgencia} onChange={e => setForm(f => ({ ...f, urgencia: e.target.value }))}>
              {urgencias.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="col-span-full flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary">{salvando ? 'Salvando...' : 'Registrar'}</button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="input-field max-w-xs" value={filtros.urgencia} onChange={e => setFiltros(f => ({ ...f, urgencia: e.target.value }))}>
          <option value="">Todas as urgências</option>
          {urgencias.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select className="input-field max-w-xs" value={filtros.categoria} onChange={e => setFiltros(f => ({ ...f, categoria: e.target.value }))}>
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field max-w-xs" value={filtros.status} onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}>
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="parcial">Parcial</option>
          <option value="atendido">Atendido</option>
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && erro && <ErroMensagem mensagem={erro} onRetry={carregar} />}

      {!loading && !erro && (
        <>
          <p className="text-sm text-gray-500 mb-3">{doacoes.length} item(s) encontrado(s)</p>
          <div className="space-y-3">
            {doacoesOrdenadas.map(d => (
              <div key={d.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900">{d.descricao}</h3>
                      <StatusBadge status={d.urgencia} />
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-sm text-gray-500 capitalize">{d.categoria} — {d.abrigo_nome}, {d.abrigo_cidade}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{d.quantidade_recebida}</span>
                        <span className="text-gray-400"> / {d.quantidade_necessaria} recebidos</span>
                      </div>
                      <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.status === 'atendido' ? 'bg-green-500' : d.urgencia === 'critica' ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, d.quantidade_necessaria > 0 ? (d.quantidade_recebida / d.quantidade_necessaria) * 100 : 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {isAutenticado && d.status !== 'atendido' && (
                    <button
                      onClick={() => {
                        const qtd = Number(prompt('Quantidade recebida agora:'));
                        if (qtd > 0) handleRegistrarRecebimento(d.id, qtd);
                      }}
                      className="btn-secondary text-sm"
                    >
                      + Receber
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {doacoes.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-5xl mb-3">📦</p>
              <p>Nenhuma necessidade encontrada.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
