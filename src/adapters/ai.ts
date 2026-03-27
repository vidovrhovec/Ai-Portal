import { ChatOpenAI } from '@langchain/openai';
import { AIConfig, AIQuery, AIResponse, QuizData, TestData, GradingResult, LearningStyleAnswers } from '../types';

export interface IAIAdapter {
  query(query: AIQuery): Promise<AIResponse>;
  generateQuiz(material: string): Promise<QuizData>;
  generateTest(prompt: string): Promise<TestData>;
  gradeTest(prompt: string): Promise<GradingResult>;
  assessLearningStyle(answers: LearningStyleAnswers): Promise<string>;
}

class OpenAIAdapter implements IAIAdapter {
  private client: ChatOpenAI;

  constructor(config: AIConfig) {
    this.client = new ChatOpenAI({
      apiKey: config.apiKey,
      modelName: config.model,
      configuration: {
        baseURL: config.baseUrl || 'https://api.openai.com/v1',
      },
    });
  }

  async query(query: AIQuery): Promise<AIResponse> {
    const response = await this.client.invoke([
      { role: 'user', content: query.query }
    ]);
    return {
      response: response.content as string,
    };
  }

  async generateQuiz(material: string): Promise<QuizData> {
    const prompt = `Generate a quiz based on the following material: ${material}`;
    const response = await this.client.invoke([
      { role: 'user', content: prompt }
    ]);
    // Parse JSON response
    return JSON.parse(response.content as string) as QuizData;
  }

  async generateTest(prompt: string): Promise<TestData> {
    const response = await this.client.invoke([
      { role: 'user', content: prompt }
    ]);
    // Parse JSON response
    return JSON.parse(response.content as string) as TestData;
  }

  async gradeTest(prompt: string): Promise<GradingResult> {
    const response = await this.client.invoke([
      { role: 'user', content: prompt }
    ]);
    // Parse JSON response
    return JSON.parse(response.content as string) as GradingResult;
  }

  async assessLearningStyle(answers: LearningStyleAnswers): Promise<string> {
    const prompt = `Assess learning style based on answers: ${JSON.stringify(answers)}`;
    const response = await this.client.invoke([
      { role: 'user', content: prompt }
    ]);
    return response.content as string;
  }
}

export class AIAdapterFactory {
  static createAdapter(config: AIConfig): IAIAdapter {
    switch (config.provider) {
      case 'openai':
      case 'custom':
        return new OpenAIAdapter(config);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }
}

// Global instance
let aiAdapter: IAIAdapter | null = null;

export const getAIAdapter = (config: AIConfig): IAIAdapter => {
  if (!aiAdapter) {
    aiAdapter = AIAdapterFactory.createAdapter(config);
  }
  return aiAdapter;
};

export const switchAI = (newConfig: AIConfig): void => {
  aiAdapter = AIAdapterFactory.createAdapter(newConfig);
};