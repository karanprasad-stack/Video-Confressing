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

const RemoteVideo = ({ video, totalVideos, audioOutputDevice, details }) => {
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
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    return (
        <Paper elevation={10} sx={{
            borderRadius: 4,
            overflow: 'hidden',
            height: 'auto',
            width: totalVideos === 1 ? '75vw' : (totalVideos === 2 ? '40vw' : '28vw'),
            aspectRatio: '16/9',
            position: 'relative',
            border: totalVideos === 1 ? '2px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
            backgroundColor: 'black',
            '&:hover .video-controls': { opacity: 1 }
        }}>
            <video
                data-socket={video.socketId}
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            >
            </video>

            {details && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 15,
                    left: 15,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    padding: '4px 12px',
                    borderRadius: '15px',
                    backdropFilter: 'blur(4px)',
                    zIndex: 20,
                    maxWidth: '150px',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {details.username} ({details.role})
                    </Typography>
                </Box>
            )}
            
            {/* Hover UI for Volume */}
            <Box className="video-controls" sx={{
                position: 'absolute',
                bottom: 15,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '4px 16px',
                borderRadius: '25px',
                backdropFilter: 'blur(4px)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                width: '200px',
                zIndex: 20
            }}>
                <IconButton 
                    size="small" 
                    onClick={() => setIsMuted(!isMuted)}
                    sx={{ color: isMuted || volume === 0 ? '#f44336' : 'white', mr: 1 }}
                >
                    {isMuted || volume === 0 ? <VolumeOffIcon fontSize="small"/> : <VolumeUpIcon fontSize="small"/>}
                </IconButton>
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
                    sx={{ color: '#ff9839' }}
                />
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

    const navigate = useNavigate();
    const location = useLocation();
    const { url } = useParams();

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

            connections[id].addStream(window.localStream)

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
                connections[id].addStream(window.localStream)

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
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
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

                <Box component="main" sx={{ height: '100vh', width: '100vw', overflow: 'hidden', background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <CssBaseline />

                    <Button
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/')}
                        sx={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            color: 'white',
                            borderColor: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: '#FF9839',
                            }
                        }}
                        variant="outlined"
                    >
                        Back to Home
                    </Button>


                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper
                            elevation={6}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 4,
                                borderRadius: 3,
                                maxWidth: 500,
                                width: '90vw',
                                backgroundColor: '#fff',
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: '#ff9839', width: 56, height: 56 }}>
                                <GroupsIcon sx={{ fontSize: 30 }} />
                            </Avatar>

                            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: '#333', mt: 1 }}>
                                Join as Guest
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#666', mb: 3, textAlign: 'center' }}>
                                Enter your name to join the meeting
                            </Typography>

                            <Box sx={{ width: '100%' }}>
                                <TextField
                                    id="outlined-basic"
                                    label="Username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />

                                <Button
                                    variant="contained"
                                    onClick={connect}
                                    disabled={!username}
                                    fullWidth
                                    sx={{
                                        mb: 3,
                                        borderRadius: '30px',
                                        backgroundColor: '#ff9839',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        padding: '12px',
                                        '&:hover': { backgroundColor: '#e08933' }
                                    }}
                                >
                                    Connect
                                </Button>

                                <Box sx={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    border: '1px solid #eee',
                                    width: '100%',
                                    aspectRatio: '16/9',
                                    backgroundColor: 'black'
                                }}>
                                    <video ref={localVideoref} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                </Box> : isWaitingForApproval ?
                <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1e1e1e, #000000)', color: 'white' }}>
                    <CircularProgress size={60} sx={{ color: '#ff9839', mb: 4 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Waiting for host to admit you...</Typography>
                    <Typography variant="body1" sx={{ color: '#aaa', mt: 1 }}>Please hold, someone will let you in shortly.</Typography>
                </Box> :


                // Meeting View
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #2c3e50, #000000)',
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Main Video Area */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 2,
                        gap: 2,
                        flexWrap: 'wrap',
                        overflowY: 'auto'
                    }}>
                        {/* Local Video */}
                        <Paper elevation={10} sx={{
                            borderRadius: 4,
                            overflow: 'hidden',
                            height: videos.length === 0 ? 'auto' : (videos.length === 1 ? '180px' : 'auto'),
                            width: videos.length === 0 ? '60vw' : (videos.length === 1 ? '240px' : (videos.length === 2 ? '40vw' : '28vw')),
                            aspectRatio: '16/9',
                            position: videos.length === 1 ? 'absolute' : 'relative',
                            bottom: videos.length === 1 ? 40 : 'auto',
                            right: videos.length === 1 ? 40 : 'auto',
                            zIndex: videos.length === 1 ? 10 : 1,
                            border: '3px solid rgba(255,152,57, 0.7)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                            transition: 'all 0.3s ease',
                            backgroundColor: 'black'
                        }}>
                            <video ref={localVideoref} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}></video>
                            <Box sx={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '15px', backdropFilter: 'blur(4px)', maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {username || "You"} ({myRole || "connecting..."})
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Remote Videos */}
                        {videos.map((video) => (
                            <RemoteVideo key={video.socketId} video={video} totalVideos={videos.length} audioOutputDevice={selectedAudioOutputDevice} details={peerDetails[video.socketId]} />
                        ))}
                    </Box>

                    {/* Floating Controls */}
                    <Box sx={{
                        position: 'fixed',
                        bottom: 30,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '50px',
                        padding: '10px 30px',
                        display: 'flex',
                        gap: 2,
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                        zIndex: 1000
                    }}>
                        <IconButton onClick={handleVideo} sx={{ color: 'white', backgroundColor: video ? 'rgba(255,255,255,0.2)' : '#f44336', '&:hover': { backgroundColor: video ? 'rgba(255,255,255,0.3)' : '#d32f2f' } }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleAudio} sx={{ color: 'white', backgroundColor: audio ? 'rgba(255,255,255,0.2)' : '#f44336', '&:hover': { backgroundColor: audio ? 'rgba(255,255,255,0.3)' : '#d32f2f' } }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleScreen} sx={{ color: 'white', backgroundColor: screen ? '#2196f3' : 'rgba(255,255,255,0.2)', '&:hover': { backgroundColor: screen ? '#1976d2' : 'rgba(255,255,255,0.3)' } }}>
                            {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                        </IconButton>

                        <IconButton onClick={() => setSettingsOpen(true)} sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' } }}>
                            <SettingsIcon />
                        </IconButton>

            {/* Device Settings Dialog */}
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} PaperProps={{ sx: { backgroundColor: '#1e293b', color: 'white', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Device Settings</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: '350px', pt: 2 }}>
                    
                    <TextField
                        select
                        fullWidth
                        variant="outlined"
                        label="Camera"
                        value={selectedVideoDevice}
                        onChange={(e) => applyDeviceChanges(e.target.value, selectedAudioInputDevice)}
                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' } }, '& .MuiInputLabel-root': { color: '#94a3b8', backgroundColor: '#1e293b', px: 0.5 }, '& .MuiSvgIcon-root': { color: 'white' } }}
                    >
                        {videoDevices.map(d => <MenuItem key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${videoDevices.indexOf(d) + 1}`}</MenuItem>)}
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        variant="outlined"
                        label="Microphone"
                        value={selectedAudioInputDevice}
                        onChange={(e) => applyDeviceChanges(selectedVideoDevice, e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' } }, '& .MuiInputLabel-root': { color: '#94a3b8', backgroundColor: '#1e293b', px: 0.5 }, '& .MuiSvgIcon-root': { color: 'white' } }}
                    >
                        {audioInputDevices.map(d => <MenuItem key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${audioInputDevices.indexOf(d) + 1}`}</MenuItem>)}
                    </TextField>

                    {typeof HTMLMediaElement.prototype.setSinkId === 'function' && (
                        <TextField
                            select
                            fullWidth
                            variant="outlined"
                            label="Speaker"
                            value={selectedAudioOutputDevice}
                            onChange={(e) => setSelectedAudioOutputDevice(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' } }, '& .MuiInputLabel-root': { color: '#94a3b8', backgroundColor: '#1e293b', px: 0.5 }, '& .MuiSvgIcon-root': { color: 'white' } }}
                        >
                            {audioOutputDevices.map(d => <MenuItem key={d.deviceId} value={d.deviceId}>{d.label || `Speaker ${audioOutputDevices.indexOf(d) + 1}`}</MenuItem>)}
                        </TextField>
                    )}

                </DialogContent>
                <DialogActions sx={{ padding: '20px' }}>
                    <Button variant="contained" onClick={() => setSettingsOpen(false)} sx={{ backgroundColor: '#ff9839', color: 'white', '&:hover': { backgroundColor: '#e08933' }, borderRadius: '20px', padding: '6px 20px' }}>Done</Button>
                </DialogActions>
            </Dialog>

                        <IconButton onClick={handleEndCall} sx={{ color: 'white', backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}>
                            <CallEndIcon />
                        </IconButton>

                        <IconButton onClick={() => {
                            setModal(!showModal);
                            setNewMessages(0);
                        }} sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' } }}>
                            <Badge badgeContent={newMessages} max={99} color="secondary">
                                <ChatIcon />
                            </Badge>
                        </IconButton>


                    </Box>

                    {/* Meeting Code Display */}
                    <Box sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        padding: '10px 20px',
                        borderRadius: '15px',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Code:</Typography>
                        <Typography variant="body1" sx={{ letterSpacing: 1 }}>{url}</Typography>
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(url)} sx={{ color: 'white', ml: 1 }}>
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Box>


                    {/* Chat Drawer */}
                    <Drawer
                        anchor="right"
                        open={showModal}
                        onClose={closeChat}
                        PaperProps={{
                            sx: {
                                width: 350,
                                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                borderLeft: '1px solid rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Chat Room</Typography>
                                <IconButton onClick={closeChat} sx={{ color: 'white' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

                            <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {messages.length !== 0 ? messages.map((item, index) => (
                                    <Box key={index} sx={{
                                        alignSelf: item.sender === username ? 'flex-end' : 'flex-start',
                                        backgroundColor: item.sender === username ? '#1976d2' : 'rgba(255,255,255,0.1)',
                                        padding: '10px 15px',
                                        borderRadius: '15px',
                                        maxWidth: '80%'
                                    }}>
                                        <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mb: 0.5 }}>{item.sender}</Typography>
                                        <Typography variant="body1">{item.data}</Typography>
                                    </Box>
                                )) : <Typography sx={{ textAlign: 'center', color: '#666', mt: 5 }}>No messages yet</Typography>}
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            borderRadius: '20px',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            sendMessage();
                                        }
                                    }}
                                />
                                <IconButton onClick={sendMessage} sx={{ color: '#1976d2', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Drawer>

                </Box>

            }

            {/* End Call Confirmation Dialog */}
            <Dialog
                open={showEndCallModal}
                onClose={() => setShowEndCallModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    sx: {
                        backgroundColor: '#1e1e1e',
                        color: 'white',
                        borderRadius: '15px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        minWidth: '300px'
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold' }}>
                    {"End Call?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" sx={{ color: '#aaa' }}>
                        Are you sure you want to leave the meeting?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '20px' }}>
                    <Button
                        onClick={() => setShowEndCallModal(false)}
                        sx={{ color: '#aaa', '&:hover': { color: 'white' } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmEndCall}
                        variant="contained"
                        autoFocus
                        sx={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            '&:hover': { backgroundColor: '#d32f2f' },
                            borderRadius: '20px',
                            padding: '6px 20px'
                        }}
                    >
                        End Call
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Admin Join Request Dialog */}
            <Dialog 
                open={joinRequests.length > 0} 
                PaperProps={{ sx: { backgroundColor: '#1e1e1e', color: 'white', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Guest Admittance</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#ccc' }}>
                        <strong style={{ color: '#fff' }}>{joinRequests[0]?.username}</strong> is waiting in the lobby to join the meeting.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '20px' }}>
                    <Button onClick={() => handleJoinResponse(joinRequests[0].socketId, false)} sx={{ color: '#f44336' }}>Deny Entry</Button>
                    <Button onClick={() => handleJoinResponse(joinRequests[0].socketId, true)} variant="contained" sx={{ backgroundColor: '#ff9839', '&:hover': { backgroundColor: '#e08933' } }}>Admit</Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}