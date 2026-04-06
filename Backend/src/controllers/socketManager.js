import { Server } from "socket.io"


export let connections = {}
let roomAdmins = {}
let userDetails = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED")

        socket.on("join-call", (path, isAuthenticated = false, username = "") => {

            if (connections[path] === undefined) {
                connections[path] = []
            }
            if (roomAdmins[path] === undefined) {
                roomAdmins[path] = []
            }
            if (userDetails[path] === undefined) {
                userDetails[path] = {}
            }
            if (isAuthenticated) {
                roomAdmins[path].push(socket.id)
            }
            
            userDetails[path][socket.id] = { username, role: isAuthenticated ? "admin" : "guest" };
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            // connections[path].forEach(elem => {
            //     io.to(elem)
            // })

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
                io.to(connections[path][a]).emit("all-users-details", userDetails[path])
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }

        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("join-request", (path, guestData) => {
            console.log("RECEIVED JOIN-REQUEST FOR", path, guestData, "FROM", socket.id);
            if (!connections[path] || connections[path].length === 0) {
                console.log("ROOM EMPTY, AUTO APPROVING AS ADMIN");
                io.to(socket.id).emit("join-approved", true);
            } else if (roomAdmins[path] && roomAdmins[path].length > 0) {
                const primaryAdminId = roomAdmins[path][0];
                console.log("FORWARDING TO ADMIN", primaryAdminId);
                io.to(primaryAdminId).emit("guest-requesting-join", { socketId: socket.id, username: guestData.username });
            } else {
                console.log("NO ADMINS LEFT, AUTO APPROVING AS ADMIN");
                io.to(socket.id).emit("join-approved", true);
            }
        })

        socket.on("join-response", (path, guestSocketId, isApproved) => {
            if (isApproved) {
                io.to(guestSocketId).emit("join-approved");
            } else {
                io.to(guestSocketId).emit("join-denied");
            }
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)

                        if (roomAdmins[key]) {
                            var adminIndex = roomAdmins[key].indexOf(socket.id)
                            if (adminIndex > -1) roomAdmins[key].splice(adminIndex, 1)
                        }
                        
                        if (userDetails[key]) {
                            delete userDetails[key][socket.id]
                            for (let a = 0; a < connections[key].length; ++a) {
                                io.to(connections[key][a]).emit("all-users-details", userDetails[key])
                            }
                        }

                        if (connections[key].length === 0) {
                            delete connections[key]
                            if (roomAdmins[key]) delete roomAdmins[key]
                            if (userDetails[key]) delete userDetails[key]
                        }
                    }
                }

            }


        })


    })


    return io;
}
