export default function ErroMensagem({ mensagem, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-700 font-medium">❌ {mensagem}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 btn-secondary text-sm">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
