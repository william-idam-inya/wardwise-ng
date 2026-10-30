import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { ProcessingIndicator } from '../../components/ProcessingIndicator';
import { useAuth } from './AuthContext';

type Mode = 'signin' | 'signup' | 'reset';

export function AuthPage() {
  const { configured, recoveryRequired, setRecoveryRequired } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const title = recoveryRequired ? 'Choose a new password' : mode === 'signup' ? 'Create your student account' : mode === 'reset' ? 'Reset your password' : 'Welcome back';
  const description = recoveryRequired
    ? 'Use a new password for your WardWise account.'
    : mode === 'signup'
      ? 'Create an account to keep your learning workspace private.'
      : mode === 'reset'
        ? 'We will send a password-reset link to your email address.'
        : 'Sign in to continue to your clinical learning workspace.';

  const switchMode = (next: Mode) => {
    setMode(next);
    setMessage('');
    setErrorMessage('');
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');
    if (!supabase) return;
    setBusy(true);
    try {
      if (recoveryRequired) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setRecoveryRequired(false);
        setPassword('');
        switchMode('signin');
        setMessage('Your password has been updated. Sign in with your new password.');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        setPassword('');
        if (!data.session) {
          setMessage('Your registration request was received. Check your email for the confirmation link, then return here to sign in.');
          switchMode('signin');
          setMessage('Your registration request was received. Check your email for the confirmation link, then return here to sign in.');
        } else {
          setMessage('Account created. Your student profile is the next step.');
        }
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
        if (error) throw error;
        setMessage('If the address is registered, a password-reset email will arrive shortly.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The request could not be completed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!configured || !supabase) {
    return <main className="auth-screen">
      <section className="auth-card setup-card">
        <Brand />
        <div className="auth-copy"><span className="kicker">BACKEND CONNECTION REQUIRED</span><h1>Connect your WardWise workspace</h1><p>Authentication is ready in the code, but this repository is not connected to a WardWise Supabase project yet.</p></div>
        <div className="setup-steps">
          <b>Required public configuration</b>
          <code>VITE_SUPABASE_URL</code>
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
          <p>Create a separate Supabase project for WardWise NG. Do not use the ClinClerk NG project or its keys.</p>
        </div>
        <div className="auth-security"><ShieldCheck size={18} /><span>Private workspace access stays locked until the backend is configured.</span></div>
      </section>
    </main>;
  }

  return <main className="auth-screen">
    <section className="auth-card">
      <Brand />
      <div className="auth-copy"><span className="kicker">YOUR CLINICAL LEARNING SPACE</span><h1>{title}</h1><p>{description}</p></div>
      {recoveryRequired ? <div className="auth-banner">Password recovery link verified. Choose a new password below.</div> : null}
      {message ? <div className="auth-banner" role="status">{message}</div> : null}
      {errorMessage ? <div className="auth-error" role="alert">{errorMessage}</div> : null}
      <form className="auth-form" onSubmit={handleSubmit}>
        {!recoveryRequired && mode === 'signup' ? <label>Full name<div className="input-wrap"><UserRound size={17}/><input autoComplete="name" required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name"/></div></label> : null}
        {!recoveryRequired && mode !== 'reset' ? <label>Email address<div className="input-wrap"><Mail size={17}/><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"/></div></label> : null}
        {mode === 'reset' && !recoveryRequired ? <label>Email address<div className="input-wrap"><Mail size={17}/><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"/></div></label> : null}
        {mode !== 'reset' || recoveryRequired ? <label>{recoveryRequired ? 'New password' : 'Password'}<div className="input-wrap"><LockKeyhole size={17}/><input type={showPassword ? 'text' : 'password'} autoComplete={recoveryRequired ? 'new-password' : mode === 'signup' ? 'new-password' : 'current-password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters"/><button type="button" className="reveal-password" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label> : null}
        {busy ? <ProcessingIndicator label={recoveryRequired ? 'Updating password' : mode === 'signup' ? 'Creating account' : mode === 'reset' ? 'Requesting password reset' : 'Signing in'} detail="Waiting for Supabase Auth to respond."/> : null}
        <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>{recoveryRequired ? 'Update password' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'} <ArrowRight size={16}/></button>
      </form>
      <div className="auth-links">
        {!recoveryRequired && mode === 'signin' ? <><button type="button" onClick={() => switchMode('reset')}>Forgot password?</button><span>New to WardWise? <button type="button" onClick={() => switchMode('signup')}>Create an account</button></span></> : null}
        {!recoveryRequired && mode === 'signup' ? <span>Already registered? <button type="button" onClick={() => switchMode('signin')}>Sign in</button></span> : null}
        {!recoveryRequired && mode === 'reset' ? <button type="button" onClick={() => switchMode('signin')}>Back to sign in</button> : null}
      </div>
      <div className="auth-security"><ShieldCheck size={18}/><span>Use fictional or de-identified cases only. Do not enter patient identifiers.</span></div>
    </section>
  </main>;
}

function Brand() {
  return <div className="auth-brand"><span><Stethoscope size={22}/></span><strong>WardWise <em>NG</em></strong></div>;
}
