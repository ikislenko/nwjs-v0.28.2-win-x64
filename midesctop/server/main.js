const WebSocketServer = require("ws").Server;
const Session = require('./Session');
const Client = require('./Client');

const server = new WebSocketServer({ port: 9000 });
const sessions = new Map;

function createId(Len = 6, chars = "abcdefghijklmnopqrstuvwxyz0123456789") {
    let id = "";

    while (Len--) {
        id += chars[Math.random() * chars.length | 0];
    }

    return id;
}

function createSession(id = createId()) {
    let result = Set;

    if (sessions.has(id)) {
        throw new Error(`Session ${id} already exist!`);
    }

    if (sessions.size > 0) {
        const it = sessions.values();
        let session = it.next();
        session = session.value;
        result = { session: session, join: true}
    } else {
        const session = new Session(id);
        console.log("Create session", session);
        sessions.set(id, session);
        result = { session: session, join: false }
    }
    return result;
}

function getSession(id) {
    return sessions.get(id);
}

function broadcastSession(session) {
    const clients = [...session.clients];

    clients.forEach(client => {
        client.send({
            type: "session-broadcast",
            peers: {
                you: client.id,
                clients: clients.map(client => {
                    return {
                        id: client.id,
                        state: client.state
                    }
                }),
            },
        });
    });
}

function createClient(conn, id = createId()) {
    return new Client(conn, id);
}

server.on("connection", conn => {
    console.log("Connection established!");

    const client = createClient(conn);

    conn.on("message", msg => {
        console.log("Message received!", msg);
        const data = JSON.parse(msg);
        if (data.type === "create-session") {
            const session = createSession();
            if (session.join) {
                // const session = getSession(data.id) || createSession(data.id);
                client.state = data.state;
                session.session.join(client);
                broadcastSession(session.session);
            } else {
                session.session.join(client);
                sessions.set(session.session.id, session.session);
                client.state = data.state;
                client.send({
                    type: "session-created",
                    id: session.session.id
                });
            }
        } else if (data.type === "state-update") {
            const [prop, value] = data.state;
            client.state[data.fragment][prop] = value;  
            client.broadcast(data);
        }
    });
    
    conn.on("close", () => {
        console.log("Connection closed!");

        const session = client.session;

        if (session) {
            session.leave(client);
            if (session.clients.size === 0) {
                sessions.delete(session.id);
            }
        }

        broadcastSession(session);
    });

    conn.on('error', event => console.log('errored' ,event));
});