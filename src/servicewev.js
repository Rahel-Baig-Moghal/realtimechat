const myVar = import.meta.env.VITE_WSS_URL;

class WebSocketService {
    static instance = null;
    callbacks = {};

    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    constructor() {
        this.socketRef = null;
    }

    connect(userId) {
        if (this.socketRef && this.state() !== WebSocket.CLOSED) {
            console.log("WebSocket is already open or in the process of connecting.");
            return;
        }
        const endpoint = `${myVar}?userId=${userId}`;
        console.log("Attempting to connect to WebSocket at", endpoint);

        if (!endpoint) {
            console.error("WebSocket URL is not defined!");
            return;
        }

        this.socketRef = new WebSocket(endpoint);

        this.socketRef.onopen = () => {
            console.log("WebSocket connection opened.");
        };

        this.socketRef.onmessage = (e) => {
            console.log("Message received: ", e.data);
            this.socketNewMessage(e.data);
        };

        this.socketRef.onerror = (e) => {
            console.error("WebSocket error: ", e);
        };

        this.socketRef.onclose = (e) => {
            console.log("WebSocket connection closed", e.reason);
            // Remove reconnection logic to fix disconnect issue
        };
    }

    disconnect() {
        if (this.socketRef) {
            this.socketRef.close();
            this.socketRef = null;
            console.log("WebSocket disconnected.");
        }
    }

    socketNewMessage(data) {
        const parsedData = JSON.parse(data);
        if (Object.keys(this.callbacks).length) {
            this.callbacks["newMessage"](parsedData);
        }
    }

    sendMessage(data) {
        try {
            this.socketRef.send(JSON.stringify(data));
        } catch (err) {
            console.error("Error sending message:", err.message);
        }
    }

    addCallbacks(newMessageCallback) {
        this.callbacks["newMessage"] = newMessageCallback;
    }

    state() {
        return this.socketRef ? this.socketRef.readyState : WebSocket.CLOSED;
    }
}

const WebSocketInstance = WebSocketService.getInstance();
export default WebSocketInstance;