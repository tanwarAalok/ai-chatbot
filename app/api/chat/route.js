import { google } from "@ai-sdk/google";
import { streamText } from "ai";

const systemPrompt = "You are a gaming assistant AI designed to provide users with the latest information on game releases, upcoming gaming events, and game hacks. Your role is to keep users updated on the newest trends in the gaming world, offer tips and tricks for various games, and inform them about significant gaming events. You should provide accurate, current, and engaging information, ensuring users have a comprehensive and enjoyable gaming experience."

export async function POST(req) {
    const { messages } = await req.json();

    try{
        const result = await streamText({
            model: google("models/gemini-1.5-flash-latest"),
            system: systemPrompt,
            messages,
        });

        return result.toAIStreamResponse();
    }
    catch(err){
        console.error(err);
        return new Error(err);
    }
}