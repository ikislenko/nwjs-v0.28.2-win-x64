class ConnectionManager {
    constructor(tetrisManager) {
        this.conn = null;
        this.peers = new Map;
        this.sessionId = null;
        this.tetrisManager = tetrisManager;
        this.localTetris = [...tetrisManager.instances][0];
    }

    connect(address) {
        this.conn = new WebSocket(address);
        this.conn.addEventListener("open", () => { 
            console.log("Connection established!");
            this.initSession();
            this.watchEvent();
        });

        this.conn.addEventListener("message", event => {
            console.log("Recived message", event.data);
            this.receive(event.data);
        });
    }

    initSession() {
        const state = this.localTetris.serialize();

        if (this.sessionId) {
            this.send({
                type: "join-session",
                id: this.sessionId,
                state,
            });
        } else {
            this.send({
                type: "create-session",
                state,
            });
        }
    }

    updateManager(peers) {
        const me = peers.you;
        const clients = peers.clients.filter(client => me !== client.id);

        clients.forEach(client => {
            if (!this.peers.has(client.id)) {
                const tetris = this.tetrisManager.createPlayer();
                tetris.unserialize(client.state);
                this.peers.set(client.id, tetris);
            }
        });

        [...this.peers.entries()].forEach(([id, tetris]) => {
            if (!clients.some(client=> client.id === id)) {
                this.tetrisManager.removePlayer(tetris);
                this.peers.delete(id);
            }
        });
    }

    updatePeer(id, fragment, [prop, value]) {
        if (!this.peers.has(id)) {
            console.error("Client does not exist", id);
            return;
        }

        const tetris = this.peers.get(id);
        tetris[fragment][prop] = value;

        if (prop === "score") {
            tetris.updateScore(value);
        } else {
            tetris.draw();
        }
    }

    watchEvent() {
        const local = this.localTetris;
        const player = local.player; 
        const arena = local.arena;

        ["pos", "matrix", "score"].forEach(prop => {
            player.events.listen(prop, value => {
                this.send({
                    type: "state-update",
                    fragment: "player",
                    state: [prop, value]
                });
            });
        });

        ["matrix"].forEach(prop => {
            arena.events.listen(prop, value => {
                this.send({
                    type: "state-update",
                    fragment: "arena",
                    state: [prop, value]
                });
            });
        });
    }

    receive(msg) {
        const data = JSON.parse(msg);

        if (data.type === "session-created") {
           this.sessionId = data.id;
        } else if (data.type === "session-broadcast") {
            this.updateManager(data.peers);
        } else if (data.type === "state-update") {
            this.updatePeer(data.clientId, data.fragment, data.state);
        }
    }

    send(data) {
        const msg = JSON.stringify(data);
        console.log(`Sending message ${msg}`);
        this.conn.send(msg);
    }
}