const Button = ({ children, variant = 'primary', className = '', onClick, disabled }) => {
  const base = 'px-8 py-3.5 rounded-[16px] font-ui font-bold tracking-wider text-xs uppercase transition-all duration-300 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(18,179,98,0.3)] disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed',
    ghost: 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:-translate-y-0.5',
    outline: 'border-2 border-[var(--verde-profundo)] text-[var(--verde-profundo)] hover:bg-[var(--verde-profundo)] hover:text-white',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
