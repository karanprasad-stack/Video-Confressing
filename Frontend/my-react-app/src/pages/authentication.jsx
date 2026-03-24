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
import { Snackbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const defaultTheme = createTheme();

export default function Authentication() {
  const location = useLocation();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [formState, setFormState] = React.useState(location.state?.action === "register" ? 1 : 0); // 0: Login, 1: Register

  const [open, setOpen] = React.useState(false)

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const navigate = useNavigate();

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password)
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        console.log(result);
        setUsername("");
        setMessage(result);
        setOpen(true);
        setError("")
        setFormState(0)
        setPassword("")
      }
    } catch (err) {
      console.log(err);
      let message = (err.response.data.message);
      setError(message);
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box component="main" sx={{ height: '100vh', width: '100vw', overflow: 'hidden', background: 'radial-gradient(circle at 50% 0%, #1e293b, #0f172a 80%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <CssBaseline />

        <Button
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{
            position: 'absolute',
            top: 24,
            left: 24,
            color: '#e2e8f0',
            borderColor: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            textTransform: 'none',
            fontSize: '1rem',
            padding: '8px 20px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: '#60a5fa',
              color: '#60a5fa'
            }
          }}
          variant="outlined"
        >
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 5,
              borderRadius: '24px',
              maxWidth: 440,
              width: '90vw',
              bgcolor: '#1e293b',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Avatar sx={{ m: 1, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', width: 56, height: 56, boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)' }}>
              <LockOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />
            </Avatar>

            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: '#f8fafc', mt: 2 }}>
              {formState === 0 ? "Welcome Back" : "Join Us"}
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1, mb: 3, textAlign: 'center' }}>
              {formState === 0 ? "Sign in to continue your video conferencing" : "Create an account to start video conferencing"}
            </Typography>


            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={formState}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {formState === 1 && (
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="fullName"
                      label="Full Name"
                      name="fullName"
                      autoComplete="name"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={{ 
                        mb: 2, 
                        '& .MuiOutlinedInput-root': { 
                            color: '#fff', 
                            borderRadius: '12px',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, 
                            '&:hover fieldset': { borderColor: '#60a5fa' }, 
                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' } 
                        }, 
                        '& .MuiInputLabel-root': { color: '#94a3b8' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#60a5fa' }
                      }}
                    />
                  )}
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus={formState === 0}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ 
                      mb: 2, 
                      '& .MuiOutlinedInput-root': { 
                          color: '#fff', 
                          borderRadius: '12px',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, 
                          '&:hover fieldset': { borderColor: '#60a5fa' }, 
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' } 
                      }, 
                      '& .MuiInputLabel-root': { color: '#94a3b8' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#60a5fa' }
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ 
                      mb: 1, 
                      '& .MuiOutlinedInput-root': { 
                          color: '#fff', 
                          borderRadius: '12px',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, 
                          '&:hover fieldset': { borderColor: '#60a5fa' }, 
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' } 
                      }, 
                      '& .MuiInputLabel-root': { color: '#94a3b8' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#60a5fa' }
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {formState === 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Typography variant="body2" sx={{ color: '#60a5fa', cursor: 'pointer', fontWeight: 600, '&:hover': { color: '#93c5fd' } }}>
                    Forgot your password?
                  </Typography>
                </Box>
              )}

              {error && (
                <Typography color="error" variant="body2" align="center" sx={{ mt: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', py: 1, borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  {error}
                </Typography>
              )}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{
                  mt: 4,
                  mb: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  padding: '12px',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                  '&:hover': { 
                    boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.6)' 
                  }
                }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Sign In" : "Sign Up"}
              </Button>

              <Grid container justifyContent="center">
                <Grid item>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    {formState === 0 ? "Don't have an account? " : "Already have an account? "}
                    <span
                      style={{ color: '#60a5fa', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => { setFormState(formState === 0 ? 1 : 0); setError(""); }}
                    >
                      {formState === 0 ? "Sign up" : "Sign in"}
                    </span>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </motion.div>
      </Box>

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
            borderRadius: '12px',
          }
        }}
      />

    </ThemeProvider>
  );
}