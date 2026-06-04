import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AbrigoDetalhe() {
  const { id } = useParams();
  const { isAutenticado } = useAuth();
  const [abrigo, setAbrigo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [novaOcupacao, setNovaOcupacao] = useState('');
  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const { data } = await api.get(`/abrigos/${id}`);
      setAbrigo(data);
      setNovaOcupacao(data.ocupacao_atual);
    } catch {
      setAbrigo(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [id]);

  async function handleAtualizarOcupacao(e) {
    e.preventDefault();
    setAtualizando(true);
    try {
      await api.patch(`/abrigos/${id}/ocupacao`, { ocupacao_atual: Number(novaOcupacao) });
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao atualizar ocupação.');
    } finally {
      setAtualizando(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!abrigo) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Abrigo não encontrado.</p>
      <Link to="/abrigos" className="btn-secondary mt-4 inline-block">← Voltar</Link>
    </div>
  );

  const porcentagem = abrigo.capacidade_total > 0 ? Math.min(100, (abrigo.ocupacao_atual / abrigo.capacidade_total) * 100) : 0;

  return (
    <div className="max-w-3xl">
      <Link to="/abrigos" className="text-blue-600 text-sm hover:underline mb-4 inline-block">← Voltar para Abrigos</Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{abrigo.nome}</h1>
            <p className="text-gray-500">{abrigo.endereco}, {abrigo.cidade} — {abrigo.estado}</p>
          </div>
          <StatusBadge status={abrigo.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{abrigo.vagas_disponiveis}</p>
            <p className="text-xs text-gray-500">Vagas livres</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-700">{abrigo.ocupacao_atual}</p>
            <p className="text-xs text-gray-500">Ocupação atual</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-700">{abrigo.capacidade_total}</p>
            <p className="text-xs text-gray-500">Capacidade total</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-700">{Math.round(porcentagem)}%</p>
            <p className="text-xs text-gray-500">Ocupado</p>
          </div>
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all ${porcentagem >= 100 ? 'bg-red-500' : porcentagem > 80 ? 'bg-orange-500' : 'bg-blue-500'}`}
            style={{ width: `${porcentagem}%` }}
          />
        </div>

        {abrigo.contato && <p className="text-sm text-gray-600">📞 Contato: {abrigo.contato}</p>}
        {abrigo.responsavel && <p className="text-sm text-gray-600">👤 Responsável: {abrigo.responsavel}</p>}
        {abrigo.observacoes && <p className="text-sm text-gray-600 mt-2">📝 {abrigo.observacoes}</p>}

        {isAutenticado && (
          <form onSubmit={handleAtualizarOcupacao} className="mt-4 pt-4 border-t border-gray-100 flex gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Atualizar ocupação atual</label>
              <input
                type="number"
                min="0"
                max={abrigo.capacidade_total}
                className="input-field w-32"
                value={novaOcupacao}
                onChange={e => setNovaOcupacao(e.target.value)}
              />
            </div>
            <button type="submit" disabled={atualizando} className="btn-primary">
              {atualizando ? 'Salvando...' : 'Atualizar'}
            </button>
          </form>
        )}
      </div>

      {/* Doações necessárias */}
      <h2 className="font-bold text-lg mb-3">📦 Necessidades de Doação</h2>
      {abrigo.doacoes?.length === 0 ? (
        <div className="card text-center text-gray-400 py-6">Nenhuma necessidade registrada.</div>
      ) : (
        <div className="space-y-2">
          {abrigo.doacoes?.map(d => (
            <div key={d.id} className="card flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{d.descricao}</p>
                <p className="text-sm text-gray-500 capitalize">{d.categoria}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-700">{d.quantidade_recebida} / {d.quantidade_necessaria}</p>
                <p className="text-gray-400">recebidos</p>
              </div>
              <StatusBadge status={d.urgencia} />
              <StatusBadge status={d.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
