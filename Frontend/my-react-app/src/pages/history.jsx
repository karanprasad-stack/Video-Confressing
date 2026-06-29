import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import withAuth from '../utils/withAuth';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';

function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (e) {
                console.error("Failed to fetch history:", e);
                // Optionally handle error state here
            }
        };

        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setSnackbarMessage("Meeting code copied to clipboard!");
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #2c3e50, #000000)',
            p: 3,
            color: 'white',
            overflowX: 'hidden'
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#ff9839' }}>
                    Meeting History
                </Typography>
                <Button
                    startIcon={<HomeIcon />}
                    onClick={() => navigate("/home")}
                    variant="outlined"
                    sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                            borderColor: '#ff9839',
                            backgroundColor: 'rgba(255, 152, 57, 0.1)'
                        }
                    }}
                >
                    Back to Home
                </Button>
            </Box>

            {/* Content */}
            {meetings.length === 0 ? (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '50vh',
                    opacity: 0.7
                }}>
                    <Typography variant="h6" color="grey.400">
                        No meeting history found.
                    </Typography>
                    <Typography variant="body2" color="grey.600">
                        Join your first meeting to see it here!
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {meetings.map((e, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <Card sx={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                borderRadius: 2,
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255, 152, 57, 0.3)'
                                }
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <CalendarTodayIcon sx={{ color: '#ff9839', mr: 1, fontSize: 20 }} />
                                        <Typography variant="body2" color="grey.400">
                                            {formatDate(e.date)}
                                        </Typography>
                                    </Box>

                                    <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
                                        {e.meetingCode}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                    <Button
                                        size="small"
                                        startIcon={<ContentCopyIcon />}
                                        onClick={() => handleCopyCode(e.meetingCode)}
                                        sx={{ color: '#90caf9' }}
                                    >
                                        Copy
                                    </Button>

                                    <Button
                                        size="small"
                                        variant="contained"
                                        endIcon={<VideoCameraFrontIcon />}
                                        onClick={() => navigate(`/${e.meetingCode}`)}
                                        sx={{
                                            bgcolor: '#ff9839',
                                            '&:hover': { bgcolor: '#e08933' },
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Join
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', bgcolor: '#4caf50', color: 'white' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default withAuth(History);