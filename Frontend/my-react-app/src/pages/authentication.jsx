import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext.jsx';
import { Snackbar, InputAdornment, IconButton, Divider, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

const defaultTheme = createTheme();

/* ── animated floating orb ────────────────────────────────────────── */
const FloatingOrb = ({ size, color, top, left, delay, duration }) => (
  <motion.div
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      top,
      left,
      filter: 'blur(80px)',
      opacity: 0.35,
      pointerEvents: 'none',
    }}
    animate={{
      y: [0, -30, 0, 30, 0],
      x: [0, 20, 0, -20, 0],
      scale: [1, 1.15, 1, 0.9, 1],
    }}
    transition={{
      duration: duration || 12,
      delay: delay || 0,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

/* ── reusable text-field style ────────────────────────────────────── */
const inputSx = {
  mb: 2.5,
  '& .MuiOutlinedInput-root': {
    color: '#f1f5f9',
    borderRadius: '14px',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(8px)',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: 'rgba(148, 163, 184, 0.2)',
      transition: 'border-color 0.3s ease',
    },
    '&:hover fieldset': { borderColor: 'rgba(96, 165, 250, 0.5)' },
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6',
      borderWidth: '2px',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
    },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
      WebkitBoxShadow: '0 0 0 100px rgba(15, 23, 42, 0.95) inset',
      WebkitTextFillColor: '#f1f5f9',
      caretColor: '#f1f5f9',
      borderRadius: '14px',
      transition: 'background-color 5000s ease-in-out 0s',
    },
  },
  '& .MuiInputLabel-root': { color: '#64748b', fontSize: '0.9rem', fontWeight: 500 },
  '& .MuiInputLabel-root.Mui-focused': { color: '#60a5fa' },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
    color: '#475569',
    fontSize: 20,
    transition: 'color 0.3s ease',
  },
  '& .Mui-focused .MuiInputAdornment-root .MuiSvgIcon-root': {
    color: '#60a5fa',
  },
};

/* ── feature pill for branding panel ─────────────────────────────── */
const FeaturePill = ({ icon, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        px: 2.5,
        py: 1.5,
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'rgba(96, 165, 250, 0.1)',
          borderColor: 'rgba(96, 165, 250, 0.25)',
          transform: 'translateX(6px)',
        },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  </motion.div>
);

