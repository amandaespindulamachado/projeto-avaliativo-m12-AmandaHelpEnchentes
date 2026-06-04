import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { isAutenticado, usuario } = useAuth();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAutenticado) return;
    async function carregar() {
      try {
        const [abrigos, doacoes, voluntarios, desaparecidos] = await Promise.all([
          api.get('/abrigos'),
          api.get('/doacoes'),
          api.get('/voluntarios'),
          api.get('/desaparecidos'),
        ]);

        setDados({
          abrigos: abrigos.data,
          doacoes: doacoes.data,
          voluntarios: voluntarios.data,
          desaparecidos: desaparecidos.data,
        });
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [isAutenticado]);

  if (!isAutenticado) return <Navigate to="/login" replace />;
  if (loading) return <LoadingSpinner />;

  const { abrigos, doacoes, voluntarios, desaparecidos } = dados;

  const stats = [
    { label: 'Abrigos ativos', valor: abrigos.filter(a => a.status === 'ativo').length, total: abrigos.length, link: '/abrigos', cor: 'bg-blue-500' },
    { label: 'Vagas disponíveis', valor: abrigos.reduce((s, a) => s + a.vagas_disponiveis, 0), total: abrigos.reduce((s, a) => s + a.capacidade_total, 0), link: '/abrigos', cor: 'bg-teal-500' },
    { label: 'Itens críticos', valor: doacoes.filter(d => d.urgencia === 'critica' && d.status !== 'atendido').length, total: doacoes.length, link: '/doacoes', cor: 'bg-red-500' },
    { label: 'Voluntários disponíveis', valor: voluntarios.filter(v => v.status === 'disponivel').length, total: voluntarios.length, link: '/voluntarios', cor: 'bg-green-500' },
    { label: 'Desaparecidos buscados', valor: desaparecidos.filter(d => d.status === 'desaparecido').length, total: desaparecidos.length, link: '/desaparecidos', cor: 'bg-orange-500' },
    { label: 'Encontrados / Em abrigo', valor: desaparecidos.filter(d => d.status !== 'desaparecido').length, total: desaparecidos.length, link: '/desaparecidos', cor: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 Painel de Controle</h1>
        <p className="text-gray-500 text-sm">Bem-vindo(a), <span className="font-medium">{usuario.nome}</span> — perfil: {usuario.perfil}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <Link key={i} to={s.link} className="card hover:shadow-md transition-shadow">
            <div className={`${s.cor} text-white text-2xl font-bold w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
              {s.valor}
            </div>
            <p className="font-medium text-gray-900">{s.label}</p>
            <p className="text-sm text-gray-400">{s.total} no total</p>
          </Link>
        ))}
      </div>

      {/* Itens críticos */}
      {doacoes.filter(d => d.urgencia === 'critica' && d.status !== 'atendido').length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-red-700 mb-3">🚨 Necessidades Críticas</h2>
          <div className="space-y-2">
            {doacoes.filter(d => d.urgencia === 'critica' && d.status !== 'atendido').map(d => (
              <div key={d.id} className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-red-900">{d.descricao}</p>
                  <p className="text-sm text-red-600">{d.abrigo_nome} — {d.abrigo_cidade}</p>
                </div>
                <p className="text-sm text-red-700 font-medium">{d.quantidade_recebida}/{d.quantidade_necessaria}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desaparecidos recentes */}
      {desaparecidos.filter(d => d.status === 'desaparecido').length > 0 && (
        <div>
          <h2 className="font-bold text-orange-700 mb-3">🔍 Desaparecidos Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {desaparecidos.filter(d => d.status === 'desaparecido').slice(0, 4).map(d => (
              <div key={d.id} className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                <p className="font-medium text-orange-900">{d.nome}{d.idade ? `, ${d.idade} anos` : ''}</p>
                <p className="text-sm text-orange-600">{d.ultimo_local_visto} — {d.cidade}</p>
                <p className="text-sm text-orange-700">📞 {d.contato_familiar}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
