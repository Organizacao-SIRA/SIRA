interface PageFooterProps {
  text: string;
  variant?: 'static' | 'fixed';
}

export const PageFooter = ({ text, variant = 'static' }: PageFooterProps) => {
  if (variant === 'fixed') {
    return (
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-10 pb-8 px-4 z-40 pointer-events-none">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 text-center bg-gray-50/80 backdrop-blur-sm">
      <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">{text}</p>
    </div>
  );
};
