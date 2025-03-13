import { appLogger } from '../logger';
import type { IAIService, AIConfig } from './types';

export class OpenAIService implements IAIService {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: AIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-3.5-turbo';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 1000;

    appLogger.info('OpenAI service initialized', {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      appLogger.info(`OpenAI request started [${requestId}]`, {
        model: this.model,
        prompt: prompt.substring(0, 100) + '...' // Log first 100 chars of prompt
      });

      if (!this.apiKey) {
        throw new Error('OpenAI API key is missing');
      }

      const requestBody = {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      };

      appLogger.debug(`OpenAI request details [${requestId}]`, {
        requestBody: {
          ...requestBody,
          messages: requestBody.messages.map(m => ({
            ...m,
            content: m.content.substring(0, 100) + '...' // Truncate content for logging
          }))
        }
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        appLogger.error(`OpenAI API error [${requestId}]`, {
          status: response.status,
          statusText: response.statusText,
          error
        });
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      
      appLogger.info(`OpenAI request completed [${requestId}]`, {
        status: response.status,
        responseLength: data.choices[0].message.content.length,
        usage: data.usage
      });

      return data.choices[0].message.content;
    } catch (error) {
      appLogger.error(`OpenAI request failed [${requestId}]`, { 
        error,
        prompt: prompt.substring(0, 100) + '...'
      });
      throw error;
    }
  }
}