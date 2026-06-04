import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarStats() {
      try {
        const [abrigos, doacoes, voluntarios, desaparecidos] = await Promise.all([
          api.get('/abrigos'),
          api.get('/doacoes'),
          api.get('/voluntarios'),
          api.get('/desaparecidos'),
        ]);

        const abrigosData = abrigos.data;
        const abrigosAtivos = abrigosData.filter(a => a.status === 'ativo').length;
        const vagasTotal = abrigosData.reduce((sum, a) => sum + Math.max(0, a.capacidade_total - a.ocupacao_atual), 0);
        const doacoesCriticas = doacoes.data.filter(d => d.urgencia === 'critica' && d.status !== 'atendido').length;
        const voluntariosDisp = voluntarios.data.filter(v => v.status === 'disponivel').length;
        const desaparecidosAtivos = desaparecidos.data.filter(d => d.status === 'desaparecido').length;

        setStats({
          abrigosAtivos,
          vagasTotal,
          doacoesCriticas,
          voluntariosDisp,
          desaparecidosAtivos,
          totalAbrigos: abrigosData.length,
        });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    carregarStats();
  }, []);

  const cards = [
    {
      to: '/abrigos',
      emoji: '🏠',
      titulo: 'Abrigos',
      descricao: 'Encontre abrigos disponíveis com vagas perto de você',
      stat: stats ? `${stats.abrigosAtivos} ativos • ${stats.vagasTotal} vagas` : null,
      cor: 'bg-blue-600',
    },
    {
      to: '/doacoes',
      emoji: '📦',
      titulo: 'Doações',
      descricao: 'Veja o que está sendo necessitado com urgência em cada abrigo',
      stat: stats ? `${stats.doacoesCriticas} itens críticos` : null,
      cor: stats?.doacoesCriticas > 0 ? 'bg-red-600' : 'bg-green-600',
    },
    {
      to: '/voluntarios',
      emoji: '🤝',
      titulo: 'Voluntários',
      descricao: 'Cadastre-se como voluntário ou veja quem está disponível',
      stat: stats ? `${stats.voluntariosDisp} disponíveis` : null,
      cor: 'bg-teal-600',
    },
    {
      to: '/desaparecidos',
      emoji: '🔍',
      titulo: 'Desaparecidos',
      descricao: 'Registre ou busque informações sobre pessoas desaparecidas',
      stat: stats ? `${stats.desaparecidosAtivos} sendo procurados` : null,
      cor: stats?.desaparecidosAtivos > 0 ? 'bg-orange-600' : 'bg-purple-600',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl text-white p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">🌊 HelpEnchentes</h1>
        <p className="text-blue-100 text-lg max-w-2xl">
          Plataforma de apoio para situações de enchente. Encontre abrigos, organize doações,
          cadastre voluntários e registre desaparecidos — tudo em um só lugar.
        </p>
      </div>

      {loading && <LoadingSpinner mensagem="Carregando informações..." />}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className="card hover:shadow-md transition-shadow group">
              <div className={`${card.cor} text-white text-3xl w-14 h-14 rounded-xl flex items-center justify-center mb-3`}>
                {card.emoji}
              </div>
              <h2 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                {card.titulo}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{card.descricao}</p>
              {card.stat && (
                <p className="text-blue-600 text-sm font-medium mt-2">{card.stat}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Avisos */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Em situação de emergência</h3>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Ligue para o <strong>Corpo de Bombeiros: 193</strong></li>
          <li>• SAMU: <strong>192</strong></li>
          <li>• Defesa Civil: <strong>199</strong></li>
          <li>• Emergência Geral: <strong>190</strong></li>
        </ul>
      </div>
    </div>
  );
}
