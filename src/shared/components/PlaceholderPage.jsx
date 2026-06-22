import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';

// Temporary stand-in for sections that are routed in the sidebar but not yet
// built. Swap the route's element for the real feature page when it lands.
export function PlaceholderPage({ title }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-bg text-accent">
        <ConstructionRoundedIcon />
      </span>
      <h1 className="text-2xl font-medium text-text-h">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-text/60">
        This section is coming soon. Its page hasn't been built yet.  
      </p>
    </div>
  );
}
