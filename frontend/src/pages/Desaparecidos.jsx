import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErroMensagem from '../components/ErroMensagem';

export default function Desaparecidos() {
  const { isAutenticado } = useAuth();
  const [desaparecidos, setDesaparecidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState({ cidade: '', status: '', nome: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: '', idade: '', descricao: '', ultimo_local_visto: '',
    cidade: '', estado: 'RS', data_desaparecimento: '', contato_familiar: '', nome_familiar: ''
  });
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    setLoading(true);
    setErro('');
    try {
      const params = {};
      if (filtros.cidade) params.cidade = filtros.cidade;
      if (filtros.status) params.status = filtros.status;
      if (filtros.nome) params.nome = filtros.nome;
      const { data } = await api.get('/desaparecidos', { params });
      setDesaparecidos(data);
    } catch {
      setErro('Não foi possível carregar os registros.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [filtros]);

  async function handleCriar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post('/desaparecidos', { ...form, idade: form.idade ? Number(form.idade) : undefined });
      setShowForm(false);
      setForm({ nome: '', idade: '', descricao: '', ultimo_local_visto: '', cidade: '', estado: 'RS', data_desaparecimento: '', contato_familiar: '', nome_familiar: '' });
      setSucesso('Registro cadastrado. Que seja encontrado(a) em breve!');
      setTimeout(() => setSucesso(''), 5000);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao registrar.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleAtualizarStatus(id, status) {
    const info = status !== 'desaparecido' ? prompt('Informações adicionais (opcional):') : null;
    try {
      await api.patch(`/desaparecidos/${id}/status`, { status, informacoes_encontrado: info });
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao atualizar status.');
    }
  }

  const statusCores = { desaparecido: 'border-red-200 bg-red-50', encontrado: 'border-green-200 bg-green-50', em_abrigo: 'border-yellow-200 bg-yellow-50' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔍 Pessoas Desaparecidas</h1>
          <p className="text-gray-500 text-sm mt-1">Registre ou busque informações sobre pessoas desaparecidas</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Registrar Desaparecido'}
        </button>
      </div>

      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
          ✅ {sucesso}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCriar} className="card mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="col-span-full font-semibold text-gray-700">⚠️ Registrar Pessoa Desaparecida</h2>
          <input className="input-field" placeholder="Nome da pessoa *" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
          <input className="input-field" type="number" placeholder="Idade (se souber)" value={form.idade} onChange={e => setForm(f => ({ ...f, idade: e.target.value }))} />
          <div className="col-span-full">
            <textarea className="input-field" rows={2} placeholder="Descrição física (roupas, características)" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>
          <div className="col-span-full">
            <input className="input-field" placeholder="Último local visto *" value={form.ultimo_local_visto} onChange={e => setForm(f => ({ ...f, ultimo_local_visto: e.target.value }))} required />
          </div>
          <input className="input-field" placeholder="Cidade *" value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} required />
          <input className="input-field" type="date" placeholder="Data do desaparecimento *" value={form.data_desaparecimento} onChange={e => setForm(f => ({ ...f, data_desaparecimento: e.target.value }))} required />
          <input className="input-field" placeholder="Seu nome (familiar/conhecido) *" value={form.nome_familiar} onChange={e => setForm(f => ({ ...f, nome_familiar: e.target.value }))} required />
          <input className="input-field" placeholder="Seu contato / telefone *" value={form.contato_familiar} onChange={e => setForm(f => ({ ...f, contato_familiar: e.target.value }))} required />
          <div className="col-span-full flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary">{salvando ? 'Registrando...' : 'Registrar'}</button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input className="input-field max-w-xs" placeholder="Buscar por nome..." value={filtros.nome} onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))} />
        <input className="input-field max-w-xs" placeholder="Filtrar por cidade..." value={filtros.cidade} onChange={e => setFiltros(f => ({ ...f, cidade: e.target.value }))} />
        <select className="input-field max-w-xs" value={filtros.status} onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}>
          <option value="">Todos os status</option>
          <option value="desaparecido">Desaparecidos</option>
          <option value="encontrado">Encontrados</option>
          <option value="em_abrigo">Em Abrigo</option>
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && erro && <ErroMensagem mensagem={erro} onRetry={carregar} />}

      {!loading && !erro && (
        <>
          <p className="text-sm text-gray-500 mb-3">{desaparecidos.length} registro(s) encontrado(s)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {desaparecidos.map(d => (
              <div key={d.id} className={`rounded-xl border p-4 ${statusCores[d.status] || 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{d.nome}</h3>
                    {d.idade && <p className="text-sm text-gray-600">{d.idade} anos</p>}
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                {d.descricao && <p className="text-sm text-gray-700 mb-2">📋 {d.descricao}</p>}
                <p className="text-sm text-gray-600">📍 Último local: <span className="font-medium">{d.ultimo_local_visto}</span></p>
                <p className="text-sm text-gray-600">🏙️ {d.cidade} — {d.estado}</p>
                <p className="text-sm text-gray-600">📅 {new Date(d.data_desaparecimento).toLocaleDateString('pt-BR')}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Contato familiar: {d.nome_familiar}</p>
                  <p className="text-sm text-blue-700 font-medium">📞 {d.contato_familiar}</p>
                </div>
                {d.informacoes_encontrado && (
                  <p className="text-sm text-green-700 mt-2">ℹ️ {d.informacoes_encontrado}</p>
                )}
                {isAutenticado && d.status === 'desaparecido' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleAtualizarStatus(d.id, 'encontrado')} className="text-xs btn-primary">✅ Marcar Encontrado</button>
                    <button onClick={() => handleAtualizarStatus(d.id, 'em_abrigo')} className="text-xs btn-secondary">🏠 Em Abrigo</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {desaparecidos.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-5xl mb-3">🔍</p>
              <p>Nenhum registro encontrado.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
