import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Award, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CARTA } from '../../constants/menu';
import { formatPrice } from '../../utils/format';
import AuthModal from '../../components/AuthModal';

const calculateRecommendation = (choices) => {
  const { goal, diet, protein } = choices;
  if (goal === 'muscle') {
    if (diet === 'vegan') return CARTA.find(b => b.id === 'vital');
    if (diet === 'gluten_free') return CARTA.find(b => b.id === 'tierra');
    if (protein === 'fish') return CARTA.find(b => b.id === 'agua');
    return CARTA.find(b => b.id === 'tierra');
  }
  if (goal === 'fat_loss') {
    if (diet === 'vegan') return CARTA.find(b => b.id === 'natural');
    if (protein === 'fish') return CARTA.find(b => b.id === 'fuego');
    if (diet === 'gluten_free') return CARTA.find(b => b.id === 'agua');
    return CARTA.find(b => b.id === 'aire');
  }
  if (goal === 'digestion') {
    if (diet === 'vegan') return CARTA.find(b => b.id === 'vital');
    if (diet === 'gluten_free') return CARTA.find(b => b.id === 'cosecha');
    if (protein === 'fish') return CARTA.find(b => b.id === 'raiz');
    return CARTA.find(b => b.id === 'paraiso');
  }
  if (diet === 'vegan') return CARTA.find(b => b.id === 'vital');
  if (protein === 'fish') return CARTA.find(b => b.id === 'tierra');
  if (protein === 'meat') return CARTA.find(b => b.id === 'brasa');
  return CARTA.find(b => b.id === 'dulce');
};

