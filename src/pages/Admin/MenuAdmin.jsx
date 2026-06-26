import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Eye, EyeOff, X, Check, Loader2, AlertCircle, ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/format';
import { fadeUp } from '../../components/ui/animations';

const DIETARY_OPTIONS = ['Gluten-Free', 'High-Protein', 'Vegetariano', 'Vegano', 'Raw'];
const TAGS = ['Mariscos', 'Proteína Animal', 'Vegetariano'];
const EMPTY_ITEM = { id: '', nombre: '', precio: '', proteina: '', ingredientes: '', dietary: [], tag: 'Proteína Animal', imagen: '', badge: { texto: '', color: '#1EAD61', bg: '#E8F5E8' }, active: true };

async function fetchMenuItems() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

async function upsertMenuItem(item) {
  if (!supabase) throw new Error('Supabase no configurado');
  const payload = {
    id: item.id,
    nombre: item.nombre,
    precio: parseInt(item.precio, 10),
    proteina: item.proteina,
    ingredientes: typeof item.ingredientes === 'string'
      ? item.ingredientes.split(',').map(s => s.trim()).filter(Boolean)
      : item.ingredientes,
    dietary: item.dietary,
    tag: item.tag,
    imagen: item.imagen,
    badge: item.badge,
    active: item.active,
  };
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function toggleActive(id, active) {
  if (!supabase) throw new Error('Supabase no configurado');
  const { error } = await supabase.from('menu_items').update({ active }).eq('id', id);
  if (error) throw error;
}

async function deleteMenuItem(id) {
  if (!supabase) throw new Error('Supabase no configurado');
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

function ItemForm({ item, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => ({
    ...item,
    ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes.join(', ') : item.ingredientes,
    badge: item.badge ?? { texto: '', color: '#1EAD61', bg: '#E8F5E8' },
  }));

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setBadge = (key, val) => setForm(f => ({ ...f, badge: { ...f.badge, [key]: val } }));

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90svh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display italic text-2xl text-[var(--verde-profundo)]">{item.id ? 'Editar plato' : 'Nuevo plato'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">ID (ej: tierra)</label>
              <input value={form.id} onChange={e => set('id', e.target.value.toLowerCase().replace(/\s/g, '-'))} placeholder="tierra" className="input-field" disabled={!!item.id} />
            </div>
            <div>
              <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">Precio (COP)</label>
              <input type="number" value={form.precio} onChange={e => set('precio', e.target.value)} placeholder="26900" className="input-field" />
            </div>
          </div>

          <div>
            <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">Nombre del plato</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="ORIGEN TIERRA" className="input-field" />
          </div>

          <div>
            <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">Proteína principal</label>
            <input value={form.proteina} onChange={e => set('proteina', e.target.value)} placeholder="Salmón" className="input-field" />
          </div>

          <div>
            <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">Ingredientes (separados por coma — proteína primero)</label>
            <textarea value={form.ingredientes} onChange={e => set('ingredientes', e.target.value)} rows={3} placeholder="Salmón, Arroz blanco, Aguacate, Pepino..." className="input-field resize-none" />
          </div>

          <div>
            <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">Categoría</label>
            <select value={form.tag} onChange={e => set('tag', e.target.value)} className="input-field">
              {TAGS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-2">Etiquetas dietéticas</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(opt => (
                <button key={opt} type="button"
                  onClick={() => set('dietary', form.dietary.includes(opt) ? form.dietary.filter(d => d !== opt) : [...form.dietary, opt])}
                  className={`px-3 py-1.5 rounded-full font-ui text-xs font-bold transition-all ${form.dietary.includes(opt) ? 'bg-[var(--verde-main)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >{opt}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">URL de imagen (Cloudinary)</label>
            <input value={form.imagen} onChange={e => set('imagen', e.target.value)} placeholder="https://res.cloudinary.com/..." className="input-field" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">Badge texto</label>
              <input value={form.badge?.texto ?? ''} onChange={e => setBadge('texto', e.target.value)} placeholder="Premium" className="input-field" />
            </div>
            <div>
              <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">Color texto</label>
              <input type="color" value={form.badge?.color ?? '#1EAD61'} onChange={e => setBadge('color', e.target.value)} className="h-[42px] w-full rounded-[10px] border border-gray-200 cursor-pointer px-1" />
            </div>
            <div>
              <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-1.5">Color fondo</label>
              <input type="color" value={form.badge?.bg ?? '#E8F5E8'} onChange={e => setBadge('bg', e.target.value)} className="h-[42px] w-full rounded-[10px] border border-gray-200 cursor-pointer px-1" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-ui font-bold py-3 rounded-[16px] transition-all">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={saving} className="flex-1 bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white font-ui font-bold py-3 rounded-[16px] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Guardar
          </button>
        </div>
      </div>
      <style>{`.input-field { width: 100%; background: #F1F4EA; border: 1px solid #C8F0DC; border-radius: 12px; padding: 10px 14px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #131E14; outline: none; transition: border-color 0.2s; } .input-field:focus { border-color: #12B362; } `}</style>
    </motion.div>
  );
}

export default function MenuAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // item or null
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const load = () => {
    setLoading(true);
    fetchMenuItems()
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      await upsertMenuItem(form);
      setEditing(null);
      load();
    } catch (e) {
      alert('Error al guardar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    setTogglingId(item.id);
    try {
      await toggleActive(item.id, !item.active);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar "${item.nombre}" permanentemente?`)) return;
    try {
      await deleteMenuItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={28} className="animate-spin text-[var(--verde-main)]" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 text-red-600 py-12 px-6">
      <AlertCircle size={20} /> {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--fondo-crema)] pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center justify-between mb-10">
          <div>
            <span className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-[var(--terracota-quemado)] mb-2 block">Admin</span>
            <h1 className="font-display italic text-4xl text-[var(--verde-profundo)]">Gestión de Menú</h1>
            <p className="font-ui text-sm text-[var(--texto-suave)] mt-1">{items.length} platos · {items.filter(i => i.active).length} activos</p>
          </div>
          <button
            onClick={() => setEditing(EMPTY_ITEM)}
            className="flex items-center gap-2 bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white font-ui font-bold text-sm px-5 py-3 rounded-[16px] transition-all shadow-md"
          >
            <Plus size={16} /> Agregar plato
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-[24px] border shadow-sm overflow-hidden transition-all ${item.active ? 'border-[var(--verde-palido)]' : 'border-gray-200 opacity-60'}`}>
              <div className="relative h-40 bg-[var(--fondo-crema)]">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
                )}
                {item.badge?.texto && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-[10px] text-[10px] font-bold font-ui"
                    style={{ background: item.badge.bg, color: item.badge.color }}>{item.badge.texto}</span>
                )}
                {!item.active && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <span className="bg-white/90 text-gray-700 font-ui font-bold text-xs px-3 py-1.5 rounded-full">Desactivado</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-[var(--verde-profundo)] leading-tight mb-1">{item.nombre}</h3>
                <p className="font-ui text-xs text-[var(--texto-suave)] mb-2">{item.proteina} · {item.tag}</p>
                <p className="font-display font-bold text-xl text-[var(--verde-main)] mb-4">{formatPrice(item.precio)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing({ ...item, ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes.join(', ') : item.ingredientes })}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--fondo-crema)] hover:bg-[var(--verde-menta)] text-[var(--verde-profundo)] font-ui font-bold text-xs py-2.5 rounded-[12px] transition-all border border-[var(--verde-palido)]"
                  >
                    <Edit2 size={13} /> Editar
                  </button>
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={togglingId === item.id}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[12px] font-ui font-bold text-xs transition-all border ${item.active ? 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500' : 'border-[var(--verde-main)]/30 text-[var(--verde-main)] hover:bg-[var(--verde-menta)]'}`}
                  >
                    {togglingId === item.id ? <Loader2 size={13} className="animate-spin" /> : item.active ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex items-center justify-center px-3 py-2.5 rounded-[12px] font-ui text-xs transition-all border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <ItemForm item={editing} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
        )}
      </AnimatePresence>
    </div>
  );
}
