'use client'

import {useState} from "react";
import {Box, Button, Stack, TextField} from "@mui/material";

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi, I'm the Support Agent, how can I assist you today ?"
        }
    ]);
    const [message, setMessage] = useState('')

    const sendMessage = async () => {
        setMessages((message) => [
            ...message,
            {role: 'user', content: message},
            {role: 'assistant', content: ""}
        ])

        const response = fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([...messages, {role: 'user', content: message}])
        }).then(async (res) => {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let result = '';
            return reader.read().then(
                function processText({ done, value }) {
                    if (done) return result;
                    const text = decoder.decode(value || new Int8Array(), { stream: true });
                    setMessages((messages) => {
                        let lastMsg = messages[messages.length - 1];
                        let otherMsgs = messages.slice(0, messages.length - 1);
                        return [
                            ...otherMsgs,
                            {
                                ...lastMsg,
                                content: lastMsg.content + text
                            }
                        ];
                    });
                    return reader.read().then(processText);
                }
            );

        })

        setMessage('')
    }

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Stack
                direction="column"
                width="600px"
                height="700px"
                border="1px solid black"
                p={2}
                spacing={3}
            >
                <Stack
                    direction="column"
                    spacing={2}
                    flexGrow={1}
                    overflow="auto"
                    maxHeight="100%"
                >
                    {
                        messages.map((message, index) => (
                            <Box
                                 key={index}
                                 display="flex"
                                 justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                            >
                              <Box
                                  sx={{backgroundColor: message.role === 'assistant' ? 'primary.main' : 'secondary.main'}}
                                  color="white"
                                  borderRadius={16}
                                  p={3}
                              >
                                {message.content}
                              </Box>
                            </Box>
                        ))
                    }
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField
                        label="message"
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        />
                    <Button variant="contained" sx={{paddingX: "40px"}} onClick={sendMessage}>
                        Send
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
