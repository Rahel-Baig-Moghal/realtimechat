import React, { useState, useEffect } from "react";
import WebSocketInstance from "./servicewev";
import './App.css';

function App() {
    const [message, setMessage] = useState("");
    const [recipient, setRecipient] = useState("user2");
    const [messages, setMessages] = useState([]);
    const [isGroup, setIsGroup] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState("user1");

    const users = ["user1", "user2", "user3"];
    const groups = ["group1", "group2"];

    const handleNewMessage = (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const connectWebSocket = () => {
        WebSocketInstance.connect(currentUser);
        WebSocketInstance.addCallbacks(handleNewMessage);
        setIsConnected(true);
    };

    const disconnectWebSocket = () => {
        WebSocketInstance.disconnect();
        setIsConnected(false);
        setMessages([]);
    };

    const sendMessage = () => {
        if (message.trim() === "") return;

        const payload = {
            action: "sendmessage",
            senderId: currentUser,
            recipientId: recipient,
            content: message,
            type: isGroup ? "group" : "user"
        };

        // Add sent message to the chat immediately
        setMessages((prevMessages) => [
            ...prevMessages,
            { senderId: currentUser, recipientId: recipient, content: message }
        ]);

        WebSocketInstance.sendMessage(payload);
        setMessage(""); // Clear the input field
    };

    useEffect(() => {
        return () => {
            disconnectWebSocket();
        };
    }, []);

    return (
        <div className="chat-app">
            <header className="app-header">
                <h1>Simple Chat App</h1>
                <div className="user-select">
                    <label>You are: </label>
                    <select value={currentUser} onChange={(e) => setCurrentUser(e.target.value)}>
                        {users.map(user => (
                            <option key={user} value={user}>{user}</option>
                        ))}
                    </select>
                </div>
                {isConnected ? (
                    <button onClick={disconnectWebSocket} className="disconnect-btn">Disconnect</button>
                ) : (
                    <button onClick={connectWebSocket} className="connect-btn">Connect</button>
                )}
            </header>

            <div className="chat-container">
                <div className="message-list">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.senderId === currentUser ? 'sent' : 'received'}`}>
                            <span className="sender">{msg.senderId}</span>
                            <p>{msg.content}</p>
                            <span className="recipient">to {msg.recipientId}</span>
                        </div>
                    ))}
                </div>

                <div className="message-input">
                    <div className="input-group">
                        <label>
                            <input
                                type="radio"
                                checked={!isGroup}
                                onChange={() => setIsGroup(false)}
                            /> User
                        </label>
                        <label>
                            <input
                                type="radio"
                                checked={isGroup}
                                onChange={() => setIsGroup(true)}
                            /> Group
                        </label>
                        <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                            {isGroup
                                ? groups.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))
                                : users.filter(user => user !== currentUser).map(user => (
                                    <option key={user} value={user}>{user}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message"
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
