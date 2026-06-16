import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Leaf, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

export default function AuthModal({ onClose, onSuccess, defaultMode = 'login' }) {
  useLockBodyScroll(true)
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState(defaultMode) // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false) // success screen for register / forgot

  const errorMap = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'Email not confirmed': 'Primero debes confirmar tu correo. Revisa tu bandeja de entrada.',
    'User already registered': 'Este correo ya tiene cuenta. Inicia sesión.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'For security purposes, you can only request this once every 60 seconds': 'Espera 60 segundos antes de intentarlo de nuevo.',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        onSuccess?.()
        onClose?.()
      } else if (mode === 'register') {
        if (!fullName.trim()) { setError('Ingresa tu nombre completo.'); return }
        await signUp(email, password, fullName)
        setDone(true)
      } else if (mode === 'forgot') {
        await resetPassword(email)
        setDone(true)
      }
    } catch (err) {
      setError(errorMap[err.message] ?? 'Algo salió mal. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setDone(false)
  }

  const headerCopy = {
    login:    { title: 'Bienvenido\nde vuelta.', sub: 'Inicia sesión para ver tus puntos y pedidos.' },
    register: { title: 'Crea tu\ncuenta.', sub: 'Empieza a acumular puntos con cada compra.' },
    forgot:   { title: 'Recupera\ntu acceso.', sub: 'Te enviaremos un enlace para restablecer tu contraseña.' },
  }

  const { title, sub } = headerCopy[mode]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-[var(--fondo-crema)] w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle móvil */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-[var(--verde-profundo)] px-8 pt-8 pb-8 relative shrink-0">
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
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <h2 className="font-display italic text-4xl text-white leading-tight whitespace-pre-line">{title}</h2>
                <p className="font-ui text-sm text-[var(--verde-palido)] mt-2">{sub}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {done ? (
              /* Pantalla de éxito */
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="px-8 py-10 flex flex-col items-center text-center gap-4"
              >
                <div className="w-16 h-16 bg-[var(--verde-menta)] rounded-full flex items-center justify-center">
                  {mode === 'forgot'
                    ? <Mail size={30} className="text-[var(--verde-main)]" />
                    : <CheckCircle size={30} className="text-[var(--verde-main)]" />
                  }
                </div>

                {mode === 'register' ? (
                  <>
                    <h3 className="font-display italic text-2xl text-[var(--verde-profundo)]">¡Ya casi estás!</h3>
                    <p className="font-ui text-sm text-[var(--texto-suave)] max-w-xs leading-relaxed">
                      Te enviamos un correo a <strong className="text-[var(--verde-profundo)]">{email}</strong>.
                      Ábrelo y haz clic en <em>"Confirmar mi cuenta"</em> para activar tu perfil Origen.
                    </p>
                    <p className="font-ui text-xs text-[var(--texto-suave)]">¿No lo ves? Revisa tu carpeta de spam.</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-display italic text-2xl text-[var(--verde-profundo)]">Revisa tu correo</h3>
                    <p className="font-ui text-sm text-[var(--texto-suave)] max-w-xs leading-relaxed">
                      Enviamos un enlace de recuperación a <strong className="text-[var(--verde-profundo)]">{email}</strong>.
                      El enlace expira en 1 hora.
                    </p>
                    <p className="font-ui text-xs text-[var(--texto-suave)]">¿No llegó? Revisa spam o intenta de nuevo.</p>
                  </>
                )}

                <button
                  onClick={() => switchMode('login')}
                  className="mt-2 font-ui text-sm font-bold text-[var(--verde-main)] hover:underline flex items-center gap-1"
                >
                  Volver a iniciar sesión <ArrowRight size={14} />
                </button>
              </motion.div>
            ) : (
              /* Formulario */
              <motion.form
                key={mode + '-form'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSubmit}
                className="px-8 py-8 space-y-4"
              >
                {mode === 'register' && (
                  <div>
                    <label className="block font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--texto-suave)] mb-1.5">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Ej: María García"
                      required
                      className="w-full px-4 py-3 rounded-[14px] border border-[var(--verde-palido)] bg-white font-ui text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--texto-suave)] mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="w-full px-4 py-3 rounded-[14px] border border-[var(--verde-palido)] bg-white font-ui text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] transition"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--texto-suave)]">
                        Contraseña
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="font-ui text-[11px] text-[var(--verde-main)] hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-[14px] border border-[var(--verde-palido)] bg-white font-ui text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] transition"
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 font-ui text-xs px-4 py-3 rounded-[12px]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white font-ui font-bold text-sm py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(18,179,98,0.3)]"
                >
                  {loading
                    ? 'Un momento...'
                    : mode === 'login'
                    ? 'Iniciar sesión'
                    : mode === 'register'
                    ? 'Crear mi cuenta'
                    : 'Enviar instrucciones'}
                  {!loading && <ArrowRight size={16} />}
                </button>

                {mode === 'forgot' ? (
                  <p className="font-ui text-xs text-center text-[var(--texto-suave)]">
                    <button type="button" onClick={() => switchMode('login')} className="text-[var(--verde-main)] font-bold hover:underline">
                      ← Volver al inicio de sesión
                    </button>
                  </p>
                ) : (
                  <p className="font-ui text-xs text-center text-[var(--texto-suave)]">
                    {mode === 'login' ? '¿Eres nuevo en Origen?' : '¿Ya tienes cuenta?'}
                    {' '}
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                      className="text-[var(--verde-main)] font-bold hover:underline"
                    >
                      {mode === 'login' ? 'Crea tu cuenta gratis' : 'Inicia sesión'}
                    </button>
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
