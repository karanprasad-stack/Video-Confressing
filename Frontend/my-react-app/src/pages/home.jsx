import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, TextField, Box, Typography, Container, Grid, Paper } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import VideoCallIcon from '@mui/icons-material/VideoCall'; // Or any logo icon
import { AuthContext } from '../context/AuthContext';
import "../App.css"; // Keeping it for any global resets, but overriding mainly with Sx

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        if (meetingCode.trim().length > 0) {
            await addToUserHistory(meetingCode);
            navigate(`/${meetingCode}`);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #2c3e50, #000000)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Navbar */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 40px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Placeholder Logo Icon */}
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #ff9839, #ff6b6b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 10px rgba(255, 152, 57, 0.5)'
                    }}>
                        <VideoCallIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', letterSpacing: 1 }}>
                        Video <span style={{ color: '#ff9839' }}>Confressing</span>
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Button
                        variant="text"
                        startIcon={<RestoreIcon />}
                        onClick={() => navigate("/history")}
                        sx={{
                            color: 'white',
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#ff9839'
                            }
                        }}
                    >
                        History
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<LogoutIcon />}
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/");
                        }}
                        sx={{
                            borderColor: '#f44336',
                            color: '#f44336',
                            textTransform: 'none',
                            borderRadius: '20px',
                            padding: '6px 20px',
                            '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                borderColor: '#d32f2f',
                                color: '#d32f2f'
                            }
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid container spacing={6} alignItems="center">
                    {/* Left Panel: Text & Inputs */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 5, md: 0 } }}>
                            <Typography variant="h2" component="h1" sx={{ fontWeight: '800', mb: 2, lineHeight: 1.2 }}>
                                Premium Quality <br />
                                <span style={{ color: '#ff9839', background: 'linear-gradient(90deg, #ff9839, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Video Meetings
                                </span>
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#bbb', mb: 5, maxWidth: '500px', mx: { xs: 'auto', md: 0 } }}>
                                Connect with your team, friends, and family instantly. Secure, high-quality, and free for everyone.
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: { xs: 'center', md: 'flex-start' },
                                alignItems: 'center'
                            }}>
                                <TextField
                                    onChange={e => setMeetingCode(e.target.value)}
                                    placeholder="Enter Meeting Code"
                                    variant="outlined"
                                    sx={{
                                        width: { xs: '100%', sm: '300px' },
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            borderRadius: '30px',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                                            '&.Mui-focused fieldset': { borderColor: '#ff9839' }
                                        },
                                        '& .MuiInputBase-input::placeholder': {
                                            color: '#888',
                                            opacity: 1
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleJoinVideoCall();
                                    }}
                                />
                                <Button
                                    onClick={handleJoinVideoCall}
                                    variant='contained'
                                    size="large"
                                    sx={{
                                        background: 'linear-gradient(45deg, #ff9839, #ff6b6b)',
                                        borderRadius: '30px',
                                        padding: '10px 40px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 15px rgba(255, 152, 57, 0.4)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #e08933, #fa5252)',
                                            boxShadow: '0 6px 20px rgba(255, 152, 57, 0.6)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Join
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Panel: Image/Visual */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '120%',
                                height: '120%',
                                background: 'radial-gradient(circle, rgba(255,152,57,0.15) 0%, rgba(0,0,0,0) 70%)',
                                zIndex: 0
                            }
                        }}>
                            <img
                                src='/logo3.png'
                                alt="Video Conference Landing"
                                style={{
                                    width: '100%',
                                    maxWidth: '300px',
                                    height: 'auto',
                                    borderRadius: '20px',
                                    zIndex: 1,
                                    // filter: 'drop-shadow(0 0 20px rgba(255, 152, 57, 0.3))' // Optional: adds glow to image
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default withAuth(HomeComponent);