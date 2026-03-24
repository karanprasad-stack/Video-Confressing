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
        { icon: <BoltIcon sx={{ fontSize: 40, color: '#60a5fa' }} />, title: "Instant", desc: "No sign-up for guests" },
        { icon: <SecurityIcon sx={{ fontSize: 40, color: '#60a5fa' }} />, title: "Secure", desc: "End-to-end encrypted" },
        { icon: <HdIcon sx={{ fontSize: 40, color: '#60a5fa' }} />, title: "Start Now", desc: "Crystal clear call" },
    ];

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 0%, #1e293b, #0f172a 80%)',
            display: 'flex',
            flexDirection: 'column',
            color: '#f8fafc',
            overflowX: 'hidden'
        }}>
            {/* Navbar */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <AppBar position="static" color="transparent" elevation={0} sx={{ pt: 2, pb: 2 }}>
                    <Container maxWidth="xl">
                        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                            <Box
                                onClick={() => router("/")}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                            >
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }}>
                                    <VideocamIcon sx={{ fontSize: 40, color: '#60a5fa' }} />
                                </motion.div>
                                <Typography
                                    variant="h5"
                                    noWrap
                                    sx={{
                                        mr: 2,
                                        display: { xs: 'none', md: 'flex' },
                                        fontWeight: 800,
                                        letterSpacing: '.05rem',
                                        color: '#f8fafc',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Apna Video Call
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    onClick={handleJoinGuest}
                                    startIcon={<GroupsIcon />}
                                    sx={{
                                        color: '#e2e8f0',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        '&:hover': { color: '#60a5fa', backgroundColor: 'rgba(255,255,255,0.05)' },
                                        borderRadius: '20px',
                                        px: 2
                                    }}
                                >
                                    Join as Guest
                                </Button>
                                <Button
                                    onClick={() => router("/auth", { state: { action: "register" } })}
                                    sx={{
                                        color: '#e2e8f0',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        '&:hover': { color: '#60a5fa', backgroundColor: 'rgba(255,255,255,0.05)' },
                                        borderRadius: '20px',
                                        px: 2
                                    }}
                                >
                                    Register
                                </Button>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => router("/auth", { state: { action: "login" } })}
                                        sx={{
                                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                            color: '#fff',
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            borderRadius: '25px',
                                            paddingX: 4,
                                            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                                            '&:hover': {
                                                boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.6)'
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
            <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', mt: 4, mb: 4 }}>
                <Grid container spacing={6} alignItems="center" justifyContent="center">

                    {/* Text Column */}
                    <Grid item xs={12} md={10} lg={9}>
                        <Box sx={{ textAlign: 'center' }}>
                            <motion.div
                                initial={{ y: -30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <Typography
                                    variant="h2"
                                    component="h1"
                                    fontWeight="900"
                                    gutterBottom
                                    sx={{
                                        fontSize: { xs: '2.5rem', md: '4.5rem' },
                                        lineHeight: 1.1,
                                        mb: 3,
                                        background: 'linear-gradient(to right, #f8fafc, #93c5fd)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.4))'
                                    }}
                                >
                                    Connect with your loved Ones
                                </Typography>
                            </motion.div>

                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <Typography variant="h5" sx={{ mb: 6, color: '#cbd5e1', fontWeight: 300, lineHeight: 1.6, mx: 'auto', maxWidth: '85%' }}>
                                    Cover any distance with Apna Video Call. Experience high-quality, secure, and seamless video conferencing for free.
                                </Typography>
                            </motion.div>

                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 8, flexWrap: 'wrap' }}>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={handleJoinGuest}
                                            sx={{
                                                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                                color: '#fff',
                                                padding: '14px 42px',
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                borderRadius: '30px',
                                                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
                                            }}
                                        >
                                            Get Started
                                        </Button>
                                    </motion.div>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => router("/auth", { state: { action: "register" } })}
                                        sx={{
                                            color: '#e2e8f0',
                                            borderColor: 'rgba(255,255,255,0.2)',
                                            padding: '14px 42px',
                                            fontSize: '1.2rem',
                                            borderRadius: '30px',
                                            borderWidth: '2px',
                                            '&:hover': {
                                                borderColor: '#60a5fa',
                                                backgroundColor: 'rgba(96,165,250,0.1)',
                                                borderWidth: '2px',
                                            }
                                        }}
                                    >
                                        Learn More
                                    </Button>
                                </Box>
                            </motion.div>

                            {/* Feature Cards */}
                            <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
                                {featureCards.map((card, index) => (
                                    <Grid item key={index} xs={12} sm={4}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8 + (index * 0.15) }}
                                        >
                                            <Paper sx={{
                                                p: 3,
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '20px',
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                textAlign: 'center',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': { 
                                                    transform: 'translateY(-8px)',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    borderColor: 'rgba(96, 165, 250, 0.3)',
                                                    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.15)'
                                                }
                                            }}>
                                                <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                                                    {card.icon}
                                                </motion.div>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1.5, color: '#f8fafc' }}>{card.title}</Typography>
                                                <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>{card.desc}</Typography>
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>

                </Grid>

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
                    width: 420,
                    bgcolor: '#1e293b',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    p: 4,
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