import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Leaf } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ onClose, onSuccess, defaultMode = 'login' }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        onSuccess?.()
        onClose?.()
      } else {
        if (!fullName.trim()) {
          setError('Por favor ingresa tu nombre completo.')
          return
        }
        await signUp(email, password, fullName)
        setSuccess('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.')
      }
    } catch (err) {
      const map = {
        'Invalid login credentials': 'Correo o contraseña incorrectos.',
        'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
        'User already registered': 'Este correo ya tiene una cuenta. Inicia sesión.',
        'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      }
      setError(map[err.message] ?? err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggle = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setSuccess('')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--fondo-crema)] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-[var(--verde-profundo)] px-8 pt-10 pb-8 relative">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 text-white/60 hover:text-white bg-white/10 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--verde-main)] rounded-[12px] flex items-center justify-center">
                <Leaf size={20} className="text-white" />
              </div>
              <span className="font-ui text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--verde-palido)]">
                Tu Cuenta Origen
              </span>
            </div>
            <h2 className="font-display italic text-4xl text-white leading-tight">
              {mode === 'login' ? 'Bienvenido\nde vuelta.' : 'Crea tu\ncuenta.'}
            </h2>
            <p className="font-ui text-sm text-[var(--verde-palido)] mt-2">
              {mode === 'login'
                ? 'Inicia sesión para ver tus puntos y pedidos.'
                : 'Empieza a acumular puntos con cada compra.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--texto-suave)] mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ej: María García"
                  required
                  className="w-full px-4 py-3 rounded-[14px] border border-[var(--verde-palido)] bg-white font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] transition"
                />
              </div>
            )}

            <div>
              <label className="block font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--texto-suave)] mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full px-4 py-3 rounded-[14px] border border-[var(--verde-palido)] bg-white font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] transition"
              />
            </div>

            <div>
              <label className="block font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--texto-suave)] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-[14px] border border-[var(--verde-palido)] bg-white font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 font-ui text-xs px-4 py-3 rounded-[12px]">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-[var(--verde-menta)] border border-[var(--verde-palido)] text-[var(--verde-main)] font-ui text-xs px-4 py-3 rounded-[12px]">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white font-ui font-bold text-sm py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(18,179,98,0.3)]"
            >
              {loading ? 'Un momento...' : mode === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'}
              {!loading && <ArrowRight size={16} />}
            </button>

            <p className="font-ui text-xs text-center text-[var(--texto-suave)]">
              {mode === 'login' ? '¿Eres nuevo en Origen?' : '¿Ya tienes cuenta?'}
              {' '}
              <button
                type="button"
                onClick={toggle}
                className="text-[var(--verde-main)] font-bold hover:underline"
              >
                {mode === 'login' ? 'Crea tu cuenta gratis' : 'Inicia sesión'}
              </button>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