export default function Authentication() {
  const location = useLocation();

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const [formState, setFormState] = React.useState(
    location.state?.action === 'register' ? 1 : 0
  ); // 0: Login, 1: Register

  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const navigate = useNavigate();

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        console.log(result);
        setUsername('');
        setMessage(result);
        setOpen(true);
        setError('');
        setFormState(0);
        setPassword('');
      }
    } catch (err) {
      console.log(err);
      let message = err.response?.data?.message || err.message || "Failed to connect to server";
      setError(message);
    }
  };

  const features = [
    { icon: <ShieldOutlinedIcon sx={{ fontSize: 20, color: '#60a5fa' }} />, label: 'End-to-end encrypted calls' },
    { icon: <SpeedOutlinedIcon sx={{ fontSize: 20, color: '#60a5fa' }} />, label: 'Crystal-clear HD video' },
    { icon: <GroupsOutlinedIcon sx={{ fontSize: 20, color: '#60a5fa' }} />, label: 'Group conferencing support' },
    { icon: <VideocamOutlinedIcon sx={{ fontSize: 20, color: '#60a5fa' }} />, label: 'No downloads required' },
  ];

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        component="main"
        sx={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 20% 50%, #1e293b 0%, #0f172a 70%)',
          display: 'flex',
          position: 'relative',
        }}
      >
        <CssBaseline />

        {/* ── background orbs ──────────────────────────────────────── */}
        <FloatingOrb size="420px" color="#3b82f6" top="-10%" left="60%" delay={0} duration={14} />
        <FloatingOrb size="320px" color="#6366f1" top="60%" left="-5%" delay={2} duration={16} />
        <FloatingOrb size="200px" color="#60a5fa" top="30%" left="80%" delay={4} duration={10} />
        <FloatingOrb size="160px" color="#818cf8" top="80%" left="50%" delay={1} duration={18} />

        {/* ── back to home ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000 }}
        >
          <Button
            startIcon={<HomeIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate('/')}
            sx={{
              color: '#e2e8f0',
              borderColor: 'rgba(255,255,255,0.15)',
              borderRadius: '14px',
              textTransform: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '8px 22px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
              transition: 'all 0.25s ease',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(96, 165, 250, 0.5)',
                color: '#60a5fa',
                boxShadow: '0 6px 20px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
              },
            }}
            variant="outlined"
          >
            Back to Home
          </Button>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/*  LEFT — BRANDING PANEL                                    */}
        {/* ══════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            width: '48%',
            px: 8,
            pt: 10,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* logo row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
                }}
              >
                <VideocamOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
              </Box>
              <Typography
                sx={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '0.02em',
                }}
              >
                Apna Video Call
              </Typography>
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                lineHeight: 1.15,
                mb: 2.5,
                background: 'linear-gradient(135deg, #f8fafc 30%, #93c5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { md: '2.6rem', lg: '3rem' },
              }}
            >
              {formState === 0
                ? 'Welcome back to\nyour meetings'
                : 'Start connecting\nwith your team'}
            </Typography>

            <Typography
              sx={{
                color: '#64748b',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                mb: 5,
                maxWidth: 420,
              }}
            >
              {formState === 0
                ? 'Sign in to access your meetings, connect with your team, and continue collaborating in real-time.'
                : 'Create your free account and join crystal-clear video calls with anyone, anywhere.'}
            </Typography>

            {/* feature pills */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {features.map((f, i) => (
                <FeaturePill key={i} icon={f.icon} label={f.label} delay={0.5 + i * 0.12} />
              ))}
            </Box>
          </motion.div>
        </Box>

        {/* ══════════════════════════════════════════════════════════ */}
        {/*  RIGHT — AUTH FORM                                        */}
        {/* ══════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            px: { xs: 2, sm: 4 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: 460 }}
          >
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: { xs: 4, sm: 5 },
                borderRadius: '28px',
                width: '100%',
                bgcolor: 'rgba(30, 41, 59, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow:
                  '0 32px 64px -16px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* lock avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
              >
                <Avatar
                  sx={{
                    m: 1,
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    width: 56,
                    height: 56,
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
                  }}
                >
                  <LockOutlinedIcon sx={{ fontSize: 28, color: '#fff' }} />
                </Avatar>
              </motion.div>

              {/* heading */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`heading-${formState}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ textAlign: 'center' }}
                >
                  <Typography
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      color: '#f8fafc',
                      mt: 2,
                      fontSize: '1.6rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {formState === 0 ? 'Sign in to your account' : 'Create your account'}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#64748b',
                      mt: 1,
                      mb: 3.5,
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {formState === 0
                      ? 'Enter your credentials to access your dashboard'
                      : 'Fill in your details to get started for free'}
                  </Typography>
                </motion.div>
              </AnimatePresence>

              {/* ── form ──────────────────────────────────────────── */}
              <Box component="form" noValidate sx={{ width: '100%' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={formState}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                  >
                    {formState === 1 && (
                      <TextField
                        required
                        fullWidth
                        id="fullName"
                        label="Full Name"
                        name="fullName"
                        autoComplete="name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeOutlinedIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={inputSx}
                      />
                    )}
                    <TextField
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      autoFocus={formState === 0}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOpenIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((p) => !p)}
                              edge="end"
                              sx={{ color: '#475569', '&:hover': { color: '#60a5fa' } }}
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                              ) : (
                                <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* forgot password */}
                {formState === 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5, mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#60a5fa',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        transition: 'color 0.2s ease',
                        '&:hover': { color: '#93c5fd' },
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>
                )}

                {/* error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Box
                        sx={{
                          mt: 1,
                          mb: 1,
                          bgcolor: 'rgba(239, 68, 68, 0.08)',
                          py: 1.2,
                          px: 2,
                          borderRadius: '12px',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <Typography
                          color="error"
                          variant="body2"
                          align="center"
                          sx={{ fontWeight: 500, fontSize: '0.85rem' }}
                        >
                          {error}
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* submit button */}
                <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                  <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2.5,
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      padding: '13px',
                      letterSpacing: '0.02em',
                      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 32px rgba(59, 130, 246, 0.5)',
                        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                      },
                    }}
                    onClick={handleAuth}
                  >
                    {formState === 0 ? 'Sign In' : 'Create Account'}
                  </Button>
                </motion.div>

                {/* divider */}
                <Divider
                  sx={{
                    my: 2,
                    '&::before, &::after': {
                      borderColor: 'rgba(148,163,184,0.15)',
                    },
                  }}
                >
                  <Chip
                    label="OR"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(15, 23, 42, 0.6)',
                      color: '#475569',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      border: '1px solid rgba(148,163,184,0.12)',
                      height: 24,
                    }}
                  />
                </Divider>

                {/* toggle login / register */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: '#64748b', fontSize: '0.88rem' }}
                  >
                    {formState === 0
                      ? "Don't have an account? "
                      : 'Already have an account? '}
                    <Box
                      component="span"
                      onClick={() => {
                        setFormState(formState === 0 ? 1 : 0);
                        setError('');
                      }}
                      sx={{
                        color: '#60a5fa',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: 'color 0.2s ease',
                        '&:hover': { color: '#93c5fd' },
                      }}
                    >
                      {formState === 0 ? 'Create account' : 'Sign in'}
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* subtle footer */}
            <Typography
              sx={{
                textAlign: 'center',
                mt: 3,
                color: '#334155',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              Secured with end-to-end encryption
            </Typography>
          </motion.div>
        </Box>
      </Box>

      {/* ── success snackbar ─────────────────────────────────────── */}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: '#10b981',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '14px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          },
        }}
      />
    </ThemeProvider>
  );
}