const CuentaView = ({ onAddToCart }) => {
  const { user, profile, isAuthenticated, signOut, isRecovery } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // If user arrives via a password-recovery link, open the reset form immediately
  useEffect(() => {
    if (isRecovery) setShowAuthModal(true);
  }, [isRecovery]);
  const [chatStep, setChatStep] = useState('welcome');
  const [userChoices, setUserChoices] = useState({ goal: '', diet: '', protein: '' });
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef(null);

  const puntos = isAuthenticated ? (profile?.loyalty_points ?? 0) : 0;
  const nombre = isAuthenticated ? (profile?.full_name ?? 'Amigo') : 'Visitante';
  const iniciales = nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'OR';

  const miembroDesde = (() => {
    if (!user?.created_at) return null;
    const d = new Date(user.created_at);
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `Miembro desde ${meses[d.getMonth()]} ${d.getFullYear()}`;
  })();

  const [messages, setMessages] = useState([
    { id: 'msg-initial', role: 'ai', text: '🥦 ¡Hola! Soy Vita, tu asesora nutricional con IA. Te guiaré paso a paso para encontrar tu bowl perfecto. ¿Cuál es tu meta nutricional principal hoy?' },
  ]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role, text, recommendationCard = null) => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessages(prev => [...prev, { id, role, text, recommendation: recommendationCard }]);
  };

  const handleReset = () => {
    setChatStep('welcome');
    setUserChoices({ goal: '', diet: '', protein: '' });
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessages([{ id, role: 'ai', text: '🔄 Diagnóstico reiniciado. ¿Cuál es tu meta nutricional principal hoy?' }]);
  };

  const handleOptionClick = (stepCategory, value, label) => {
    addMessage('user', label);
    setIsTyping(true);
    setTimeout(() => {
      const updatedChoices = { ...userChoices, [stepCategory]: value };
      setUserChoices(updatedChoices);
      if (stepCategory === 'goal') {
        setChatStep('diet');
        addMessage('ai', '¡Excelente meta! 🎯 ¿Tienes alguna restricción alimentaria o preferencia dietética hoy?');
      } else if (stepCategory === 'diet') {
        setChatStep('protein');
        addMessage('ai', 'Entendido. ¿Qué tipo de proteína o perfil de sabor te gustaría hoy?');
      } else if (stepCategory === 'protein') {
        setChatStep('result');
        const recommendedBowl = calculateRecommendation(updatedChoices) ?? CARTA[0];
        addMessage('ai', '¡Hecho! He procesado tus metas. El bowl que mejor se adapta a ti hoy es:');
        addMessage('ai', `Te sugiero disfrutar de un espectacular *${recommendedBowl.nombre}*.`, recommendedBowl);
      }
      setIsTyping(false);
    }, 850);
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-white rounded-[32px] p-12 shadow-sm border border-[var(--verde-palido)]">
            <div className="w-20 h-20 bg-[var(--verde-menta)] rounded-[20px] flex items-center justify-center mx-auto mb-6">
              <User size={36} className="text-[var(--verde-main)]" />
            </div>
            <h2 className="font-logo text-4xl text-[var(--verde-profundo)] mb-4">Tu Cuenta Origen</h2>
            <p className="font-ui text-[var(--texto-suave)] mb-8 max-w-sm mx-auto">
              Inicia sesión para ver tus puntos, historial de pedidos y el asesor nutricional con IA.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button onClick={() => setShowAuthModal(true)} className="bg-[var(--verde-main)] text-white font-ui font-bold py-3.5 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(42,110,72,0.25)] flex items-center justify-center gap-2">
                Iniciar sesión <ArrowRight size={16} />
              </button>
              <button onClick={() => setShowAuthModal(true)} className="border-2 border-[var(--verde-profundo)] text-[var(--verde-profundo)] font-ui font-bold py-3.5 rounded-[16px] hover:bg-[var(--verde-profundo)] hover:text-white transition-all">
                Crear cuenta gratis
              </button>
            </div>
            <p className="font-ui text-xs text-[var(--texto-suave)] mt-6">Gana 50 puntos con cada compra.</p>
          </div>
        </div>
        {showAuthModal && <AuthModal defaultMode={isRecovery ? 'reset' : 'login'} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-sm border border-[var(--verde-palido)] animate-in">

          {/* Perfil */}
          <div className="flex items-center gap-4 mb-12 border-b border-[var(--verde-palido)] pb-10">
            <div className="w-20 h-20 bg-[var(--verde-menta)] rounded-[20px] flex items-center justify-center text-[var(--verde-main)] font-display text-3xl font-bold flex-shrink-0">{iniciales}</div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-4xl text-[var(--verde-profundo)] mb-1">Hola, {nombre.split(' ')[0]}.</h2>
              {miembroDesde && <p className="font-ui text-xs text-[var(--texto-suave)] mb-2">{miembroDesde}</p>}
              <div className="inline-flex items-center gap-2 bg-[var(--terracota-suave)]/30 text-[var(--terracota-quemado)] px-4 py-1.5 rounded-[8px] font-ui font-bold text-sm">
                <Award size={16} /> {puntos} Puntos Origen
              </div>
            </div>
            <button onClick={signOut} className="font-ui text-xs text-[var(--texto-suave)] hover:text-red-500 transition-colors border border-[var(--verde-palido)] px-3 py-1.5 rounded-[10px] flex-shrink-0">
              Salir
            </button>
          </div>

          {/* Chatbot Vita */}
          <div className="bg-[var(--verde-profundo)] rounded-[24px] p-6 text-white relative overflow-hidden flex flex-col min-h-[500px] shadow-lg">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--verde-main)] rounded-full blur-[80px] opacity-20 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--terracota-vivo)] animate-pulse" />
                <p className="font-ui text-xs font-bold uppercase tracking-widest text-[var(--verde-palido)]">Diagnóstico Nutricional Experto</p>
              </div>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-[var(--verde-palido)] hover:text-white bg-white/10 px-3 py-1.5 rounded-[10px] transition-colors">
                🔄 Reiniciar
              </button>
            </div>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 max-h-[350px] scrollbar-hide">
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-[16px] font-ui text-sm max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-[var(--verde-main)] text-white rounded-tr-none' : 'bg-white/10 text-[var(--verde-menta)] rounded-tl-none'}`}>
                    {m.text}
                  </div>
                  {m.recommendation && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 bg-white text-[var(--verde-profundo)] p-4 rounded-[20px] border border-[var(--verde-palido)] w-full max-w-[280px] shadow-lg flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--verde-menta)] border border-gray-100 flex-shrink-0">
                          {m.recommendation.imagen ? (
                            <img loading="lazy" src={m.recommendation.imagen} alt={m.recommendation.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🥗</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-lg leading-tight">{m.recommendation.nombre}</h4>
                          <span className="text-xs bg-[var(--terracota-suave)]/30 text-[var(--terracota-quemado)] px-2 py-0.5 rounded-full font-bold font-ui inline-block mt-1">Sugerido</span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--texto-suave)] leading-relaxed font-ui">Con proteína de {m.recommendation.proteina} fresca, acompañado de ingredientes premium locales.</p>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                        <span className="font-display font-bold text-base text-[var(--verde-main)]">{formatPrice(m.recommendation.precio)}</span>
                        <button onClick={() => onAddToCart(m.recommendation)} className="bg-[var(--verde-main)] text-white font-ui font-bold text-xs px-4 py-2 rounded-[12px] hover:bg-[var(--verde-vivo)] transition-colors flex items-center gap-1">
                          Ordenar <ShoppingBag size={12} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-white/50 text-xs font-ui pl-2">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                  <span>Vita está procesando...</span>
                </div>
              )}
            </div>

            <div className="relative z-10 shrink-0 border-t border-white/5 pt-4">
              <AnimatePresence mode="wait">
                {chatStep === 'welcome' && !isTyping && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-2">
                    <p className="text-[11px] uppercase font-bold text-[var(--verde-palido)] mb-2 tracking-widest">Elige tu Meta Principal:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ['goal', 'muscle', '💪 Ganar Masa'],
                        ['goal', 'fat_loss', '🏃‍♀️ Perder Grasa'],
                        ['goal', 'digestion', '🌿 Digestión Sana'],
                        ['goal', 'energy', '⚡ Almuerzo Rápido'],
                      ].map(([cat, val, label]) => (
                        <button key={val} onClick={() => handleOptionClick(cat, val, label)} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">{label}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {chatStep === 'diet' && !isTyping && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-2">
                    <p className="text-[11px] uppercase font-bold text-[var(--verde-palido)] mb-2 tracking-widest">¿Prefieres alguna dieta o restricción?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ['diet', 'none', '❌ Sin restricción'],
                        ['diet', 'gluten_free', '🌾 Sin Gluten'],
                        ['diet', 'vegan', '🥕 100% Vegano'],
                        ['diet', 'dairy_free', '🥛 Sin Lácteos'],
                      ].map(([cat, val, label]) => (
                        <button key={val} onClick={() => handleOptionClick(cat, val, label)} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">{label}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {chatStep === 'protein' && !isTyping && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-2">
                    <p className="text-[11px] uppercase font-bold text-[var(--verde-palido)] mb-2 tracking-widest">Elige tu proteína o sabor favorito:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ['protein', 'fish', '🐟 Pescados'],
                        ['protein', 'meat', '🍗 Proteína Animal'],
                        ['protein', 'plant', '🌱 Tofu o Huevos'],
                      ].map(([cat, val, label]) => (
                        <button key={val} onClick={() => handleOptionClick(cat, val, label)} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">{label}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {chatStep === 'result' && !isTyping && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="p-3 bg-white/5 rounded-[16px] flex items-center justify-between">
                    <span className="text-xs text-[var(--verde-palido)] font-ui">¿Quieres realizar otro diagnóstico?</span>
                    <button onClick={handleReset} className="bg-[var(--terracota-vivo)] text-[var(--verde-profundo)] hover:bg-[var(--terracota-suave)] font-ui font-bold text-xs px-4 py-2 rounded-[12px] transition-all flex items-center gap-1.5 shadow-md">
                      Nuevo Diagnóstico <ArrowRight size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CuentaView;
