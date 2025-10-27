import { Injectable } from '@nestjs/common';
import {
  Content,
  GoogleGenerativeAI,
  GoogleSearchRetrieval,
  Tool,
} from '@google/generative-ai';
import { DynamoService } from 'src/dynamo/dynamo.service';
@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);
  }

  async *generateTextStream(
    prompt: string,
    history: Content[],
    temperature: number,
    webSearch: boolean,
  ): AsyncGenerator<string> {
    const systemInstruction = `You are a large language model built by Google. Your name is Gemini.
Carefully heed the user's instructions.
Respond using Markdown.`;

    try {
      const tools: Tool[] = webSearch
        ? [{ googleSearchRetrieval: {} as GoogleSearchRetrieval }]
        : [];
      console.log(
        `[GEMINI] using websearch tool :${tools.length > 0 ? 'google search retrieval' : 'none'}`,
      );

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig: { temperature },
        tools,
        systemInstruction: systemInstruction,
      });
      console.log(`chat started with history ${history.length}`);

      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(prompt);

      let chunkText = 0;
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          chunkText++;
          yield text;
        }
      }
      console.log(`stream finished ${chunkText} chunks`);
    } catch (error) {
      console.error('[GeminiService] Error during stream generation:', error);
      console.log(`--------------------------`);
      yield `Sorry, I encountered an error: ${error.message || 'Unknown error'}`;
    }
  }
}
