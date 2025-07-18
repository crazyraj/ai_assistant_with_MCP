import { createServerFn } from "@tanstack/react-start";
import { openai } from '@ai-sdk/openai';
import { streamText } from "ai";
import getTools from "./ai-tools";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are an AI for a music store.

There are products available for purchase. You can recommend a product to the user.
You can get a list of products by using the getProducts tool.

You also have access to a fulfillment server that can be used to purchase products.
You can get a list of products by using the getInventory tool.
You can purchase a product by using the purchase tool.

After purchasing a product tell the customer they've made a great choice and their order will be processed soon and they will be playing their new guitar in no time.
`;

export const genAIResponse = createServerFn({ method: "POST", response: "raw" })
  .validator(
    (d: {
      messages: Array<Message>;
      systemPrompt?: { value: string; enabled: boolean };
    }) => d
  )
  .handler(async ({ data }) => {
    const messages = data.messages
      .filter(
        (msg) =>
          msg.content.trim() !== "" &&
          !msg.content.startsWith("Sorry, I encountered an error")
      )
      .map((msg) => ({
        role: msg.role,
        content: msg.content.trim(),
      }));

    const tools = await getTools();

    try {
      const result = streamText({
        model: openai("gpt-4o"),
        messages,
        system: SYSTEM_PROMPT,
        maxSteps: 20,
        tools,
      });
      return result.toDataStreamResponse();
    } catch (error) {
      console.error("Error in genAIResponse:", error);
      console.error("Normalized messages:", messages);
      // Return detailed error in development, generic in production
      const isDev = process.env.NODE_ENV !== "production";
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      if (error instanceof Error && error.message.includes("rate limit")) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { "Content-Type": "application/json" } });
      }
      // Always return 500 status for errors
      return new Response(
        JSON.stringify({
          error: isDev ? errorMsg : "An error occurred. Please try again later.",
          ...(isDev && errorStack ? { stack: errorStack } : {}),
          normalizedMessages: messages,
          errorType: error && error.constructor ? error.constructor.name : typeof error
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  });
