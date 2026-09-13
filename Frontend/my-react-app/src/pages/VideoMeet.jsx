import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Box, Paper, Typography, Avatar, CssBaseline, Grid, Drawer, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, MenuItem, Tooltip, Slider, FormControl, InputLabel, Select, CircularProgress, Snackbar } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import server from '../environment'
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        { "urls": "stun:stun1.l.google.com:19302" },
        { "urls": "stun:stun2.l.google.com:19302" },
        { "urls": "stun:stun3.l.google.com:19302" },
        { "urls": "stun:stun4.l.google.com:19302" }
    ]
}

const RemoteVideo = ({ video, totalVideos, audioOutputDevice, details, masterVolume = 1, masterMuted = false }) => {
    const videoRef = useRef(null);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (videoRef.current && typeof videoRef.current.setSinkId === 'function' && audioOutputDevice) {
            videoRef.current.setSinkId(audioOutputDevice)
                .catch(error => console.error("Error setting audio output device:", error));
        }
    }, [audioOutputDevice]);

    useEffect(() => {
        if (videoRef.current && video.stream) {
            if (videoRef.current.srcObject !== video.stream) {
                videoRef.current.srcObject = video.stream;
            }
        }
    }, [video.stream]);

    useEffect(() => {
        if (videoRef.current) {
            const effectiveMuted = isMuted || masterMuted;
            const effectiveVolume = effectiveMuted ? 0 : volume * masterVolume;
            videoRef.current.volume = Math.max(0, Math.min(1, effectiveVolume));
            videoRef.current.muted = effectiveMuted;
        }
    }, [volume, isMuted, masterVolume, masterMuted]);

    const isEffectivelyMuted = isMuted || masterMuted || volume === 0;

    return (
        <Paper elevation={10} sx={{
            borderRadius: { xs: 2.5, md: 3.5 },
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)',
            backgroundColor: '#0a0e17',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s ease',
            '&:hover .participant-volume-bar': {
                opacity: 1,
                pointerEvents: 'auto'
            }
        }}>
            <video
                data-socket={video.socketId}
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

            {/* Participant Name Badge (Bottom-Left) */}
            <Box sx={{
                position: 'absolute',
                bottom: { xs: 10, sm: 14 },
                left: { xs: 10, sm: 14 },
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                backgroundColor: 'rgba(15, 23, 42, 0.78)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: { xs: '3px 8px', sm: '5px 12px' },
                borderRadius: '8px',
                zIndex: 15,
                maxWidth: { xs: '130px', sm: '200px', md: '260px' },
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
            }}>
                <Box sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: isEffectivelyMuted ? '#94a3b8' : '#22c55e',
                    boxShadow: isEffectivelyMuted ? 'none' : '0 0 8px #22c55e',
                    flexShrink: 0
                }} />
                <Typography variant="caption" sx={{
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: { xs: '0.72rem', sm: '0.8rem' },
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}>
                    {details?.username || "Participant"}
                </Typography>
                {details?.role && (
                    <Typography variant="caption" sx={{
                        color: '#94a3b8',
                        fontSize: { xs: '0.62rem', sm: '0.68rem' },
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        px: 0.8,
                        py: 0.2,
                        borderRadius: '4px',
                        textTransform: 'capitalize',
                        flexShrink: 0
                    }}>
                        {details.role}
                    </Typography>
                )}
            </Box>

            {/* Participant Volume Pill (Top-Right - Completely clear of bottom dock!) */}
            <Box
                className="participant-volume-bar"
                sx={{
                    position: 'absolute',
                    top: { xs: 8, sm: 14 },
                    right: { xs: 8, sm: 14 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: { xs: '3px 8px', sm: '4px 12px' },
                    borderRadius: '24px',
                    zIndex: 30,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    opacity: { xs: 0.9, md: 0 },
                    pointerEvents: 'auto',
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                        opacity: 1,
                        pointerEvents: 'auto'
                    }
                }}
            >
                <Tooltip title={isMuted ? "Unmute participant" : "Mute participant"}>
                    <IconButton
                        size="small"
                        aria-label={isMuted ? "Unmute participant" : "Mute participant"}
                        onClick={() => setIsMuted(!isMuted)}
                        sx={{
                            color: isEffectivelyMuted ? '#f87171' : '#94a3b8',
                            p: 0.4,
                            '&:hover': { color: '#f8fafc' }
                        }}
                    >
                        {isEffectivelyMuted ? <VolumeOffIcon sx={{ fontSize: { xs: 15, sm: 17 } }} /> : <VolumeUpIcon sx={{ fontSize: { xs: 15, sm: 17 } }} />}
                    </IconButton>
                </Tooltip>

                <Slider
                    size="small"
                    value={isMuted ? 0 : volume}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(e, val) => {
                        setVolume(val);
                        if (val > 0 && isMuted) setIsMuted(false);
                        if (val === 0 && !isMuted) setIsMuted(true);
                    }}
                    sx={{
                        width: { xs: 50, sm: 80 },
                        color: '#3b82f6',
                        py: 0.5,
                        '& .MuiSlider-thumb': {
                            width: 10,
                            height: 10,
                            '&:hover, &.Mui-focusVisible': {
                                boxShadow: '0 0 0 6px rgba(59, 130, 246, 0.2)'
                            }
                        },
                        '& .MuiSlider-rail': {
                            opacity: 0.3
                        }
                    }}
                />

                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem', minWidth: '26px', textAlign: 'right', fontWeight: 600, display: { xs: 'none', sm: 'inline' } }}>
                    {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
                </Typography>
            </Box>
        </Paper>
    );
};

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false); // Changed to false initially for drawer
    let [showEndCallModal, setShowEndCallModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);
    let [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
    let [joinRequests, setJoinRequests] = useState([]);
    let [peerDetails, setPeerDetails] = useState({});
    let [myRole, setMyRole] = useState("");

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    const [videoDevices, setVideoDevices] = useState([]);
    const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
    
    const [audioInputDevices, setAudioInputDevices] = useState([]);
    const [selectedAudioInputDevice, setSelectedAudioInputDevice] = useState("");
    
    const [audioOutputDevices, setAudioOutputDevices] = useState([]);
    const [selectedAudioOutputDevice, setSelectedAudioOutputDevice] = useState("");
    
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [masterVolume, setMasterVolume] = useState(1);
    const [masterMuted, setMasterMuted] = useState(false);
    const [showVolumePopup, setShowVolumePopup] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { url } = useParams();

    const handleCopyCode = () => {
        if (url) {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        if (!showVolumePopup) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest('.volume-popover-container')) {
                setShowVolumePopup(false);
            }
        };
        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [showVolumePopup]);

    const getDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const vDevices = devices.filter(device => device.kind === 'videoinput');
            const aiDevices = devices.filter(device => device.kind === 'audioinput');
            const aoDevices = devices.filter(device => device.kind === 'audiooutput');

            setVideoDevices(vDevices);
            if (vDevices.length > 0) {
                setSelectedVideoDevice(prev => {
                    const exists = vDevices.find(d => d.deviceId === prev);
                    return exists ? prev : vDevices[0].deviceId;
                });
            }

            setAudioInputDevices(aiDevices);
            if (aiDevices.length > 0) {
                setSelectedAudioInputDevice(prev => {
                    const exists = aiDevices.find(d => d.deviceId === prev);
                    return exists ? prev : (aiDevices.find(d => d.deviceId === 'default') || aiDevices[0]).deviceId;
                });
            }

            setAudioOutputDevices(aoDevices);
            if (aoDevices.length > 0) {
                setSelectedAudioOutputDevice(prev => {
                    const exists = aoDevices.find(d => d.deviceId === prev);
                    return exists ? prev : (aoDevices.find(d => d.deviceId === 'default') || aoDevices[0]).deviceId;
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        navigator.mediaDevices.addEventListener('devicechange', getDevices);
        return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    }, []);

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        getPermissions();

        if (location.state && location.state.guestName) {
            const hasToken = !!localStorage.getItem("token");
            const createdMeeting = localStorage.getItem("created_meeting");
            const isCreator = createdMeeting === url || createdMeeting === `/${url}`;
            
            if (!hasToken && !isCreator) {
                setUsername(location.state.guestName + " ( guest )");
            } else {
                setUsername(location.state.guestName);
            }
            setAskForUsername(false);
            getMedia();
        }
    }, [])

    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .catch((e) => {
                        console.log("Error or Cancelled:", e);
                        setScreen(false);
                    })
            }
        }
    }

    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getVideoTracks().forEach(track => track.stop());
        } catch (e) { console.log(e) }

        // Determine which audio track to use: screen audio (if any) or keep mic audio
        // For now, we prioritze mic audio to keep communication active unless we want system audio
        // Best practice for meetings: Keep Mic + Screen Video.
        // If stream has audio, it's system audio. We might want to mix it, but for now let's stick to Mic.

        // We want to KEEP the audio track from the current local stream (Mic)
        // and REPLACE the video track with the screen share video track.

        let screenVideoTrack = stream.getVideoTracks()[0];
        let micAudioTrack = window.localStream.getAudioTracks()[0];

        // Create new combined stream
        let newStream = new MediaStream([screenVideoTrack, micAudioTrack]);
        window.localStream = newStream;
        localVideoref.current.srcObject = newStream;

        // Replace track in all peer connections
        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            let sender = connections[id].getSenders().find(s => s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(screenVideoTrack).catch(e => console.log(e));
            }
        }

        // Handle Stop Sharing
        screenVideoTrack.onended = () => {
            setScreen(false);
            try {
                screenVideoTrack.stop();
            } catch (e) { console.log(e) }

            // Revert to Camera
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((camStream) => {
                    let camVideoTrack = camStream.getVideoTracks()[0];
                    // We can keep the same mic track or use the new one. Let's use existing to avoid glitch?
                    // Actually better to use new fresh track to ensure sync.

                    window.localStream = camStream;
                    localVideoref.current.srcObject = camStream;

                    for (let id in connections) {
                        if (id === socketIdRef.current) continue;
                        let sender = connections[id].getSenders().find(s => s.track.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(camVideoTrack).catch(e => console.log(e));
                        }
                    }
                })
                .catch(e => console.log("Error reverting to camera:", e));

        };
    }

    const getPermissions = async () => {
        try {
            const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoAvailable(true);
            setAudioAvailable(true);
            window.localStream = userMediaStream;
            if (localVideoref.current) {
                localVideoref.current.srcObject = userMediaStream;
            }
            if (userMediaStream.getVideoTracks()[0]?.getSettings?.()?.deviceId) {
                setSelectedVideoDevice(userMediaStream.getVideoTracks()[0].getSettings().deviceId);
            }
            if (userMediaStream.getAudioTracks()[0]?.getSettings?.()?.deviceId) {
                setSelectedAudioInputDevice(userMediaStream.getAudioTracks()[0].getSettings().deviceId);
            }
            getDevices();
        } catch (error) {
            console.log("Failed to get both video and audio. Falling back...", error);
            try {
                // Try audio only
                const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setVideoAvailable(false);
                setAudioAvailable(true);
                window.localStream = audioOnlyStream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = audioOnlyStream;
                }
                if (audioOnlyStream.getAudioTracks()[0]?.getSettings?.()?.deviceId) {
                    setSelectedAudioInputDevice(audioOnlyStream.getAudioTracks()[0].getSettings().deviceId);
                }
                getDevices();
            } catch (err2) {
                console.log("Failed to get audio. Trying video only...", err2);
                try {
                    // Try video only
                    let videoConstraint = true;
                    if (selectedVideoDevice) {
                        videoConstraint = { deviceId: { exact: selectedVideoDevice } };
                    }
                    const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint });
                    setVideoAvailable(true);
                    setAudioAvailable(false);
                    window.localStream = videoOnlyStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = videoOnlyStream;
                    }
                    if (videoOnlyStream.getVideoTracks()[0]?.getSettings?.()?.deviceId) {
                        setSelectedVideoDevice(videoOnlyStream.getVideoTracks()[0].getSettings().deviceId);
                    }
                    getDevices();
                } catch (err3) {
                    console.log("Failed to get any media devices", err3);
                    setVideoAvailable(false);
                    setAudioAvailable(false);
                    if (err3.name === "NotAllowedError" || err3.message.includes("Permission denied")) {
                        alert("Camera and microphone access was denied. Please allow permissions in your browser settings or operating system to use video and audio.");
                    }
                }
            }
        }

        if (navigator.mediaDevices.getDisplayMedia) {
            setScreenAvailable(true);
        } else {
            setScreenAvailable(false);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            // getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    // Re-attach stream when switching views (Preview -> Meeting)
    useEffect(() => {
        if (!askForUsername && localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }
    }, [askForUsername])

    const handleJoinResponse = (socketId, isApproved) => {
        socketRef.current.emit('join-response', url, socketId, isApproved);
        setJoinRequests(prev => prev.filter(req => req.socketId !== socketId));
    };

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }


    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            // Remove existing senders to prevent duplicates
            connections[id].getSenders().forEach(sender => connections[id].removeTrack(sender));

            window.localStream.getTracks().forEach(track => {
                connections[id].addTrack(track, window.localStream);
            });

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                // Remove existing senders to prevent duplicates
                connections[id].getSenders().forEach(sender => connections[id].removeTrack(sender));

                window.localStream.getTracks().forEach(track => {
                    connections[id].addTrack(track, window.localStream);
                });

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                const candidate = new RTCIceCandidate(signal.ice);
                const addCandidate = () => {
                    if (connections[fromId].remoteDescription) {
                        connections[fromId].addIceCandidate(candidate).catch(e => console.log(e));
                    } else {
                        setTimeout(addCandidate, 100); // Retry until remoteDescription is ready
                    }
                };
                addCandidate();
            }
        }
    }


    let connectToSocketServer = () => {
        if (socketRef.current) return;

        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id;

            const hasToken = !!localStorage.getItem("token");
            const createdMeeting = localStorage.getItem("created_meeting");
            const isCreator = createdMeeting === url || createdMeeting === `/${url}`;
            const isExplicitAdmin = hasToken || isCreator;
            
            console.log("Auth Check:", { hasToken, createdMeeting, url, isCreator, isExplicitAdmin });

            if (isExplicitAdmin) {
                setMyRole("admin");
                setIsWaitingForApproval(false);
                socketRef.current.emit('join-call', url, true, username);
            } else {
                socketRef.current.on('join-approved', (isAdmin) => {
                    setMyRole(isAdmin ? "admin" : "guest");
                    setIsWaitingForApproval(false);
                    socketRef.current.emit('join-call', url, isAdmin, username);
                });

                setIsWaitingForApproval(true);
                socketRef.current.emit('join-request', url, { username });
            }

            socketRef.current.on('join-denied', () => {
                setIsWaitingForApproval(false);
                alert("Your request to join the meeting was denied by the host.");
                window.location.href = "/home";
            });

            socketRef.current.on('guest-requesting-join', (data) => {
                setJoinRequests(prev => [...prev, data]);
            });
            
            socketRef.current.on('all-users-details', (details) => {
                setPeerDetails(details);
            });

            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return;
                    if (connections[socketListId]) return; // Prevent overwriting existing connections!

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].ontrack = (event) => {
                        console.log("Track received from", socketListId, event.track.kind);
                        
                        setVideos(prevVideos => {
                            const videoExists = prevVideos.find(video => video.socketId === socketListId);
                            
                            let updatedVideos;
                            if (videoExists) {
                                console.log("Updating existing video stream");
                                updatedVideos = prevVideos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.streams[0] } : video
                                );
                            } else {
                                console.log("Creating new video stream entry");
                                updatedVideos = [...prevVideos, {
                                    socketId: socketListId,
                                    stream: event.streams[0],
                                    autoplay: true,
                                    playsinline: true
                                }];
                            }
                            videoRef.current = updatedVideos;
                            return updatedVideos;
                        });
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        // Remove existing senders to prevent duplicates
                        connections[socketListId].getSenders().forEach(sender => connections[socketListId].removeTrack(sender));
                        
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        
                        connections[socketListId].getSenders().forEach(sender => connections[socketListId].removeTrack(sender));
                        
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].getSenders().forEach(sender => connections[id2].removeTrack(sender));
                            
                            window.localStream.getTracks().forEach(track => {
                                connections[id2].addTrack(track, window.localStream);
                            });
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    const applyDeviceChanges = (newVideoId, newAudioId) => {
        setSelectedVideoDevice(newVideoId);
        setSelectedAudioInputDevice(newAudioId);
        
        let videoConstraint = videoAvailable ? (newVideoId ? { deviceId: { exact: newVideoId } } : true) : false;
        let audioConstraint = audioAvailable ? (newAudioId ? { deviceId: { exact: newAudioId } } : true) : false;
        
        if (!videoConstraint && !audioConstraint) return;

        navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: audioConstraint })
            .then((stream) => {
                 if (!video && videoAvailable) {
                     stream.getVideoTracks().forEach(track => track.enabled = false);
                 }
                 if (!audio && audioAvailable) {
                     stream.getAudioTracks().forEach(track => track.enabled = false);
                 }
                 getUserMediaSuccess(stream);
            })
            .catch(e => console.log("Error applying devices", e));
    };

    let handleVideo = () => {
        const newVideoState = !video; // Intended state
        setVideo(newVideoState);

        if (newVideoState === false) {
            // Turning OFF: Stop all video tracks to turn off camera light
            if (window.localStream && window.localStream.getVideoTracks().length > 0) {
                window.localStream.getVideoTracks().forEach(track => {
                    track.stop();
                    window.localStream.removeTrack(track);
                });
            }
        } else {
            // Turning ON: Request new stream
            let videoConstraint = true;
            if (selectedVideoDevice) {
                videoConstraint = { deviceId: { exact: selectedVideoDevice } };
            }
            
            navigator.mediaDevices.getUserMedia({ video: videoConstraint })
                .then((stream) => {
                    let newVideoTrack = stream.getVideoTracks()[0];
                    if (window.localStream && window.localStream.getAudioTracks().length > 0) {
                        window.localStream.getAudioTracks().forEach(track => {
                            stream.addTrack(track);
                        });
                    }

                    window.localStream = stream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = stream;
                    }

                    for (let id in connections) {
                        if (id === socketIdRef.current) continue;
                        let sender = connections[id].getSenders().find(s => s.track && s.track.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(newVideoTrack).catch(e => console.log(e));
                        }
                    }
                })
                .catch((e) => {
                     console.log("Failed requesting video", e);
                     if (selectedVideoDevice) {
                         navigator.mediaDevices.getUserMedia({ video: true })
                            .then((stream) => {
                                let newVideoTrack = stream.getVideoTracks()[0];
                                if (window.localStream && window.localStream.getAudioTracks().length > 0) {
                                    window.localStream.getAudioTracks().forEach(track => {
                                        stream.addTrack(track);
                                    });
                                }
                                window.localStream = stream;
                                if (localVideoref.current) {
                                    localVideoref.current.srcObject = stream;
                                }
                                for (let id in connections) {
                                    if (id === socketIdRef.current) continue;
                                    let sender = connections[id].getSenders().find(s => s.track && s.track.kind === 'video');
                                    if (sender) {
                                        sender.replaceTrack(newVideoTrack).catch(e => console.log(e));
                                    }
                                }
                            })
                            .catch(err => console.log(err));
                     }
                });
        }
    }


    let handleAudio = () => {
        const newAudioState = !audio;
        setAudio(newAudioState);

        // Simple mute/unmute using enabled property (no renegotiation needed)
        if (window.localStream && window.localStream.getAudioTracks().length > 0) {
            window.localStream.getAudioTracks().forEach(track => {
                track.enabled = newAudioState;
            });
        }
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                handleAudio();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
                e.preventDefault();
                handleVideo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [audio, video]);

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        setShowEndCallModal(true);
    }

    let confirmEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };




    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }


    let connect = () => {
        setAskForUsername(false);
        const hasToken = !!localStorage.getItem("token");
        const createdMeeting = localStorage.getItem("created_meeting");
        const isCreator = createdMeeting === url || createdMeeting === `/${url}`;
        if (!hasToken && !isCreator) {
            setUsername(prev => prev + " ( guest )");
        }
        getMedia();
    }


    return (
        <div>

            {askForUsername === true ?

                <Box component="main" sx={{
                    height: '100vh',
                    width: '100vw',
                    overflow: 'hidden',
                    background: 'radial-gradient(circle at 50% 10%, #1e293b, #0b0f19 80%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    px: 2
                }}>
                    <CssBaseline />

                    <Button
                        startIcon={<HomeIcon sx={{ fontSize: 18 }} />}
                        onClick={() => navigate('/')}
                        sx={{
                            position: 'absolute',
                            top: { xs: 16, sm: 24 },
                            right: { xs: 16, sm: 24 },
                            color: '#94a3b8',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            px: 2,
                            py: 0.8,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                color: '#f8fafc',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                            }
                        }}
                        variant="outlined"
                    >
                        Back to Home
                    </Button>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Paper
                            elevation={16}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: { xs: 3, sm: 4 },
                                borderRadius: '20px',
                                maxWidth: 480,
                                width: '92vw',
                                backgroundColor: 'rgba(15, 23, 42, 0.88)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)'
                            }}
                        >
                            <Box sx={{
                                width: 50,
                                height: 50,
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
                            }}>
                                <VideocamIcon sx={{ fontSize: 28, color: 'white' }} />
                            </Box>

                            <Typography component="h1" variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                                Ready to join?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, mt: 0.5, textAlign: 'center' }}>
                                Enter your name to join meeting <strong style={{ color: '#60a5fa' }}>{url}</strong>
                            </Typography>

                            <Box sx={{ width: '100%' }}>
                                <TextField
                                    id="outlined-basic"
                                    placeholder="Your Name"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    variant="outlined"
                                    fullWidth
                                    autoFocus
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && username.trim()) connect();
                                    }}
                                    sx={{
                                        mb: 2.5,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            color: '#f8fafc',
                                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                                        },
                                        '& .MuiInputBase-input::placeholder': {
                                            color: '#64748b',
                                            opacity: 1
                                        }
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    onClick={connect}
                                    disabled={!username.trim()}
                                    fullWidth
                                    sx={{
                                        mb: 2.5,
                                        borderRadius: '12px',
                                        backgroundColor: '#2563eb',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        padding: '11px',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
                                        '&:hover': { backgroundColor: '#1d4ed8', boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)' },
                                        '&.Mui-disabled': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            color: '#64748b'
                                        }
                                    }}
                                >
                                    Join Meeting
                                </Button>

                                <Box sx={{
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    width: '100%',
                                    aspectRatio: '16/9',
                                    backgroundColor: '#0a0e17'
                                }}>
                                    <video ref={localVideoref} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}></video>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                </Box> : isWaitingForApproval ?
                <Box sx={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'radial-gradient(circle at 50% 10%, #1e293b, #0b0f19 80%)',
                    color: 'white',
                    px: 3,
                    textAlign: 'center'
                }}>
                    <CircularProgress size={56} sx={{ color: '#3b82f6', mb: 3 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#f8fafc' }}>Waiting for host to admit you...</Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1, maxWidth: 360 }}>
                        Please hold on. The meeting host will review your request shortly.
                    </Typography>
                </Box> :

                // Redesigned Modern Meeting View
                <Box
                    sx={{
                        background: 'radial-gradient(circle at 50% 0%, #172033, #0b0f19 85%)',
                        height: '100vh',
                        minHeight: '100dvh',
                        maxHeight: '100dvh',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Top Bar Header */}
                    <Box sx={{
                        height: { xs: '50px', sm: '56px' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: { xs: 1.5, sm: 3 },
                        background: 'rgba(11, 15, 25, 0.85)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                        zIndex: 90
                    }}>
                        {/* Left: Branding */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                            <Box sx={{
                                width: { xs: 28, sm: 34 },
                                height: { xs: 28, sm: 34 },
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 16px rgba(37, 99, 235, 0.35)'
                            }}>
                                <VideocamIcon sx={{ color: 'white', fontSize: { xs: 17, sm: 20 } }} />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' }, letterSpacing: '-0.01em' }}>
                                    Apna Video Call
                                </Typography>
                                <Box sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    backgroundColor: '#22c55e',
                                    boxShadow: '0 0 8px #22c55e',
                                    display: { xs: 'none', sm: 'block' }
                                }} />
                            </Box>
                        </Box>

                        {/* Center: Meeting Code Pill */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 0.5, sm: 1 },
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            px: { xs: 1, sm: 1.8 },
                            py: 0.4,
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                borderColor: 'rgba(255, 255, 255, 0.14)'
                            }
                        }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', display: { xs: 'none', sm: 'inline' } }}>
                                Meeting
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'monospace', fontSize: { xs: '0.78rem', sm: '0.85rem' } }}>
                                {url}
                            </Typography>
                            <Tooltip title={copied ? "Copied!" : "Copy meeting code"}>
                                <IconButton
                                    size="small"
                                    aria-label="Copy meeting code"
                                    onClick={handleCopyCode}
                                    sx={{
                                        color: copied ? '#22c55e' : '#94a3b8',
                                        p: 0.3,
                                        ml: 0.2,
                                        transition: 'color 0.2s ease',
                                        '&:hover': { color: copied ? '#22c55e' : '#60a5fa' }
                                    }}
                                >
                                    {copied ? <CheckIcon sx={{ fontSize: { xs: 13, sm: 15 } }} /> : <ContentCopyIcon sx={{ fontSize: { xs: 13, sm: 15 } }} />}
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Right: Dashboard Button */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                startIcon={<HomeIcon sx={{ fontSize: 17 }} />}
                                onClick={() => navigate('/home')}
                                variant="text"
                                aria-label="Go to dashboard"
                                sx={{
                                    color: '#94a3b8',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                    borderRadius: '9px',
                                    px: { xs: 1, sm: 1.6 },
                                    py: 0.6,
                                    minWidth: { xs: '36px', sm: 'auto' },
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.07)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        borderColor: 'rgba(255, 255, 255, 0.16)',
                                        color: '#f8fafc'
                                    },
                                    '& .MuiButton-startIcon': {
                                        marginRight: { xs: 0, sm: '8px' },
                                        marginLeft: 0
                                    }
                                }}
                            >
                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Dashboard</Box>
                            </Button>
                        </Box>
                    </Box>

                    {/* Main Video Area */}
                    <Box sx={{
                        flex: 1,
                        minHeight: 0,
                        width: '100%',
                        display: videos.length === 0 ? 'flex' : 'grid',
                        justifyContent: videos.length === 0 ? 'center' : 'stretch',
                        alignItems: videos.length === 0 ? 'center' : 'stretch',
                        gridTemplateColumns: videos.length === 1
                            ? '1fr'
                            : videos.length === 2
                                ? { xs: '1fr', md: '1fr 1fr' }
                                : { xs: '1fr 1fr', md: 'repeat(auto-fit, minmax(320px, 1fr))' },
                        gridTemplateRows: videos.length === 1
                            ? '1fr'
                            : videos.length === 2
                                ? { xs: '1fr 1fr', md: '1fr' }
                                : { xs: 'repeat(2, 1fr)', md: 'repeat(auto-fit, minmax(240px, 1fr))' },
                        gap: { xs: 1, sm: 1.5, md: 2 },
                        padding: { xs: 1, sm: 1.5, md: 2 },
                        paddingBottom: 'calc(74px + env(safe-area-inset-bottom, 0px))',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Local Video Tile */}
                        <Paper elevation={10} sx={{
                            borderRadius: { xs: 2.5, md: 3.5 },
                            overflow: 'hidden',
                            width: videos.length === 0 ? '100%' : { xs: '96px', sm: '140px', md: '200px' },
                            height: videos.length === 0 ? '100%' : 'auto',
                            maxWidth: videos.length === 0 ? { xs: '100%', md: '1100px' } : 'none',
                            maxHeight: videos.length === 0 ? { xs: '100%', md: 'calc(100vh - 160px)' } : 'none',
                            aspectRatio: videos.length === 0 ? { xs: 'auto', sm: '16/9' } : '16/9',
                            position: videos.length === 0 ? 'relative' : 'absolute',
                            bottom: videos.length === 0 ? 'auto' : 'calc(74px + env(safe-area-inset-bottom, 0px))',
                            right: videos.length === 0 ? 'auto' : { xs: '8px', sm: '16px' },
                            zIndex: videos.length === 0 ? 1 : 40,
                            border: videos.length === 0 ? '1px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(59, 130, 246, 0.6)',
                            boxShadow: videos.length === 0
                                ? '0 20px 50px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)'
                                : '0 12px 32px rgba(0,0,0,0.8), 0 0 16px rgba(59, 130, 246, 0.2)',
                            transition: 'all 0.3s ease',
                            backgroundColor: '#0a0e17',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {video ? (
                                <video
                                    ref={localVideoref}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transform: 'scaleX(-1)',
                                        display: 'block'
                                    }}
                                />
                            ) : (
                                <Box sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                    color: '#94a3b8',
                                    gap: 1
                                }}>
                                    <Avatar sx={{
                                        width: videos.length === 0 ? 72 : 44,
                                        height: videos.length === 0 ? 72 : 44,
                                        bgcolor: '#2563eb',
                                        fontSize: videos.length === 0 ? '1.8rem' : '1.1rem',
                                        fontWeight: 700
                                    }}>
                                        {(username || "You").charAt(0).toUpperCase()}
                                    </Avatar>
                                    {videos.length === 0 && (
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                            Camera is off
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* Self Label Pill */}
                            <Box sx={{
                                position: 'absolute',
                                top: videos.length === 0 ? { xs: 12, sm: 16 } : 'auto',
                                bottom: videos.length === 0 ? 'auto' : 6,
                                left: videos.length === 0 ? { xs: 12, sm: 16 } : 6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.6,
                                backgroundColor: 'rgba(15, 23, 42, 0.78)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: videos.length === 0 ? '4px 10px' : '2px 6px',
                                borderRadius: '6px',
                                zIndex: 15,
                                maxWidth: videos.length === 0 ? '200px' : { xs: '84px', sm: '130px' },
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                            }}>
                                <Box sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: audio ? '#22c55e' : '#ef4444',
                                    boxShadow: audio ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
                                    flexShrink: 0
                                }} />
                                <Typography variant="caption" sx={{
                                    color: '#f8fafc',
                                    fontWeight: 600,
                                    fontSize: videos.length === 0 ? '0.78rem' : '0.68rem',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {username || "You"} {myRole ? `(${myRole})` : ""}
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Remote Videos */}
                        {videos.map((v) => (
                            <RemoteVideo
                                key={v.socketId}
                                video={v}
                                totalVideos={videos.length}
                                audioOutputDevice={selectedAudioOutputDevice}
                                details={peerDetails[v.socketId]}
                                masterVolume={masterVolume}
                                masterMuted={masterMuted}
                            />
                        ))}
                    </Box>

                    {/* Redesigned Floating Control Dock */}
                    <Box sx={{
                        position: 'fixed',
                        bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '40px',
                        padding: { xs: '4px 8px', sm: '8px 18px' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.6, sm: 1.2 },
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                        zIndex: 100,
                        maxWidth: 'calc(100vw - 16px)'
                    }}>
                        {/* Camera Toggle */}
                        <Tooltip title={video ? "Turn off camera (Ctrl+E)" : "Turn on camera (Ctrl+E)"}>
                            <IconButton
                                aria-label="Toggle camera"
                                onClick={handleVideo}
                                sx={{
                                    width: { xs: 36, sm: 44 },
                                    height: { xs: 36, sm: 44 },
                                    color: 'white',
                                    backgroundColor: video ? 'rgba(255, 255, 255, 0.08)' : '#dc2626',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: video ? 'rgba(255, 255, 255, 0.16)' : '#b91c1c',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                {video ? <VideocamIcon sx={{ fontSize: { xs: 18, sm: 22 } }} /> : <VideocamOffIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                            </IconButton>
                        </Tooltip>

                        {/* Microphone Toggle */}
                        <Tooltip title={audio ? "Mute microphone (Ctrl+D)" : "Unmute microphone (Ctrl+D)"}>
                            <IconButton
                                aria-label="Toggle microphone"
                                onClick={handleAudio}
                                sx={{
                                    width: { xs: 36, sm: 44 },
                                    height: { xs: 36, sm: 44 },
                                    color: 'white',
                                    backgroundColor: audio ? 'rgba(255, 255, 255, 0.08)' : '#dc2626',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: audio ? 'rgba(255, 255, 255, 0.16)' : '#b91c1c',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                {audio ? <MicIcon sx={{ fontSize: { xs: 18, sm: 22 } }} /> : <MicOffIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                            </IconButton>
                        </Tooltip>

                        {/* Screen Share Toggle */}
                        <Tooltip title={screen ? "Stop sharing screen" : "Share screen"}>
                            <IconButton
                                aria-label="Share screen"
                                onClick={handleScreen}
                                sx={{
                                    width: { xs: 36, sm: 44 },
                                    height: { xs: 36, sm: 44 },
                                    color: 'white',
                                    backgroundColor: screen ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: screen ? '#1d4ed8' : 'rgba(255, 255, 255, 0.16)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                {screen ? <StopScreenShareIcon sx={{ fontSize: { xs: 18, sm: 22 } }} /> : <ScreenShareIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                            </IconButton>
                        </Tooltip>

                        {/* Speaker / Master Volume Controller */}
                        <Box className="volume-popover-container" sx={{ position: 'relative' }}>
                            <Tooltip title="Audio output volume">
                                <IconButton
                                    aria-label="Adjust audio volume"
                                    onClick={() => setShowVolumePopup(!showVolumePopup)}
                                    sx={{
                                        width: { xs: 36, sm: 44 },
                                        height: { xs: 36, sm: 44 },
                                        color: 'white',
                                        backgroundColor: showVolumePopup ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                                        border: showVolumePopup ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.16)',
                                            transform: 'translateY(-1px)'
                                        }
                                    }}
                                >
                                    {masterMuted || masterVolume === 0 ? <VolumeOffIcon sx={{ fontSize: { xs: 18, sm: 22 } }} /> : <VolumeUpIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                                </IconButton>
                            </Tooltip>

                            {/* Upward Audio Volume Popup (Stacking zIndex: 300, above control bar) */}
                            <AnimatePresence>
                                {showVolumePopup && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'absolute',
                                            bottom: '50px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            zIndex: 300
                                        }}
                                    >
                                        <Paper
                                            elevation={16}
                                            sx={{
                                                p: 2,
                                                width: { xs: 195, sm: 220 },
                                                backgroundColor: 'rgba(15, 23, 42, 0.96)',
                                                backdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                borderRadius: '16px',
                                                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>Speaker Volume</Typography>
                                                <Typography variant="caption" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                                                    {masterMuted ? "Muted" : `${Math.round(masterVolume * 100)}%`}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    aria-label={masterMuted ? "Unmute speaker" : "Mute speaker"}
                                                    onClick={() => setMasterMuted(!masterMuted)}
                                                    sx={{ color: masterMuted ? '#f87171' : '#94a3b8', p: 0.5 }}
                                                >
                                                    {masterMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                                                </IconButton>
                                                <Slider
                                                    size="small"
                                                    value={masterMuted ? 0 : masterVolume}
                                                    min={0}
                                                    max={1}
                                                    step={0.05}
                                                    onChange={(e, val) => {
                                                        setMasterVolume(val);
                                                        if (val > 0 && masterMuted) setMasterMuted(false);
                                                        if (val === 0 && !masterMuted) setMasterMuted(true);
                                                    }}
                                                    sx={{ color: '#3b82f6' }}
                                                />
                                            </Box>
                                        </Paper>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Box>

                        {/* Settings Button */}
                        <Tooltip title="Device settings">
                            <IconButton
                                aria-label="Open settings"
                                onClick={() => setSettingsOpen(true)}
                                sx={{
                                    width: { xs: 36, sm: 44 },
                                    height: { xs: 36, sm: 44 },
                                    color: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                <SettingsIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
                            </IconButton>
                        </Tooltip>

                        {/* Divider */}
                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', height: 22, my: 'auto', display: { xs: 'none', sm: 'block' } }} />

                        {/* End Call Button */}
                        <Tooltip title="Leave call">
                            <IconButton
                                aria-label="Leave call"
                                onClick={handleEndCall}
                                sx={{
                                    width: { xs: 38, sm: 46 },
                                    height: { xs: 38, sm: 46 },
                                    color: 'white',
                                    backgroundColor: '#dc2626',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: '#b91c1c',
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                <CallEndIcon sx={{ fontSize: { xs: 19, sm: 23 } }} />
                            </IconButton>
                        </Tooltip>

                        {/* Divider */}
                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', height: 22, my: 'auto', display: { xs: 'none', sm: 'block' } }} />

                        {/* Chat Toggle */}
                        <Tooltip title="In-call chat">
                            <IconButton
                                aria-label="Toggle chat"
                                onClick={() => {
                                    setModal(!showModal);
                                    setNewMessages(0);
                                }}
                                sx={{
                                    width: { xs: 36, sm: 44 },
                                    height: { xs: 36, sm: 44 },
                                    color: 'white',
                                    backgroundColor: showModal ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                                    border: showModal ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: showModal ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.16)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                <Badge badgeContent={newMessages} max={99} color="primary">
                                    <ChatIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Chat Drawer */}
                    <Drawer
                        anchor="right"
                        open={showModal}
                        onClose={closeChat}
                        PaperProps={{
                            sx: {
                                width: { xs: '100vw', sm: 360 },
                                backgroundColor: '#0b0f19',
                                color: '#f8fafc',
                                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.7)'
                            }
                        }}
                    >
                        <Box sx={{
                            p: { xs: 2, sm: 2.5 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ChatIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                                        In-call messages
                                    </Typography>
                                </Box>
                                <IconButton aria-label="Close chat" onClick={closeChat} sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}>
                                    <CloseIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Box>

                            <Box sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '10px',
                                p: 1.2,
                                mb: 2
                            }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.4, display: 'block' }}>
                                    Messages are visible only to participants in this call and are deleted when the call ends.
                                </Typography>
                            </Box>

                            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                            <Box sx={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                my: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                pr: 0.5
                            }}>
                                {messages.length !== 0 ? messages.map((item, index) => {
                                    const isSelf = item.sender === username;
                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                alignSelf: isSelf ? 'flex-end' : 'flex-start',
                                                backgroundColor: isSelf ? '#2563eb' : 'rgba(255, 255, 255, 0.06)',
                                                border: isSelf ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                                                padding: '8px 14px',
                                                borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                                maxWidth: '82%',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                                            }}
                                        >
                                            <Typography variant="caption" sx={{
                                                color: isSelf ? '#bfdbfe' : '#94a3b8',
                                                fontWeight: 600,
                                                fontSize: '0.7rem',
                                                display: 'block',
                                                mb: 0.2
                                            }}>
                                                {isSelf ? "You" : item.sender}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#f8fafc', fontSize: '0.86rem', wordBreak: 'break-word' }}>
                                                {item.data}
                                            </Typography>
                                        </Box>
                                    );
                                }) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: 1 }}>
                                        <ChatIcon sx={{ fontSize: 36, opacity: 0.4 }} />
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>No messages yet</Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <TextField
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Send a message..."
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            fontSize: '0.86rem',
                                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.25)' },
                                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && message.trim()) {
                                            sendMessage();
                                        }
                                    }}
                                />
                                <IconButton
                                    aria-label="Send message"
                                    onClick={() => {
                                        if (message.trim()) sendMessage();
                                    }}
                                    disabled={!message.trim()}
                                    sx={{
                                        color: 'white',
                                        backgroundColor: '#2563eb',
                                        borderRadius: '12px',
                                        p: 1,
                                        '&:hover': { backgroundColor: '#1d4ed8' },
                                        '&.Mui-disabled': { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#64748b' }
                                    }}
                                >
                                    <SendIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Drawer>

                </Box>

            }

            {/* Device Settings Dialog (Moved to Root) */}
            <Dialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: '#0f172a',
                        color: 'white',
                        borderRadius: { xs: '20px 20px 0 0', sm: '20px' },
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
                        minWidth: { xs: '100vw', sm: '420px' },
                        margin: { xs: 0, sm: '32px' },
                        position: { xs: 'fixed', sm: 'relative' },
                        bottom: { xs: 0, sm: 'auto' },
                        paddingBottom: { xs: 'calc(8px + env(safe-area-inset-bottom, 0px))', sm: 0 }
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, letterSpacing: '-0.01em', pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    Device Settings
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3, pb: 1 }}>
                    <TextField
                        select
                        fullWidth
                        variant="outlined"
                        label="Camera"
                        value={selectedVideoDevice}
                        onChange={(e) => applyDeviceChanges(e.target.value, selectedAudioInputDevice)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                            },
                            '& .MuiInputLabel-root': { color: '#94a3b8' },
                            '& .MuiSvgIcon-root': { color: '#94a3b8' }
                        }}
                    >
                        {videoDevices.map(d => (
                            <MenuItem key={d.deviceId} value={d.deviceId}>
                                {d.label || `Camera ${videoDevices.indexOf(d) + 1}`}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        variant="outlined"
                        label="Microphone"
                        value={selectedAudioInputDevice}
                        onChange={(e) => applyDeviceChanges(selectedVideoDevice, e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                            },
                            '& .MuiInputLabel-root': { color: '#94a3b8' },
                            '& .MuiSvgIcon-root': { color: '#94a3b8' }
                        }}
                    >
                        {audioInputDevices.map(d => (
                            <MenuItem key={d.deviceId} value={d.deviceId}>
                                {d.label || `Microphone ${audioInputDevices.indexOf(d) + 1}`}
                            </MenuItem>
                        ))}
                    </TextField>

                    {typeof HTMLMediaElement.prototype.setSinkId === 'function' && (
                        <TextField
                            select
                            fullWidth
                            variant="outlined"
                            label="Speaker"
                            value={selectedAudioOutputDevice}
                            onChange={(e) => setSelectedAudioOutputDevice(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                                },
                                '& .MuiInputLabel-root': { color: '#94a3b8' },
                                '& .MuiSvgIcon-root': { color: '#94a3b8' }
                            }}
                        >
                            {audioOutputDevices.map(d => (
                                <MenuItem key={d.deviceId} value={d.deviceId}>
                                    {d.label || `Speaker ${audioOutputDevices.indexOf(d) + 1}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Button
                        variant="contained"
                        onClick={() => setSettingsOpen(false)}
                        sx={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '10px',
                            px: 3,
                            py: 0.8,
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1d4ed8' }
                        }}
                    >
                        Done
                    </Button>
                </DialogActions>
            </Dialog>

            {/* End Call Confirmation Dialog */}
            <Dialog
                open={showEndCallModal}
                onClose={() => setShowEndCallModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    sx: {
                        backgroundColor: '#0f172a',
                        color: 'white',
                        borderRadius: '18px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
                        minWidth: { xs: '85vw', sm: '340px' }
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 800, pb: 1 }}>
                    {"Leave Meeting?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Are you sure you want to disconnect and leave the meeting?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 20px', gap: 1 }}>
                    <Button
                        onClick={() => setShowEndCallModal(false)}
                        sx={{
                            color: '#94a3b8',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2,
                            '&:hover': { color: '#f8fafc', backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                        }}
                    >
                        Stay
                    </Button>
                    <Button
                        onClick={confirmEndCall}
                        variant="contained"
                        autoFocus
                        sx={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '10px',
                            textTransform: 'none',
                            px: 2.5,
                            py: 0.8,
                            '&:hover': { backgroundColor: '#b91c1c' }
                        }}
                    >
                        Leave Call
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Admin Join Request Dialog */}
            <Dialog 
                open={joinRequests.length > 0} 
                PaperProps={{
                    sx: {
                        backgroundColor: '#0f172a',
                        color: 'white',
                        borderRadius: '18px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
                        minWidth: { xs: '85vw', sm: '360px' }
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Guest Admittance</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#94a3b8' }}>
                        <strong style={{ color: '#60a5fa' }}>{joinRequests[0]?.username}</strong> is waiting in the lobby to join the meeting.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 20px', gap: 1 }}>
                    <Button
                        onClick={() => handleJoinResponse(joinRequests[0].socketId, false)}
                        sx={{
                            color: '#f87171',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '10px',
                            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                        }}
                    >
                        Deny Entry
                    </Button>
                    <Button
                        onClick={() => handleJoinResponse(joinRequests[0].socketId, true)}
                        variant="contained"
                        sx={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '10px',
                            px: 2.5,
                            '&:hover': { backgroundColor: '#1d4ed8' }
                        }}
                    >
                        Admit
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}