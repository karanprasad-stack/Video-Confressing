import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    TextField,
    Box,
    Typography,
    Container,
    Paper,
    Divider,
    AppBar,
    Toolbar
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import HdIcon from '@mui/icons-material/Hd';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    const handleStartInstantMeeting = async () => {
        const newCode = Math.random().toString(36).substring(2, 8);
        try {
            await addToUserHistory(newCode);
        } catch (e) {
            console.error("Error adding to history:", e);
        }
        navigate(`/${newCode}`);
    };

    const handleJoinVideoCall = async () => {
        if (meetingCode.trim().length > 0) {
            try {
                await addToUserHistory(meetingCode.trim());
            } catch (e) {
                console.error("Error adding to history:", e);
            }
            navigate(`/${meetingCode.trim()}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const featureCards = [
        {
            icon: <BoltIcon sx={{ fontSize: 22, color: '#38bdf8' }} />,
            title: "Instant Meetings",
            desc: "Start in seconds with no setup"
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 22, color: '#38bdf8' }} />,
            title: "Secure Calling",
            desc: "End-to-end encrypted calls"
        },
        {
            icon: <HdIcon sx={{ fontSize: 22, color: '#38bdf8' }} />,
            title: "Crystal Clear HD",
            desc: "High-quality video and audio"
        }
    ];

    return (
        <Box sx={{
            minHeight: '100dvh',
            height: { md: '100vh' },
            background: 'radial-gradient(circle at 50% 0%, #172033, #0b0f19 85%)',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: { md: 'space-between' },
            overflowX: 'hidden'
        }}>
            {/* Header / Navbar */}
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <AppBar
                    position="static"
                    color="transparent"
                    elevation={0}
                    sx={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(11, 15, 25, 0.6)',
                        backdropFilter: 'blur(12px)',
                        pt: { xs: 1, md: 1.2 },
                        pb: 1
                    }}
                >
                    <Container maxWidth="xl">
                        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: '52px', md: '58px' } }}>
                            {/* Brand Logo & Name */}
                            <Box
                                onClick={() => navigate("/home")}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.2,
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
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
                                        color: '#f8fafc'
                                    }}
                                >
                                    Apna Video Call
                                </Typography>
                            </Box>

                            {/* Header Actions: History & Logout */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                                <Button
                                    variant="text"
                                    startIcon={<RestoreIcon sx={{ fontSize: 19 }} />}
                                    onClick={() => navigate("/history")}
                                    sx={{
                                        color: '#cbd5e1',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: { xs: '0.84rem', sm: '0.92rem' },
                                        borderRadius: '20px',
                                        px: { xs: 1.4, sm: 2.2 },
                                        py: 0.6,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: '#f8fafc',
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                        }
                                    }}
                                >
                                    History
                                </Button>

                                {/* Logout on Mobile (Icon Button to guarantee zero overflow) */}
                                <Button
                                    variant="outlined"
                                    aria-label="Logout"
                                    onClick={handleLogout}
                                    sx={{
                                        display: { xs: 'inline-flex', sm: 'none' },
                                        minWidth: '38px',
                                        width: '38px',
                                        height: '38px',
                                        p: 0,
                                        borderRadius: '50%',
                                        color: '#f87171',
                                        borderColor: 'rgba(239, 68, 68, 0.35)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            borderColor: '#ef4444',
                                            color: '#ef4444'
                                        }
                                    }}
                                >
                                    <LogoutIcon sx={{ fontSize: 17 }} />
                                </Button>

                                {/* Logout on Desktop / Tablet (Full Pill Button) */}
                                <Button
                                    variant="outlined"
                                    startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                                    onClick={handleLogout}
                                    sx={{
                                        display: { xs: 'none', sm: 'inline-flex' },
                                        color: '#f87171',
                                        borderColor: 'rgba(239, 68, 68, 0.35)',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.92rem',
                                        borderRadius: '20px',
                                        px: 2.4,
                                        py: 0.6,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            borderColor: '#ef4444',
                                            color: '#ef4444'
                                        }
                                    }}
                                >
                                    Logout
                                </Button>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>
            </motion.div>

            {/* Main Content Area */}
            <Container
                maxWidth="lg"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: { xs: 'flex-start', md: 'center' },
                    alignItems: 'center',
                    pt: { xs: 'clamp(36px, 5vh, 56px)', md: 2 },
                    pb: { xs: 'clamp(32px, 5vh, 48px)', md: 2 },
                    px: { xs: 2, sm: 3 }
                }}
            >
                <Box sx={{
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: { xs: '420px', sm: '600px', md: '840px' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {/* Main Heading */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Typography
                            variant="h1"
                            component="h1"
                            sx={{
                                fontSize: { xs: '2.15rem', sm: '2.8rem', md: '3.3rem' },
                                fontWeight: 800,
                                lineHeight: { xs: 1.15, md: 1.12 },
                                letterSpacing: '-0.02em',
                                mb: { xs: '18px', md: '20px' },
                                background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.5))'
                            }}
                        >
                            Ready to connect?
                        </Typography>
                    </motion.div>

                    {/* Supporting Description */}
                    <motion.div
                        initial={{ y: -15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#94a3b8',
                                fontSize: { xs: '0.96rem', sm: '1.02rem', md: '1.06rem' },
                                fontWeight: 400,
                                lineHeight: 1.6,
                                maxWidth: { xs: '340px', sm: '500px', md: '580px' },
                                mx: 'auto',
                                mb: { xs: '28px', md: '34px' }
                            }}
                        >
                            Start an instant meeting or join an existing call with your team and friends.
                        </Typography>
                    </motion.div>

                    {/* Primary Action: START INSTANT MEETING */}
                    <motion.div
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<VideocamIcon sx={{ fontSize: 22 }} />}
                                onClick={handleStartInstantMeeting}
                                sx={{
                                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                    color: '#fff',
                                    padding: { xs: '14px 36px', sm: '14px 42px' },
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
                    </motion.div>

                    {/* Divider: "or join with code" */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: { xs: '320px', sm: '380px' },
                        my: { xs: '22px', md: '26px' }
                    }}>
                        <Divider sx={{ flexGrow: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <Typography sx={{
                            px: 2,
                            color: '#64748b',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            or join with code
                        </Typography>
                        <Divider sx={{ flexGrow: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    </Box>

                    {/* Secondary Action: Join Meeting Section */}
                    <motion.div
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                            gap: { xs: 1.5, sm: 1.5 },
                            width: '100%',
                            maxWidth: '450px',
                            mb: { xs: '38px', md: '44px' }
                        }}>
                            <TextField
                                fullWidth
                                value={meetingCode}
                                onChange={e => setMeetingCode(e.target.value)}
                                placeholder="Enter meeting code"
                                variant="outlined"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleJoinVideoCall();
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: '#f8fafc',
                                        borderRadius: '30px',
                                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        transition: 'all 0.2s ease',
                                        '& fieldset': { border: 'none' },
                                        '&:hover': {
                                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                                            border: '1px solid rgba(59, 130, 246, 0.4)'
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid #3b82f6',
                                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)'
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        px: 2.5,
                                        py: 1.3,
                                        fontSize: '0.94rem'
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: '#64748b',
                                        opacity: 1
                                    }
                                }}
                            />
                            <Button
                                onClick={handleJoinVideoCall}
                                variant="contained"
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                                disabled={!meetingCode.trim()}
                                sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    whiteSpace: 'nowrap',
                                    borderRadius: '30px',
                                    px: 3.5,
                                    py: 1.3,
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    textTransform: 'none',
                                    background: meetingCode.trim()
                                        ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                        : 'rgba(255, 255, 255, 0.08)',
                                    color: meetingCode.trim() ? '#fff' : '#64748b',
                                    boxShadow: meetingCode.trim() ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                        boxShadow: '0 6px 18px rgba(37, 99, 235, 0.5)'
                                    },
                                    '&.Mui-disabled': {
                                        color: '#475569',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Join Meeting
                            </Button>
                        </Box>
                    </motion.div>

                    {/* Supporting Feature Cards */}
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: { xs: '12px', sm: '16px', md: '20px' },
                        maxWidth: '820px',
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
                                    transition={{ delay: 0.5 + (index * 0.1) }}
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
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 700,
                                                color: '#f8fafc',
                                                fontSize: { xs: '0.88rem', sm: '0.92rem' },
                                                mb: { xs: '6px', sm: '8px' }
                                            }}
                                        >
                                            {card.title}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#94a3b8',
                                                display: 'block',
                                                fontSize: { xs: '0.75rem', sm: '0.78rem' },
                                                lineHeight: 1.4
                                            }}
                                        >
                                            {card.desc}
                                        </Typography>
                                    </Paper>
                                </motion.div>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default withAuth(HomeComponent);