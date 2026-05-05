import { FileText, BookOpen, Sparkles, Star, Brain } from 'lucide-react';

interface RecommendationCardProps {
  item: any;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: boolean;
}

export const RecommendationCard = ({ item, viewDetails, toggleFavorite, isFavorite }: RecommendationCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div className="flex gap-2">
        {item.type === 'article' ? (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-primary text-xs font-bold px-2.5 py-1 rounded border border-blue-200 uppercase tracking-wider">
            <FileText className="w-3 h-3" /> Artigo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded border border-yellow-200 uppercase tracking-wider">
            <BookOpen className="w-3 h-3" /> Livro
          </span>
        )}
        <span className="inline-flex items-center text-gray-500 text-xs font-medium px-2.5 py-1 rounded bg-gray-100">
          {item.source}
        </span>
      </div>
      <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-bold">
        <Sparkles className="w-3 h-3" /> {item.relevance}% Relevância
      </div>
    </div>

    <h3 className="text-xl font-bold text-primary-dark mb-2 leading-tight">{item.title}</h3>
    <p className="text-sm text-gray-500 mb-4">{item.authors} • {item.year}</p>
    <p className="text-gray-700 text-sm line-clamp-2 mb-4">{item.abstract}</p>

    {item.aiExplanation && (
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
        <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-primary font-medium italic">{item.aiExplanation}</p>
      </div>
    )}

    <div className="flex items-center gap-3">
      <button 
        onClick={() => viewDetails(item)}
        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm font-medium transition-colors"
      >
        Ver Detalhes
      </button>
      <button 
        onClick={() => toggleFavorite(item)}
        className={`flex items-center justify-center w-10 h-10 rounded border transition-colors cursor-pointer ${
          isFavorite 
            ? 'bg-blue-50 border-primary text-primary' 
            : 'bg-white border-gray-200 text-gray-400 hover:border-primary hover:text-primary'
        }`}
      >
        <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  </div>
);
