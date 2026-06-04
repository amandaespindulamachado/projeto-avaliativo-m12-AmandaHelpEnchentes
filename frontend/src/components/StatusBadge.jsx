const statusConfig = {
  ativo: { label: 'Ativo', className: 'badge-ativo' },
  lotado: { label: 'Lotado', className: 'badge-lotado' },
  inativo: { label: 'Inativo', className: 'bg-gray-100 text-gray-600 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium' },
  desaparecido: { label: 'Desaparecido', className: 'badge-critica' },
  encontrado: { label: 'Encontrado', className: 'badge-ativo' },
  em_abrigo: { label: 'Em Abrigo', className: 'badge-media' },
  disponivel: { label: 'Disponível', className: 'badge-ativo' },
  alocado: { label: 'Alocado', className: 'badge-media' },
  pendente: { label: 'Pendente', className: 'badge-alta' },
  parcial: { label: 'Parcial', className: 'badge-media' },
  atendido: { label: 'Atendido', className: 'badge-ativo' },
  critica: { label: 'Crítica', className: 'badge-critica' },
  alta: { label: 'Alta', className: 'badge-alta' },
  media: { label: 'Média', className: 'badge-media' },
  baixa: { label: 'Baixa', className: 'badge-baixa' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'badge-baixa' };
  return <span className={config.className}>{config.label}</span>;
}
