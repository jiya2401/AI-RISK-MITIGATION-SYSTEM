export default function ErrorMessage({ message }) {
  return (
    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="text-red-500 text-2xl">⚠️</div>
        <div>
          <h3 className="text-red-400 font-semibold mb-1">Error</h3>
          <p className="text-red-300 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
