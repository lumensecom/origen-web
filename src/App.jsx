import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import MiCuentaView from './pages/MiCuenta';
import PQRView from './pages/PQR';

import { useAuth } from './contexts/AuthContext';
import useLockBodyScroll from './hooks/useLockBodyScroll';
import { useCart } from './features/cart/useCart';
import { useOrderNotifications } from './features/notifications/useOrderNotifications';
import { updateOrder } from './lib/database';
import { CARTA } from './constants/menu';
import { formatPrice } from './utils/format';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SideDrawer from './components/layout/SideDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderQRModal from './components/OrderQRModal';
import VitaWidget from './components/VitaWidget';
import NotificationBar from './components/NotificationBar';
import NotificationToasts from './components/seller/NotificationToasts';

import HomeView from './pages/Inicio';
import CartaView from './pages/Carta';
import BuilderView from './pages/Builder';
import BlogView from './pages/Blog';
import UbicacionesView from './pages/Ubicaciones';
import CuentaView from './pages/Cuenta';
import HistorialView from './pages/Historial';

// Staff-only modules are code-split so customers never download the QR scanner
// library or the dashboard charts.
const SellerView = lazy(() => import('./pages/Seller'));
const AdminView = lazy(() => import('./pages/Admin'));
const AdminMenuView = lazy(() => import('./pages/Admin/MenuAdmin'));

const StaffFallback = () => (
  <div className="pt-40 pb-40 flex items-center justify-center">
    <Loader2 size={28} className="animate-spin text-[var(--verde-main)]" />
  </div>
);

