import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Box, Button, Container, Toolbar, Typography, Grid, Paper, Modal, TextField } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import HdIcon from '@mui/icons-material/Hd';
import GroupsIcon from '@mui/icons-material/Groups';
import { motion } from 'framer-motion';
import server from '../environment';

export default function LandingPage() {
    const router = useNavigate();
    const [guestModalOpen, setGuestModalOpen] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [guestCode, setGuestCode] = useState("");
    const [modalStep, setModalStep] = useState(0); // 0: Name, 1: Choice, 2: Join Input, 3: Create Info
    const [meetingError, setMeetingError] = useState("");

    const handleJoinGuest = () => {
        setGuestModalOpen(true);
        setModalStep(0);
        setGuestName("");
        setGuestCode("");
        setMeetingError("");
    }

    const handleGuestNameSubmit = () => {
        if (guestName.trim()) {
            setModalStep(1);
        }
    }

    const handleCreateMeeting = () => {
        const randomCode = Math.random().toString(36).substring(2, 8);
        setGuestCode(randomCode);
        localStorage.setItem("created_meeting", randomCode);
        setModalStep(3);
    }

    const handleJoinMeetingStep = () => {
        setModalStep(2);
    }

    const validateAndJoinMeeting = async () => {
        setMeetingError("");
        if (!guestCode.trim()) {
            setMeetingError("Please enter a meeting code");
            return;
        }

        try {
            const response = await fetch(`${server}/api/v1/meetings/${guestCode}`);
            const data = await response.json();

            if (response.ok && data.active) {
                router(`/${guestCode}`, { state: { guestName } });
            } else {
                setMeetingError("Meeting not found or inactive");
            }

        } catch (error) {
            console.error("Error validating meeting:", error);
            setMeetingError("Error connecting to server");
        }
    }

    const startCreatedMeeting = () => {
        router(`/${guestCode}`, { state: { guestName } });
    }


    const featureCards = [
        { icon: <BoltIcon sx={{ fontSize: 22, color: '#38bdf8' }} />, title: "Instant", desc: "No sign-up for guests" },
        { icon: <SecurityIcon sx={{ fontSize: 22, color: '#38bdf8' }} />, title: "Secure", desc: "End-to-end encrypted" },
        { icon: <HdIcon sx={{ fontSize: 22, color: '#38bdf8' }} />, title: "Start Now", desc: "Crystal clear call" },
    ];

    return (
        <Box sx={{
            minHeight: '100dvh',
            height: { md: '100vh' },
            background: 'radial-gradient(circle at 50% 0%, #172033, #0b0f19 85%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: { md: 'space-between' },
            color: '#f8fafc',
            overflowX: 'hidden'
        }}>
            {/* Navbar */}
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <AppBar position="static" color="transparent" elevation={0} sx={{ pt: { xs: 1.5, md: 2 }, pb: 1 }}>
                    <Container maxWidth="xl">
                        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: '48px', md: '56px' } }}>
                            <Box
                                onClick={() => router("/")}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}
                            >
                                <Box sx={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 16px rgba(37, 99, 235, 0.35)'
                                }}>
                                    <VideocamIcon sx={{ fontSize: 20, color: '#fff' }} />
                                </Box>
                                <Typography
                                    variant="h6"
                                    noWrap
                                    sx={{
                                        fontWeight: 700,
                                        letterSpacing: '-0.01em',
                                        fontSize: { xs: '1rem', md: '1.15rem' },
                                        color: '#f8fafc',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Apna Video Call
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                                <Button
                                    onClick={() => router("/auth", { state: { action: "register" } })}
                                    sx={{
                                        color: '#94a3b8',
                                        textTransform: 'none',
                                        fontSize: '0.92rem',
                                        fontWeight: 500,
                                        borderRadius: '10px',
                                        px: { xs: 1.2, sm: 2 },
                                        py: 0.6,
                                        transition: 'all 0.2s ease',
                                        '&:hover': { color: '#f8fafc', backgroundColor: 'rgba(255,255,255,0.06)' }
                                    }}
                                >
                                    Register
                                </Button>
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => router("/auth", { state: { action: "login" } })}
                                        sx={{
                                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                            color: '#fff',
                                            textTransform: 'none',
                                            fontSize: '0.92rem',
                                            fontWeight: 700,
                                            borderRadius: '20px',
                                            px: { xs: 2.5, sm: 3 },
                                            py: 0.7,
                                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                                                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.6)'
                                            }
                                        }}
                                    >
                                        Login
                                    </Button>
                                </motion.div>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>
            </motion.div>

            {/* Main Content */}
            <Container
                maxWidth="lg"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: { xs: 'flex-start', md: 'center' },
                    alignItems: 'center',
                    pt: { xs: 'clamp(56px, 8vh, 76px)', md: 1.5 },
                    pb: { xs: 'clamp(36px, 6vh, 52px)', md: 1.5 },
                    px: { xs: 2, sm: 3 }
                }}
            >
                <Box sx={{
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: { xs: '420px', sm: '600px', md: '900px' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                    >
                        <Typography
                            variant="h1"
                            component="h1"
                            sx={{
                                fontSize: { xs: '2.15rem', sm: '2.8rem', md: '3.4rem', lg: '3.6rem' },
                                fontWeight: 800,
                                lineHeight: { xs: 1.12, md: 1.12 },
                                letterSpacing: '-0.02em',
                                mb: { xs: '30px', md: 2 },
                                background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.5))'
                            }}
                        >
                            Connect with your <Box component="br" sx={{ display: { xs: 'block', sm: 'none' } }} />loved <Box component="br" sx={{ display: { xs: 'block', sm: 'block' } }} />Ones
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ y: -15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#94a3b8',
                                fontSize: { xs: '0.96rem', sm: '1.02rem', md: '1.06rem' },
                                fontWeight: 400,
                                lineHeight: { xs: 1.6, md: 1.55 },
                                maxWidth: { xs: '340px', sm: '500px', md: '620px' },
                                mx: 'auto',
                                mb: { xs: '32px', md: 3 }
                            }}
                        >
                            Cover any distance with Apna Video Call. Experience high-quality, secure, and seamless video conferencing for free.
                        </Typography>
                    </motion.div>

                    {/* Single Primary CTA */}
                    <motion.div
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.45 }}
                    >
                        <Box sx={{ mb: { xs: '14px', md: 1.2 } }}>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    aria-label="Start instant meeting"
                                    onClick={handleJoinGuest}
                                    sx={{
                                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                        color: '#fff',
                                        padding: { xs: '14px 34px', sm: '13px 36px' },
                                        fontSize: { xs: '0.94rem', sm: '1rem' },
                                        fontWeight: 700,
                                        letterSpacing: '0.02em',
                                        borderRadius: '30px',
                                        textTransform: 'uppercase',
                                        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                                            boxShadow: '0 12px 28px rgba(37, 99, 235, 0.6)'
                                        }
                                    }}
                                >
                                    Start Instant Meeting
                                </Button>
                            </motion.div>
                        </Box>
                    </motion.div>

                    {/* Supporting Text - Explicit margin-bottom to create clean section separation */}
                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            color: '#64748b',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            letterSpacing: '0.02em',
                            mb: { xs: '44px', md: 3.5 }
                        }}
                    >
                        No download required • Start in seconds
                    </Typography>

                    {/* Feature Cards (2 columns on mobile with 3rd card centered, 3-col on desktop) */}
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: { xs: '12px', sm: '16px', md: '20px' },
                        maxWidth: '840px',
                        mx: 'auto',
                        width: '100%'
                    }}>
                        {featureCards.map((card, index) => (
                            <Box
                                key={index}
                                sx={{
                                    flex: { xs: '0 0 calc(50% - 6px)', sm: '0 0 calc(33.333% - 14px)' },
                                    width: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 14px)' },
                                    maxWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 14px)' },
                                    display: 'flex'
                                }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + (index * 0.1) }}
                                    style={{ width: '100%', display: 'flex' }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            width: '100%',
                                            py: { xs: '18px', sm: '20px' },
                                            px: { xs: '16px', sm: '18px' },
                                            background: 'rgba(15, 23, 42, 0.7)',
                                            backdropFilter: 'blur(12px)',
                                            WebkitBackdropFilter: 'blur(12px)',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            textAlign: 'center',
                                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                                            transition: 'all 0.25s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderColor: 'rgba(56, 189, 248, 0.3)',
                                                boxShadow: '0 12px 30px rgba(37, 99, 235, 0.18)'
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            width: { xs: 38, sm: 40 },
                                            height: { xs: 38, sm: 40 },
                                            borderRadius: '10px',
                                            background: 'rgba(37, 99, 235, 0.15)',
                                            border: '1px solid rgba(59, 130, 246, 0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: { xs: '10px', sm: '12px' }
                                        }}>
                                            {card.icon}
                                        </Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc', fontSize: { xs: '0.9rem', sm: '0.92rem' }, mb: { xs: '7px', sm: '8px' } }}>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: { xs: '0.76rem', sm: '0.78rem' }, lineHeight: 1.4 }}>
                                            {card.desc}
                                        </Typography>
                                    </Paper>
                                </motion.div>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Container>

            {/* Guest Join Modal */}
            <Modal
                open={guestModalOpen}
                onClose={() => setGuestModalOpen(false)}
                aria-labelledby="guest-modal-title"
                aria-describedby="guest-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: 'calc(100vw - 32px)', sm: 420 },
                    maxWidth: 420,
                    bgcolor: '#1e293b',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    p: { xs: 3, sm: 4 },
                    color: '#f8fafc'
                }}>
                    {modalStep === 0 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Typography id="guest-modal-title" variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                                Enter Your Name
                            </Typography>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Guest Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                sx={{ 
                                    mb: 4, 
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
                            <Button fullWidth variant="contained" onClick={handleGuestNameSubmit} disabled={!guestName.trim()}
                                sx={{ 
                                    borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)', 
                                    color: 'white',
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    '&.Mui-disabled': {
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'rgba(255,255,255,0.3)'
                                    }
                                }}>
                                Next
                            </Button>
                        </motion.div>
                    )}

                    {modalStep === 1 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Typography id="guest-modal-title" variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                                Choose an Option
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button fullWidth variant="contained" onClick={handleCreateMeeting}
                                    sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', py: 1.5, textTransform: 'none', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    Create Meeting
                                </Button>
                                <Typography variant="body2" align="center" sx={{ color: '#94a3b8', my: 1 }}>OR</Typography>
                                <Button fullWidth variant="outlined" onClick={handleJoinMeetingStep}
                                    sx={{ borderRadius: '12px', py: 1.5, borderColor: '#3b82f6', color: '#60a5fa', textTransform: 'none', fontSize: '1.1rem', fontWeight: 'bold', '&:hover': { borderColor: '#93c5fd', background: 'rgba(96,165,250,0.1)' } }}>
                                    Join Meeting
                                </Button>
                            </Box>
                        </motion.div>
                    )}

                    {modalStep === 2 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Typography id="guest-modal-title" variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                                Join Meeting
                            </Typography>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="code"
                                label="Meeting Code"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={guestCode}
                                onChange={(e) => setGuestCode(e.target.value)}
                                error={!!meetingError}
                                helperText={meetingError}
                                sx={{ 
                                    mb: 4, 
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
                            <Button fullWidth variant="contained" onClick={validateAndJoinMeeting}
                                sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', py: 1.5, textTransform: 'none', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                Join
                            </Button>
                        </motion.div>
                    )}

                    {modalStep === 3 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Typography id="guest-modal-title" variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                                Meeting Created
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, color: '#94a3b8', textAlign: 'center' }}>
                                Share this code with others to invite them:
                            </Typography>
                            <Box sx={{
                                background: '#0f172a',
                                p: 3,
                                borderRadius: '16px',
                                textAlign: 'center',
                                mb: 4,
                                border: '1px dashed #3b82f6',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                            }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 4, color: '#f8fafc' }}>
                                    {guestCode}
                                </Typography>
                            </Box>
                            <Button fullWidth variant="contained" onClick={startCreatedMeeting}
                                sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', py: 1.5, textTransform: 'none', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                Start Meeting
                            </Button>
                        </motion.div>
                    )}

                </Box>
            </Modal>
        </Box >
    );
}