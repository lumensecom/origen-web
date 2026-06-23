import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Check } from 'lucide-react';
import { LOCALES } from '../../constants/locations';

const UbicacionesView = () => {
  const [localSeleccionado, setLocalSeleccionado] = useState(LOCALES[0]);

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16 animate-in">
          <span className="font-ui text-[var(--terracota-quemado)] font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">Nuestros Espacios</span>
          <h1 className="font-logo text-5xl md:text-7xl text-[var(--verde-profundo)] mb-4">Ubicaciones</h1>
          <p className="font-ui text-lg text-[var(--texto-suave)] max-w-lg mx-auto">Encuéntranos en los puntos estratégicos de Bogotá y vive la experiencia real en persona.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Selector de sede */}
          <div className="lg:col-span-5 space-y-4">
            {LOCALES.map(local => {
              const estaActivo = localSeleccionado.id === local.id;
              return (
                <div
                  key={local.id}
                  onClick={() => setLocalSeleccionado(local)}
                  className={`p-6 rounded-[24px] cursor-pointer border-2 transition-all duration-300 text-left ${estaActivo ? 'bg-white border-[var(--verde-main)] shadow-[0_10px_30px_rgba(18,179,98,0.12)] scale-[1.02]' : 'bg-white/60 border-transparent hover:bg-white hover:border-[var(--verde-palido)]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)]">{local.nombre}</h3>
                    {estaActivo && <span className="bg-[var(--verde-menta)] text-[var(--verde-main)] p-1 rounded-full"><Check size={16} /></span>}
                  </div>
                  <p className="font-ui text-sm text-[var(--texto-suave)] mb-4 flex items-start gap-2">
                    <MapPin size={16} className="text-[var(--verde-main)] shrink-0 mt-0.5" />
                    {local.direccion}
                  </p>
                  {estaActivo && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-gray-100 pt-4 space-y-3 overflow-hidden">
                      <p className="font-ui text-xs text-[var(--texto-suave)] leading-relaxed italic">"{local.detalles}"</p>
                      <div className="flex gap-2 flex-wrap">
                        {local.amenidades.map((amenidad, idx) => (
                          <span key={idx} className="bg-[var(--verde-menta)] text-[var(--verde-main)] font-ui text-[10px] font-bold uppercase px-2.5 py-1 rounded-[8px]">{amenidad}</span>
                        ))}
                      </div>
                      <div className="lg:hidden rounded-[18px] overflow-hidden h-[220px] border border-gray-100 shadow-inner mt-2">
                        <iframe src={local.mapaUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title={`Mapa ${local.nombre}`} />
                      </div>
                      <div className="lg:hidden">
                        <button
                          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(local.direccion)}`, '_blank')}
                          className="w-full bg-[var(--verde-main)] text-white font-ui font-bold text-xs py-3 rounded-[14px] flex items-center justify-center gap-2 hover:bg-[var(--verde-vivo)] transition-all"
                        >
                          Cómo llegar <Navigation size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detalle de sede activa — desktop only; mobile shows map inside active card */}
          <div className="hidden lg:block lg:col-span-7">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-[var(--verde-palido)] p-6 md:p-8 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-[var(--terracota-suave)]/30 text-[var(--terracota-quemado)] px-3 py-1 rounded-full text-xs font-bold font-ui uppercase tracking-wide">
                    <Clock size={12} /> Abierto Hoy
                  </span>
                  <h2 className="font-display font-bold text-3xl text-[var(--verde-profundo)] mt-2">{localSeleccionado.nombre}</h2>
                </div>
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(localSeleccionado.direccion)}`, '_blank')}
                  className="bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] font-ui font-semibold text-xs py-3 px-6 rounded-[16px] transition-all duration-300 self-start md:self-auto flex items-center gap-2"
                >
                  Cómo llegar <Navigation size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4 font-ui text-sm">
                <div>
                  <span className="text-gray-400 block text-xs uppercase font-bold tracking-wider mb-1">Lunes a Viernes</span>
                  <span className="text-[var(--texto-oscuro)] font-semibold">{localSeleccionado.horarioSemana}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase font-bold tracking-wider mb-1">Sábados y Domingos</span>
                  <span className="text-[var(--texto-oscuro)] font-semibold">{localSeleccionado.horarioFinde}</span>
                </div>
              </div>
              <div className="rounded-[24px] overflow-hidden shadow-inner h-[320px] border border-gray-100 relative bg-gray-100">
                <iframe src={localSeleccionado.mapaUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Sede Map" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UbicacionesView;