export default function App() {
  const { isAuthenticated, isSeller, isCajaSeller, isRecovery, isAdmin, sellerLocalId } = useAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [vitaOpen, setVitaOpen] = useState(false);

  // Cross-feature flows
  const [editingOrder, setEditingOrder] = useState(null);   // { source, ... } while editing a bowl
  const [qrOrder, setQrOrder] = useState(null);             // saved order whose QR is shown
  const [sellerResumeOrder, setSellerResumeOrder] = useState(null); // order to re-show in Caja after edit
  const [sellerOpenOrder, setSellerOpenOrder] = useState(null);     // { code, token } to load in Caja from an alert

  useLockBodyScroll(isMobileMenuOpen);

  const { cart, checkout, addToCart, updateQty, removeItem, clearCart, replaceItem, confirmOrder, payAll } = useCart();

  // App-wide Caja alerts: a new pickup order for this seller's sede chimes,
  // vibrates and feeds the navbar bell + floating toasts on any tab. Only a
  // sede-bound caja receives them (a global admin has no sede → no alerts).
  const cajaActive = isSeller && !!sellerLocalId;
  const orderNotifs = useOrderNotifications({ localId: sellerLocalId, enabled: cajaActive });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // A caja (seller) logs in straight into the Ventas/Escáner module. Fires on
  // the transition to seller (login or refresh-while-logged-in), not on every
  // render, so they can still navigate elsewhere afterwards if they choose.
  useEffect(() => {
    if (isCajaSeller) setActiveTab('seller');
  }, [isCajaSeller]);

  // When a password-recovery link is clicked, navigate to Cuenta so the reset
  // modal can open automatically (CuentaView watches isRecovery).
  useEffect(() => {
    if (isRecovery) setActiveTab('cuenta');
  }, [isRecovery]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Open a specific order in the Caja from a notification (bell / toast). The
  // token forces the Seller effect to re-run even for the same order id.
  const openOrderInCaja = (orderId) => {
    setSellerOpenOrder({ code: String(orderId), token: Date.now() });
    navigate('seller');
  };

  const handleAddToCart = (product) => {
    // Staff accounts (seller/admin) have no purchasing flow — the cart/checkout
    // is hidden for them, so adding to cart is a no-op.
    if (isSeller) return;
    addToCart(product);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (deliveryData) => {
    await confirmOrder(deliveryData);
    // Pickup unlocks in-store QR payment and keeps the cart open; delivery is done.
    if (deliveryData.modalidad !== 'Recoger en Local') setIsCheckoutOpen(false);
  };

  const requireAuth = () => {
    setIsCheckoutOpen(false);
    navigate('cuenta');
  };

  // Generate the master QR for the whole order, shown over the open cart.
  const handlePayAll = async () => {
    const order = await payAll();
    setQrOrder(order);
  };

  // ----- Edit flows -----
  // Customer edits a bowl from the cart.
  const handleEditCartItem = (item) => {
    setEditingOrder({ source: 'cart', lineId: item.id, bowl: item, returnTab: activeTab, token: Date.now() });
    setIsCheckoutOpen(false);
    navigate('builder');
  };

  // Seller edits a scanned order's bowl.
  const handleEditSellerOrder = (order) => {
    const bowl = (Array.isArray(order.items) ? order.items : []).find(it => it.esBuilder);
    if (!bowl) return;
    setEditingOrder({ source: 'seller', orderId: order.id, bowl, baseOrder: order, token: Date.now() });
    navigate('builder');
  };

  // Save the edited bowl back to its existing order (cart line or DB row).
  const handleSaveEdit = async (updatedBowl) => {
    const ctx = editingOrder;
    setEditingOrder(null);
    if (!ctx) return;

    if (ctx.source === 'cart') {
      replaceItem(ctx.lineId, updatedBowl);
      navigate(ctx.returnTab || 'menu');
      setIsCheckoutOpen(true);
      return;
    }

    if (ctx.source === 'seller') {
      const baseItems = Array.isArray(ctx.baseOrder.items) ? ctx.baseOrder.items : [];
      let replaced = false;
      const newItems = baseItems.map(it => {
        if (it.esBuilder && !replaced) { replaced = true; return { ...updatedBowl, quantity: it.quantity || 1 }; }
        return it;
      });
      const newTotal = newItems.reduce((a, it) => a + (it.precio || 0) * (it.quantity || 1), 0);
      try {
        const updated = await updateOrder(ctx.orderId, { items: newItems, total_price: newTotal });
        setSellerResumeOrder(updated ?? { ...ctx.baseOrder, items: newItems, total_price: newTotal });
      } catch (err) {
        console.error('Error actualizando pedido:', err);
        setSellerResumeOrder(ctx.baseOrder);
      }
      navigate('seller');
    }
  };

  const handleCancelEdit = () => {
    const ctx = editingOrder;
    setEditingOrder(null);
    if (ctx?.source === 'seller') {
      setSellerResumeOrder(ctx.baseOrder);
      navigate('seller');
    } else {
      navigate(ctx?.returnTab || 'menu');
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--fondo-crema)] selection:bg-[var(--verde-main)] selection:text-white flex flex-col">
      <NotificationBar />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&family=Baloo+2:wght@700;800&display=swap');
        :root {
          --verde-profundo: #131E14; --verde-bosque: #2F3E2B; --verde-main: #12B362;
          --verde-oliva: #4E6047; --verde-vivo: #1EAD61; --verde-brillante: #3EE087; --verde-palido: #C8F0DC;
          --verde-menta: #E8F9F0; --dorado-fuerte: #D4A017; --dorado-suave: #F0C040;
          --crema-calido: #FDF5E0; --fondo-crema: #F1F4EA; --texto-oscuro: #0D1F0F;
          --texto-suave: #4E5C4E; --kraft: #D4A574; --maximo-amber: #F09030;
          --verde-navbar: #3A7A50;
          --terracota-quemado: #B89010; --terracota-vivo: #EEC018; --terracota-suave: #F5D84A;
        }
        .font-display { font-family: 'Fraunces', serif; }
        .font-ui { font-family: 'Outfit', sans-serif; }
        .font-accent { font-family: 'Instrument Serif', serif; }
        .font-logo { font-family: 'Baloo 2', sans-serif; font-weight: 800; }
        body { margin: 0; padding: 0; background-color: var(--fondo-crema); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .animate-in { opacity: 0; transform: translateY(24px); animation: fadeUp 800ms forwards cubic-bezier(0.23, 1, 0.32, 1); }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .card-maximo { animation: glowRespiration 3s infinite alternate ease-in-out; }
        @keyframes glowRespiration {
          0% { box-shadow: 0 4px 20px rgba(240, 144, 48, 0.15); border-color: rgba(240, 144, 48, 0.4); }
          100% { box-shadow: 0 10px 40px rgba(240, 144, 48, 0.35); border-color: rgba(240, 144, 48, 0.9); }
        }
      `}} />

      <Navbar
        activeTab={activeTab}
        scrolled={scrolled}
        cart={cart}
        showCart={!isSeller}
        onNavigate={navigate}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenAccount={() => navigate('cuenta')}
        showBell={cajaActive}
        notifications={orderNotifs.notifications}
        unreadCount={orderNotifs.unreadCount}
        onMarkNotificationsRead={orderNotifs.markAllRead}
        onClearNotifications={orderNotifs.clearAll}
        onOpenNotification={openOrderInCaja}
      />

      {cajaActive && (
        <NotificationToasts
          notifications={orderNotifs.notifications}
          onOpenOrder={openOrderInCaja}
        />
      )}

      <SideDrawer
        isOpen={isMobileMenuOpen}
        activeTab={activeTab}
        onNavigate={navigate}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="relative z-10 flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && (
            <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <HomeView navigate={navigate} onOpenVita={() => setVitaOpen(true)} />
            </motion.div>
          )}
          {activeTab === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <CartaView onAddToCart={handleAddToCart} />
            </motion.div>
          )}
          {activeTab === 'builder' && (
            <motion.div key="builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <BuilderView
                onAddToCart={handleAddToCart}
                editingOrder={editingOrder}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
              />
            </motion.div>
          )}
          {activeTab === 'blog' && (
            <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <BlogView navigate={navigate} />
            </motion.div>
          )}
          {activeTab === 'ubicaciones' && (
            <motion.div key="ubicaciones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <UbicacionesView />
            </motion.div>
          )}
          {activeTab === 'cuenta' && (
            <motion.div key="cuenta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <CuentaView onAddToCart={handleAddToCart} navigate={navigate} />
            </motion.div>
          )}
          {activeTab === 'historial' && (
            <motion.div key="historial" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <HistorialView onRequireAuth={() => navigate('cuenta')} onNavigate={navigate} />
            </motion.div>
          )}
          {activeTab === 'micuenta' && (
            <motion.div key="micuenta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {isAuthenticated ? <MiCuentaView /> : <CuentaView onAddToCart={handleAddToCart} navigate={navigate} />}
            </motion.div>
          )}
          {activeTab === 'pqr' && (
            <motion.div key="pqr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <PQRView />
            </motion.div>
          )}
          {activeTab === 'seller' && (
            <motion.div key="seller" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Suspense fallback={<StaffFallback />}>
                <SellerView
                  resumeOrder={sellerResumeOrder}
                  onConsumeResume={() => setSellerResumeOrder(null)}
                  openOrder={sellerOpenOrder}
                  onConsumeOpenOrder={() => setSellerOpenOrder(null)}
                  onEditOrder={handleEditSellerOrder}
                  onRequireAuth={() => navigate('cuenta')}
                />
              </Suspense>
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Suspense fallback={<StaffFallback />}>
                <AdminView onRequireAuth={() => navigate('cuenta')} />
              </Suspense>
            </motion.div>
          )}
          {activeTab === 'adminmenu' && (
            <motion.div key="adminmenu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Suspense fallback={<StaffFallback />}>
                {isAdmin ? <AdminMenuView /> : <CuentaView onAddToCart={handleAddToCart} />}
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {isCheckoutOpen && (
        <CheckoutModal
          cart={cart}
          onUpdateQty={updateQty}
          onRemoveItem={removeItem}
          onClose={() => setIsCheckoutOpen(false)}
          onConfirmOrder={handleConfirmOrder}
          onEditItem={handleEditCartItem}
          onPayAll={handlePayAll}
          onClearCart={clearCart}
          qrUnlocked={checkout.unlocked}
          pickupStore={checkout.store}
          isAuthenticated={isAuthenticated}
          onRequireAuth={requireAuth}
        />
      )}

      {qrOrder && <OrderQRModal order={qrOrder} onClose={() => setQrOrder(null)} />}

      {/* Mr. Sivio FAB — all tabs on desktop, only inicio on mobile */}
      <motion.div
        className={`fixed bottom-6 right-4 z-[95] group ${activeTab !== 'inicio' ? 'hidden md:block' : 'block'}`}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <motion.button
          onClick={() => setVitaOpen(true)}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="relative flex flex-col items-center active:scale-95 transition-transform"
          aria-label="Hablar con Mr. Sivio"
        >
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[var(--verde-profundo)] text-white font-ui font-semibold text-xs px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            ¡Hola! Soy Mr. Sivio 🥦
          </span>
          <img
            src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto,f_auto,w_240/v1782441292/A_friendly_muscular_broccoli_character_202606252134-removebg-preview_vjtmnk.png"
            alt="Mr. Sivio"
            className="h-[90px] md:h-[140px] w-auto object-contain drop-shadow-2xl"
          />
        </motion.button>
      </motion.div>

      <VitaWidget
        carta={CARTA}
        formatPrice={formatPrice}
        onAddToCart={handleAddToCart}
        navigate={navigate}
        isOpen={vitaOpen}
        onClose={() => setVitaOpen(false)}
      />

      <Footer navigate={navigate} />
    </div>
  );
}
