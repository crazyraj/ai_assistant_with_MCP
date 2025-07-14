import { createServerFn } from "@tanstack/react-start";
import { openai } from '@ai-sdk/openai';
import { streamText } from "ai";

import OpenAI from "openai";

import getTools from "./ai-tools";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const client = new OpenAI({ apiKey: 'api-key' });

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
      messages: Array<any>; // Accept any shape for flexibility
      systemPrompt?: { value: string; enabled: boolean };
    }) => d
  )
  .handler(async ({ data }) => {
    console.log("genAIResponse handler: start");
    // Normalize messages to expected shape
    const messages = (data.messages || [])
      .filter(
        (msg: any) =>
          typeof msg.content === "string" &&
          msg.content.trim() !== "" &&
          !msg.content.startsWith("Sorry, I encountered an error")
      )
      .map((msg: any, idx: number) => ({
        id: msg.id || String(idx),
        role: msg.role,
        content: (msg.content || (msg.parts?.[0]?.text ?? "")).trim(),
      }));

    console.log("genAIResponse handler: before getTools",messages);
    const tools = await getTools();
    console.log("genAIResponse handler: after getTools", tools);

    try {
      console.log("genAIResponse handler: before streamText");
      // Test OpenAI API key and model
      // console.log("OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);
      console.log("Using model:", "gpt-3.5-turbo");
      // Simple OpenAI test using streamText
      try {
        const response = await client.responses.create({
          model: "gpt-3.5-turbo",
          input: [
              {
                  role: "developer",
                  content: "Talk like a pirate."
              },
              {
                  role: "user",
                  content: "Are semicolons optional in JavaScript?",
              },
          ],
      });
      
      console.log(response.output_text);

        // const testStream = await streamText({
        //   model: openai("gpt-3.5-turbo"),
        //   messages: [{ role: "user", content: "Say hello!" }],
        //   system: "You are a helpful assistant.",
        //   // maxSteps: 1,
        // });
        // // Try to get the text result directly
        // let testResult = "";
        // if (typeof testStream.text === "function") {
        //   console.log("testStream.text", typeof testStream.text);
        //   // testResult = await testStream.text();
        // } else if (typeof testStream.toString === "function") {
        //   console.log("testStream.toString", typeof testStream.toString);
        //   // testResult = testStream.toString();
        //   testResult = JSON.stringify(testStream);
        // } else {
        //   testResult = JSON.stringify(testStream);
        // }
        // console.log("OpenAI test result:", JSON.stringify(testResult));
        // return testStream.toDataStreamResponse();
      } catch (e) {
        console.error("OpenAI test error:", e);
        return new Response(
          JSON.stringify({
            error: "OpenAI API error",
            details: e instanceof Error ? { message: e.message, stack: e.stack } : e
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      // TEMP: Return a streaming NDJSON response for UI test
      // return new Response(
      //   `{"id":"test","role":"assistant","content":"Hello from the backend!"}\n`,
      //   {
      //     status: 200,
      //     headers: {
      //       "Content-Type": "application/x-ndjson"
      //     }
      //   }
      // );
      // const result = await streamText({
      //   model: openai("gpt-4o"),
      //   messages,
      //   system: SYSTEM_PROMPT,
      //   maxSteps: 20,
      //   tools, // tools restored for tool usage
      // });
      // console.log("genAIResponse handler: after streamText, before toDataStreamResponse");
      // const response = await result.toDataStreamResponse();
      // console.log("genAIResponse handler: after toDataStreamResponse");
      // return response;

      

    } catch (error) {
      console.error("Error in streamText or toDataStreamResponse:", error);
      // Return an NDJSON assistant message with the error content
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return new Response(
        `{"id":"error","role":"assistant","content":"Sorry, I encountered an error: ${errorMessage.replace(/"/g, '\\"')}"}\n`,
        {
          status: 200,
          headers: { "Content-Type": "application/x-ndjson" }
        }
      );
    }
  });
