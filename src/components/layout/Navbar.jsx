import { MenuIcon, User, ShoppingBag, ArrowRight } from 'lucide-react';

const Navbar = ({ activeTab, scrolled, cart, onNavigate, onOpenMenu, onOpenCart, onOpenAccount }) => {
  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled || activeTab !== 'inicio' ? 'bg-[var(--verde-navbar)] border-b border-white/15 shadow-sm py-4' : 'bg-transparent py-6 md:py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative h-16">

        {/* Left: hamburger + Explorar link */}
        <div className="flex items-center gap-2 z-10">
          <button
            onClick={onOpenMenu}
            className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all text-white"
          >
            <MenuIcon size={20} />
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className="hidden sm:flex items-center gap-1.5 font-ui text-xs font-bold tracking-widest text-white uppercase hover:text-[var(--terracota-suave)] transition-all"
          >
            Explorar <ArrowRight size={12} />
          </button>
        </div>

        {/* Center: logo */}
        <div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10"
          style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.22))' }}
          onClick={() => onNavigate('inicio')}
        >
          <h1 className="font-logo text-2xl md:text-3xl tracking-[0.2em] text-white leading-none">ORIGEN</h1>
          <span className="font-ui text-[8px] md:text-[9px] text-white/80 uppercase tracking-[0.2em] mt-1 font-bold">Comida Saludable</span>
        </div>

        {/* Right: account + cart */}
        <div className="flex items-center gap-4 z-10">
          <button
            onClick={onOpenAccount}
            className="text-white hover:text-[var(--terracota-suave)] transition-colors w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"
          >
            <User size={18} />
          </button>
          <button
            onClick={onOpenCart}
            className="relative w-10 h-10 rounded-full bg-[var(--terracota-vivo)] hover:bg-[var(--terracota-suave)] transition-colors flex items-center justify-center text-[var(--verde-profundo)]"
          >
            <ShoppingBag size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
