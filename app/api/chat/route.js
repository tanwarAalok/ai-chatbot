import OpenAI from 'openai'
import {NextResponse} from "next/server";
// import {TextGenerationModel} from "@google-ai/generativelanguage"

const systemPrompt = "You are a chatbot support system, you will act as one and answer any query of user"


export async function POST(req){
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const data = await req.json();

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true
    })



    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0].delta.content;
                    if(content){
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            }
            catch(err) {
                controller.error(err);
            }
            finally {
                controller.close();
            }
        }
    })

    return new NextResponse(stream);
}


// export async function POST(req) {
//
//     const apiKey = process.env.GEMINI_API_KEY;
//     const model = new TextGenerationModel({ apiKey });
//
//     const data = await req.json();
//
//     const messages = [
//         {
//             role: "system",
//             content: systemPrompt,
//         },
//         ...data,
//     ];
//
//     try {
//         const response = await model.generateText({
//             prompt: messages.map((message) => message.content).join("\n"),
//             maxTokens: 512,
//         });
//
//         return new Response(response.text);
//     } catch (err) {
//         console.error(err); // Handle potential errors
//         return new Response("Error occurred during chat interaction", { status: 500 });
//     }
// }