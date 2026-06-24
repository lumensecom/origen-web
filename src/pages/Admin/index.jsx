import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Search, Trash2, ChevronDown, X,
  Shield, ShoppingBag, TrendingUp, MapPin, Calendar,
  AlertCircle, Check, Loader, Eye, EyeOff, RefreshCw,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  adminListUsers,
  adminCreateUser,
  adminDeleteUser,
  getLocales,
} from '../../lib/database'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('') || '??'

const ROLE_META = {
  admin:    { label: 'Admin',    bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  seller:   { label: 'Vendedor', bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-500'   },
  customer: { label: 'Cliente',  bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

const AVATAR_COLORS = [
  'bg-[#12B362] text-white', 'bg-blue-500 text-white', 'bg-amber-500 text-white',
  'bg-purple-500 text-white', 'bg-rose-500 text-white', 'bg-teal-500 text-white',
]
const avatarColor = (id = '') =>
  AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length]

// ---------------------------------------------------------------------------
// RoleBadge
// ---------------------------------------------------------------------------

function RoleBadge({ rol }) {
  const meta = ROLE_META[rol] ?? ROLE_META.customer
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-ui uppercase tracking-wide ${meta.bg} ${meta.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// KPI strip at the top of the module
// ---------------------------------------------------------------------------

function KpiStrip({ users }) {
  const total     = users.length
  const customers = users.filter((u) => u.rol === 'customer').length
  const sellers   = users.filter((u) => u.rol === 'seller').length
  const admins    = users.filter((u) => u.rol === 'admin').length

  const cards = [
    { icon: Users,       label: 'Usuarios totales', value: total,     color: 'text-[var(--verde-main)]',   bg: 'bg-[var(--verde-menta)]' },
    { icon: ShoppingBag, label: 'Clientes',          value: customers, color: 'text-emerald-600',            bg: 'bg-emerald-50' },
    { icon: TrendingUp,  label: 'Vendedores',        value: sellers,   color: 'text-blue-600',               bg: 'bg-blue-50' },
    { icon: Shield,      label: 'Administradores',   value: admins,    color: 'text-amber-600',              bg: 'bg-amber-50' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="bg-white rounded-[20px] p-5 border border-[var(--verde-palido)] shadow-sm flex items-center gap-4">
          <div className={`w-11 h-11 rounded-[14px] ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={color} />
          </div>
          <div>
            <p className={`font-display font-bold text-2xl leading-none ${color}`}>{value}</p>
            <p className="font-ui text-[11px] text-[var(--texto-suave)] mt-0.5 uppercase tracking-wide font-semibold">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

function FilterBar({ search, onSearch, roleFilter, onRoleFilter, localFilter, onLocalFilter, periodFilter, onPeriodFilter, locales }) {
  return (
    <div className="flex flex-wrap gap-3 mb-5">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nombre o email…"
          className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-white border border-gray-200 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent"
        />
        {search && (
          <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Role filter */}
      <Select
        value={roleFilter}
        onChange={onRoleFilter}
        options={[
          { value: '', label: 'Todos los roles' },
          { value: 'customer', label: 'Clientes' },
          { value: 'seller',   label: 'Vendedores' },
          { value: 'admin',    label: 'Administradores' },
        ]}
        icon={<Shield size={14} />}
      />

      {/* Location filter */}
      <Select
        value={localFilter}
        onChange={onLocalFilter}
        options={[
          { value: '', label: 'Todas las sedes' },
          ...locales.map((l) => ({ value: String(l.id), label: l.name })),
        ]}
        icon={<MapPin size={14} />}
      />

      {/* Period filter */}
      <Select
        value={periodFilter}
        onChange={onPeriodFilter}
        options={[
          { value: '',   label: 'Cualquier fecha' },
          { value: '1',  label: 'Hoy' },
          { value: '7',  label: 'Últimos 7 días' },
          { value: '30', label: 'Últimos 30 días' },
        ]}
        icon={<Calendar size={14} />}
      />
    </div>
  )
}

function Select({ value, onChange, options, icon }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-8 pr-8 py-2.5 rounded-[12px] bg-white border border-gray-200 font-ui text-sm text-[var(--verde-profundo)] focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// User table row
// ---------------------------------------------------------------------------

function UserRow({ u, onDelete, isCurrentUser }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(u.id)
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="border-b border-gray-50 hover:bg-[var(--fondo-crema)] transition-colors group"
    >
      {/* Avatar + Name + Email */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-ui font-bold text-xs flex-shrink-0 ${avatarColor(u.id)}`}>
            {initials(u.nombre)}
          </div>
          <div className="min-w-0">
            <p className="font-ui font-semibold text-sm text-[var(--verde-profundo)] truncate max-w-[180px]">
              {u.nombre}
              {isCurrentUser && <span className="ml-1.5 text-[10px] bg-[var(--verde-menta)] text-[var(--verde-main)] px-1.5 py-0.5 rounded-full font-bold">Tú</span>}
            </p>
            <p className="font-ui text-[11px] text-[var(--texto-suave)] truncate max-w-[180px]">{u.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-3.5 px-4">
        <RoleBadge rol={u.rol} />
      </td>

      {/* Location */}
      <td className="py-3.5 px-4">
        {u.local_name ? (
          <span className="font-ui text-xs text-[var(--texto-suave)] flex items-center gap-1">
            <MapPin size={12} className="text-[var(--verde-main)] flex-shrink-0" />
            {u.local_name}
          </span>
        ) : (
          <span className="text-gray-300 text-sm">—</span>
        )}
      </td>

      {/* Points (customers only) */}
      <td className="py-3.5 px-4 hidden md:table-cell">
        {u.tipo === 'customer' ? (
          <span className="font-ui text-xs font-semibold text-[var(--verde-main)]">{u.loyalty_points} pts</span>
        ) : (
          <span className="text-gray-300 text-sm">—</span>
        )}
      </td>

      {/* Created at */}
      <td className="py-3.5 px-4 hidden lg:table-cell">
        <span className="font-ui text-xs text-[var(--texto-suave)]">{formatDate(u.created_at)}</span>
      </td>

      {/* Delete action */}
      <td className="py-3.5 px-4 text-right">
        {!confirming ? (
          <button
            onClick={() => !isCurrentUser && setConfirming(true)}
            disabled={isCurrentUser}
            title={isCurrentUser ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
            className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all ml-auto ${
              isCurrentUser
                ? 'text-gray-200 cursor-not-allowed'
                : 'text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Trash2 size={15} />
          </button>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <span className="font-ui text-[10px] text-red-500 font-semibold">¿Eliminar?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-7 h-7 rounded-[6px] bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {deleting ? <Loader size={12} className="animate-spin" /> : <Check size={12} />}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="w-7 h-7 rounded-[6px] bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </td>
    </motion.tr>
  )
}

// ---------------------------------------------------------------------------
// Create User Modal
// ---------------------------------------------------------------------------

function CreateUserModal({ locales, onClose, onCreated }) {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', rol: 'customer', idLocal: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await adminCreateUser({
        email:    form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        rol:      form.rol,
        idLocal:  form.rol === 'seller' ? Number(form.idLocal) : null,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isValid =
    form.email.trim() &&
    form.password.length >= 6 &&
    form.rol &&
    (form.rol !== 'seller' || form.idLocal)

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="bg-white rounded-[28px] shadow-2xl w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h3 className="font-display italic text-2xl text-[var(--verde-profundo)]">Crear usuario</h3>
            <p className="font-ui text-xs text-[var(--texto-suave)] mt-0.5">El acceso queda activo de inmediato</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <Field label="Nombre completo">
            <input
              type="text"
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="Ej: María García"
              className={inputCls}
            />
          </Field>

          {/* Email */}
          <Field label="Email *">
            <input
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              placeholder="usuario@ejemplo.com"
              className={inputCls}
            />
          </Field>

          {/* Password */}
          <Field label="Contraseña temporal *">
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={form.password}
                onChange={set('password')}
                placeholder="Mínimo 6 caracteres"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {/* Role */}
          <Field label="Rol *">
            <div className="grid grid-cols-3 gap-2">
              {['customer', 'seller', 'admin'].map((r) => {
                const meta = ROLE_META[r]
                const active = form.rol === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, rol: r, idLocal: '' }))}
                    className={`py-2.5 px-3 rounded-[12px] font-ui text-xs font-bold transition-all border-2 ${
                      active
                        ? `${meta.bg} ${meta.text} border-current`
                        : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                    }`}
                  >
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Sede — only for sellers */}
          <AnimatePresence>
            {form.rol === 'seller' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Field label="Sede asignada *">
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                      required={form.rol === 'seller'}
                      value={form.idLocal}
                      onChange={set('idLocal')}
                      className={`${inputCls} pl-9 appearance-none`}
                    >
                      <option value="">Seleccionar sede…</option>
                      {locales.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-[12px] font-ui text-xs">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-[14px] border-2 border-gray-200 font-ui font-bold text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              className="flex-1 py-3 rounded-[14px] bg-[var(--verde-main)] text-white font-ui font-bold text-sm hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(18,179,98,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const inputCls =
  'w-full px-4 py-2.5 rounded-[12px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent'

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--texto-suave)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Admin Module
// ---------------------------------------------------------------------------

export default function AdminModule() {
  const { user, isAdmin } = useAuth()

  const [users,      setUsers]      = useState([])
  const [locales,    setLocales]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  // Filters
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [localFilter,  setLocalFilter]  = useState('')
  const [periodFilter, setPeriodFilter] = useState('')

  // Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--fondo-crema)] flex items-center justify-center">
        <div className="text-center p-8">
          <Shield size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="font-display italic text-2xl text-[var(--verde-profundo)]">Acceso restringido</p>
          <p className="font-ui text-sm text-[var(--texto-suave)] mt-2">Solo los administradores pueden ver este panel.</p>
        </div>
      </div>
    )
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const [userData, localesData] = await Promise.all([adminListUsers(), getLocales()])
      setUsers(userData)
      setLocales(localesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (userId) => {
    await adminDeleteUser(userId)
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    const now = new Date()
    return users.filter((u) => {
      if (roleFilter && u.rol !== roleFilter) return false
      if (localFilter && String(u.id_local) !== localFilter) return false
      if (periodFilter) {
        const days = Number(periodFilter)
        const cutoff = new Date(now)
        if (days === 1) cutoff.setHours(0, 0, 0, 0)
        else cutoff.setDate(cutoff.getDate() - days)
        if (new Date(u.created_at) < cutoff) return false
      }
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!u.email?.toLowerCase().includes(q) && !u.nombre?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [users, search, roleFilter, localFilter, periodFilter])

  return (
    <div className="min-h-screen bg-[var(--fondo-crema)] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Page header */}
        <div className="mb-8">
          <span className="font-ui text-[var(--verde-main)] font-bold tracking-[0.2em] uppercase text-xs">Panel de Administración</span>
          <h1 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)] mt-1">
            Gestión de Usuarios
          </h1>
          <p className="font-ui text-sm text-[var(--texto-suave)] mt-2">
            Administra cuentas de clientes y staff de todas las sedes.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-[16px] font-ui text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
            <button onClick={fetchUsers} className="ml-auto flex items-center gap-1.5 text-xs font-bold hover:text-red-800">
              <RefreshCw size={13} /> Reintentar
            </button>
          </div>
        )}

        {/* KPI strip */}
        {!loading && <KpiStrip users={users} />}

        {/* Section card */}
        <div className="bg-white rounded-[28px] border border-[var(--verde-palido)] shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[var(--verde-menta)] flex items-center justify-center">
                <Users size={18} className="text-[var(--verde-main)]" />
              </div>
              <div>
                <h2 className="font-ui font-bold text-base text-[var(--verde-profundo)]">Usuarios del sistema</h2>
                {!loading && (
                  <p className="font-ui text-xs text-[var(--texto-suave)]">
                    {filteredUsers.length === users.length
                      ? `${users.length} usuarios en total`
                      : `${filteredUsers.length} de ${users.length} usuarios`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchUsers}
                disabled={loading}
                title="Actualizar lista"
                className="w-9 h-9 rounded-[10px] bg-[var(--fondo-crema)] flex items-center justify-center text-[var(--texto-suave)] hover:text-[var(--verde-main)] hover:bg-[var(--verde-menta)] transition-all disabled:opacity-40"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white font-ui font-bold text-xs px-4 py-2.5 rounded-[12px] transition-all shadow-[0_4px_12px_rgba(18,179,98,0.25)] active:scale-[0.98]"
              >
                <UserPlus size={15} />
                Crear usuario
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="px-6 pt-5 pb-2">
            <FilterBar
              search={search}          onSearch={setSearch}
              roleFilter={roleFilter}  onRoleFilter={setRoleFilter}
              localFilter={localFilter} onLocalFilter={setLocalFilter}
              periodFilter={periodFilter} onPeriodFilter={setPeriodFilter}
              locales={locales}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-[var(--texto-suave)]">
                <Loader size={20} className="animate-spin text-[var(--verde-main)]" />
                <span className="font-ui text-sm">Cargando usuarios…</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <Users size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="font-ui text-sm text-[var(--texto-suave)]">
                  {users.length === 0 ? 'Aún no hay usuarios registrados.' : 'Ningún usuario coincide con los filtros.'}
                </p>
                {(search || roleFilter || localFilter || periodFilter) && (
                  <button
                    onClick={() => { setSearch(''); setRoleFilter(''); setLocalFilter(''); setPeriodFilter('') }}
                    className="mt-3 font-ui text-xs text-[var(--verde-main)] font-bold hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-[var(--fondo-crema)]">
                    {['Usuario', 'Rol', 'Sede', 'Puntos', 'Miembro desde', ''].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-left font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--texto-suave)] ${
                          h === 'Puntos'         ? 'hidden md:table-cell' :
                          h === 'Miembro desde'  ? 'hidden lg:table-cell' : ''
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredUsers.map((u) => (
                      <UserRow
                        key={u.id}
                        u={u}
                        onDelete={handleDelete}
                        isCurrentUser={u.id === user?.id}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          {/* Footer hint */}
          {!loading && filteredUsers.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="font-ui text-[11px] text-gray-400">
                Pasa el cursor sobre una fila para ver la opción de eliminar.
              </p>
              <p className="font-ui text-[11px] text-gray-400">
                Los cambios son permanentes e inmediatos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create user modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateUserModal
            locales={locales}
            onClose={() => setShowCreate(false)}
            onCreated={fetchUsers}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
