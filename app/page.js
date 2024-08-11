'use client'

import { useState, useEffect } from "react";
import { Box, Button, Stack, TextField, IconButton } from "@mui/material";
import { useChat } from "ai/react";
import { auth, provider, signInWithPopup, signOut, db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import ReactMarkdown from 'react-markdown';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Home() {
    const [user, setUser] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const { messages, input, handleInputChange, handleSubmit, isLoading, stop, setMessages } =
        useChat({
            api: "api/chat",
        });

    useEffect(() => {
        if (user) {
            loadChatHistory();
        } else {
            setCurrentChat(null);
        }
    }, [user]);


    useEffect(() => {
        const handleSubmitWithSave = async () => {
            let updatedMessages = messages.map((message) => ({
                role: message.role,
                content: message.content,
            }));
            const updatedChat = { ...currentChat, messages: updatedMessages };


            if (user) {
                const chatDocRef = doc(db, "users", user.uid, "chats", currentChat.id);
                await setDoc(chatDocRef, updatedChat);
                setChatHistory(chatHistory.map(chat => (chat.id === currentChat.id ? updatedChat : chat)));

                // Rename the chat based on the first message
                if (currentChat.name === "New Chat" && updatedMessages.length === 1) {
                    const firstMessage = updatedMessages[0].content.split(' ').slice(0, 5).join(' ');
                    const updatedChatWithName = { ...updatedChat, name: firstMessage };

                    await setDoc(chatDocRef, updatedChatWithName);
                    setChatHistory(chatHistory.map(chat => (chat.id === currentChat.id ? updatedChatWithName : chat)));
                    setCurrentChat(updatedChatWithName);
                }
            }
        };
        handleSubmitWithSave();
    }, [messages]);


    const loadChatHistory = async () => {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "chats"));
        const loadedChatHistory = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Set the most recent chat if available
        if (loadedChatHistory.length > 0) {
            const mostRecentChat = loadedChatHistory[loadedChatHistory.length - 1];
            setChatHistory(loadedChatHistory);
            setCurrentChat(mostRecentChat);
            setMessages(mostRecentChat.messages || []);
        } else {
            setChatHistory(loadedChatHistory);
            setCurrentChat(null);
            setMessages([]);
        }
    };


    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setChatHistory([]);
        setCurrentChat(null);
    };

    const handleNewChat = async () => {
        const newChatDoc = await addDoc(collection(db, "users", user.uid, "chats"), {
            name: "New Chat",
            messages: [],
            timestamp: new Date()
        });
        const newChat = { id: newChatDoc.id, name: "New Chat", messages: [] };
        setChatHistory([...chatHistory, newChat]);
        setCurrentChat(newChat);
        setMessages([]);
    };

    const handleSelectChat = (chat) => {
        setCurrentChat(chat);
        setMessages(chat.messages || []);
    };

    const handleDeleteChat = async (id) => {
        await deleteDoc(doc(db, "users", user.uid, "chats", id));
        setChatHistory(chatHistory.filter(chat => chat.id !== id));
        if (currentChat?.id === id) {
            setCurrentChat(null);
            setMessages([]);
        }
    };



    if (!user) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <Button variant="contained" onClick={handleLogin}>
                    Sign in with Google
                </Button>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="row" height="100vh">
            <Box width="250px" bgcolor="grey.200" p={2}>
                {/* Sidebar for Chat History */}
                <Button variant="contained" fullWidth onClick={handleNewChat} sx={{ marginBottom: 2 }}>
                    New Chat
                </Button>
                <Stack spacing={2}>
                    {chatHistory.map((chat) => (
                        <Box
                            key={chat.id}
                            p={2}
                            bgcolor={currentChat?.id === chat.id ? 'primary.main' : 'white'}
                            borderRadius={4}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            onClick={() => handleSelectChat(chat)}
                            sx={{ cursor: 'pointer' }}
                        >
                            <Box color={currentChat?.id === chat.id ? 'white' : 'black'}>
                                {chat.name}
                            </Box>
                            <IconButton size="small" onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(chat.id);
                            }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
                <Button variant="contained" fullWidth onClick={handleLogout} sx={{ marginTop: 2 }}>
                    Logout
                </Button>
            </Box>

            <Box flexGrow={1} display="flex" flexDirection="column">
                <Box
                    flexGrow={1}
                    overflowY="auto"
                    p={3}
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-end"
                >
                    <Stack spacing={2}>
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                alignSelf={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                                color="white"
                                p={2}
                                whiteSpace="pre-wrap"
                                sx={{
                                    borderRadius: message.role === 'assistant' ? '16px 16px 16px 0px' : '16px 16px 0px 16px',
                                    paddingLeft: message.role === 'assistant' ? '25px' : '15px',
                                    paddingRight: message.role === 'assistant' ? '15px' : '25px'
                                }}
                            >
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </Box>
                        ))}
                    </Stack>
                </Box>


                <Box p={3}>
                    <form onSubmit={handleSubmit}>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Ask me about games 🎮!"
                                fullWidth
                                value={input}
                                onChange={handleInputChange}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ paddingX: "40px" }}
                                disabled={isLoading}
                            >
                                Send
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Box>
        </Box>
    );
}
