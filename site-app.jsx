// Site app — production entry point.
// Picks desktop or mobile based on viewport width, and routes via hash to /games.
// All other navigation is in-page anchor scrolling.

const useMobile = () => {
  const [mobile, setMobile] = React.useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const h = (e) => setMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return mobile;
};

const useHashRoute = () => {
  const [hash, setHash] = React.useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));
  React.useEffect(() => {
    const h = () => {
      setHash(window.location.hash);
      // Reset scroll on route change for non-anchor routes
      if (window.location.hash.startsWith('#/')) window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return hash;
};

const SiteApp = () => {
  const isMobile = useMobile();
  const hash = useHashRoute();

  // Route resolution.
  // "/" → Obscuro Gamecrafting (home).
  // "#/lux" → LUX sub-practice (identidad + diseño digital).
  // "#/mediaworks" → legacy combined landing, kept as fallback for old links.
  const route = hash.startsWith('#/lux') ? 'lux'
              : hash.startsWith('#/mediaworks') ? 'mediaworks'
              : 'home';

  if (route === 'lux') {
    // LuxVariationC is rendered on both desktop and mobile; responsive
    // overrides live inside the component's <style> block.
    return <LuxVariationC />;
  }
  if (route === 'mediaworks') {
    return isMobile ? <VariationBMobile /> : <VariationB />;
  }
  return isMobile ? <GamesPageMobile /> : <GamesPage />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<SiteApp />);
