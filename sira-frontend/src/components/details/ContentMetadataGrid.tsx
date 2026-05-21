import { Library, Link as LinkIcon, Tag } from 'lucide-react';
import { MetadataItem } from './MetadataItem';

interface ContentMetadataGridProps {
  doi?: string;
  isbn?: string;
  thematicArea?: string;
}

export const ContentMetadataGrid = ({ doi, isbn, thematicArea }: ContentMetadataGridProps) => {
  const hasAny = doi || isbn || thematicArea;
  if (!hasAny) return null;

  return (
    <section
      aria-labelledby="content-metadata-heading"
      className="bg-surface rounded-2xl border border-border shadow-sm p-5 sm:p-6"
    >
      <h2
        id="content-metadata-heading"
        className="text-xs font-bold uppercase tracking-widest text-text-subtle mb-4"
      >
        Identificação
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {doi && (
          <MetadataItem icon={LinkIcon} label="DOI">
            <a
              href={`https://doi.org/${doi.replace(/^https?:\/\/doi\.org\//, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark hover:underline break-all"
            >
              {doi}
            </a>
          </MetadataItem>
        )}
        {isbn && (
          <MetadataItem icon={Tag} label="ISBN">
            <span className="break-all">{isbn}</span>
          </MetadataItem>
        )}
        {thematicArea && (
          <MetadataItem icon={Library} label="Área Temática" className={doi || isbn ? 'sm:col-span-2' : ''}>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-info-soft text-info-strong border border-info-border text-xs font-semibold">
              {thematicArea}
            </span>
          </MetadataItem>
        )}
      </div>
    </section>
  );
};
