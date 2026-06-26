import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { fadeUp } from '../../components/ui/animations';

export default function MiCuentaView() {
  const { user } = useAuth();

  // Password change
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null); // { type: 'ok'|'err', text }

  // Email resend
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);

  const isEmailConfirmed = !!user?.email_confirmed_at;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'err', text: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    if (newPwd.length < 8) {
      setPwdMsg({ type: 'err', text: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    setPwdLoading(true);
    try {
      // Verify current password by re-authenticating
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPwd,
      });
      if (signInErr) {
        setPwdMsg({ type: 'err', text: 'La contraseña actual es incorrecta.' });
        return;
      }
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });
      if (updateErr) throw updateErr;
      setPwdMsg({ type: 'ok', text: 'Contraseña actualizada correctamente.' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'err', text: err.message ?? 'Error al cambiar la contraseña.' });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setResendMsg(null);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
      if (error) throw error;
      setResendMsg({ type: 'ok', text: `Correo de confirmación reenviado a ${user.email}` });
    } catch (err) {
      setResendMsg({ type: 'err', text: err.message ?? 'Error al reenviar el correo.' });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--fondo-crema)] pt-28 pb-20 px-4">
      <div className="max-w-xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <span className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-[var(--terracota-quemado)] mb-3 block">Seguridad</span>
          <h1 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)]">Mi cuenta</h1>
          <p className="font-ui text-[var(--texto-suave)] mt-2">{user?.email}</p>
        </motion.div>

        {/* Email confirmation banner */}
        {!isEmailConfirmed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-amber-50 border border-amber-200 rounded-[20px] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Mail size={22} className="text-amber-600 shrink-0" />
              <div>
                <p className="font-ui font-bold text-sm text-amber-900">Email no verificado</p>
                <p className="font-ui text-xs text-amber-700 mt-0.5">Verifica tu correo para acceder a todas las funciones.</p>
              </div>
            </div>
            <button
              onClick={handleResendConfirmation}
              disabled={resendLoading}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-ui font-bold text-xs px-4 py-2.5 rounded-[12px] transition-colors shrink-0 disabled:opacity-50"
            >
              {resendLoading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              Reenviar correo
            </button>
            {resendMsg && (
              <p className={`font-ui text-xs mt-2 sm:mt-0 ${resendMsg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>{resendMsg.text}</p>
            )}
          </motion.div>
        )}

        {isEmailConfirmed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-[var(--verde-menta)] border border-[var(--verde-main)]/20 rounded-[20px] p-4 flex items-center gap-3">
            <CheckCircle size={18} className="text-[var(--verde-main)] shrink-0" />
            <p className="font-ui text-sm text-[var(--verde-profundo)]">Email verificado</p>
          </motion.div>
        )}

        {/* Password change form */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-[28px] shadow-sm border border-[var(--verde-palido)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[14px] bg-[var(--verde-menta)] flex items-center justify-center">
              <Lock size={18} className="text-[var(--verde-main)]" />
            </div>
            <div>
              <h2 className="font-ui font-bold text-lg text-[var(--verde-profundo)]">Cambiar contraseña</h2>
              <p className="font-ui text-xs text-[var(--texto-suave)]">Usa al menos 8 caracteres</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* Current password */}
            <div>
              <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-2">Contraseña actual</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  required
                  placeholder="Tu contraseña actual"
                  className="w-full bg-[var(--fondo-crema)] border border-[var(--verde-palido)] rounded-[14px] px-4 py-3.5 font-ui text-sm text-[var(--verde-profundo)] focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)]/30 focus:border-[var(--verde-main)] pr-12 transition-all"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--texto-suave)] hover:text-[var(--verde-profundo)] transition-colors">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-2">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-[var(--fondo-crema)] border border-[var(--verde-palido)] rounded-[14px] px-4 py-3.5 font-ui text-sm text-[var(--verde-profundo)] focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)]/30 focus:border-[var(--verde-main)] pr-12 transition-all"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--texto-suave)] hover:text-[var(--verde-profundo)] transition-colors">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div>
              <label className="font-ui text-xs font-bold uppercase tracking-wider text-[var(--texto-suave)] block mb-2">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                required
                placeholder="Repite la nueva contraseña"
                className={`w-full bg-[var(--fondo-crema)] border rounded-[14px] px-4 py-3.5 font-ui text-sm text-[var(--verde-profundo)] focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)]/30 transition-all ${confirmPwd && confirmPwd !== newPwd ? 'border-red-300 focus:border-red-400' : 'border-[var(--verde-palido)] focus:border-[var(--verde-main)]'}`}
              />
            </div>

            {pwdMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-[12px] text-sm font-ui ${pwdMsg.type === 'ok' ? 'bg-[var(--verde-menta)] text-[var(--verde-profundo)]' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {pwdMsg.type === 'ok' ? <CheckCircle size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                {pwdMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd}
              className="w-full bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white font-ui font-bold py-3.5 rounded-[16px] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {pwdLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Actualizar contraseña
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
