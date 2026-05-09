import { Injectable, Logger } from '@nestjs/common';

/**
 * LLM Service - Simulates an external LLM API integration.
 *
 * In production, this would make HTTP calls to an LLM provider (e.g., OpenAI).
 * For this test, it simulates the integration with:
 * - Random delay of 10-20 seconds (simulating network + inference time)
 * - Multi-sentence responses
 * - Timeout and error handling
 * - Structured as if calling a real external API
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  /** Simulated timeout for LLM requests (30 seconds) */
  private readonly REQUEST_TIMEOUT_MS = 30_000;

  /** Minimum simulated delay in milliseconds */
  private readonly MIN_DELAY_MS = 10_000;

  /** Maximum simulated delay in milliseconds */
  private readonly MAX_DELAY_MS = 20_000;

  private readonly responses: string[] = [
    "That's a great question! Let me break it down for you. The key thing to understand is that modern software development is all about building systems that are maintainable, scalable, and reliable. When we think about architecture, we need to consider not just the current requirements, but how the system might evolve over time. This means making thoughtful decisions about data models, API design, and separation of concerns.",

    "I'd be happy to help with that. Based on my understanding, there are several important factors to consider here. First, you want to ensure that your approach is well-structured and follows industry best practices. Second, performance should be a key consideration from the start, not an afterthought. Third, security must be baked into every layer of your application. Let me know if you'd like me to elaborate on any of these points.",

    "That's an interesting perspective! From a technical standpoint, I would recommend approaching this problem by first identifying the core requirements and constraints. Once you have a clear understanding of what needs to be built, you can start designing the solution architecture. Remember that simplicity is often the best approach — avoid over-engineering, but also don't cut corners on important aspects like error handling, input validation, and proper testing.",

    "Here's what I think about this topic. In the world of software engineering, we often face trade-offs between different approaches. The key is to make informed decisions based on the specific context of your project. For instance, choosing between polling and WebSockets depends on your latency requirements, server infrastructure, and the complexity you're willing to manage. Each approach has its pros and cons, and the best choice varies by situation.",

    "Great to hear from you! Let me share my thoughts on this matter. When building modern web applications, it's crucial to maintain a clear separation between the frontend and backend concerns. The frontend should focus on user experience and state management, while the backend should handle business logic, data persistence, and security. This separation makes your codebase easier to maintain, test, and scale independently.",

    "I appreciate you bringing this up. This is a common challenge that many developers face, and there are several well-established patterns to address it. The most important thing is to choose an approach that fits your team's expertise and your project's specific needs. Over-engineering is just as harmful as under-engineering — the goal is to find the sweet spot where your solution is robust enough to handle real-world scenarios without being unnecessarily complex.",

    "Let me provide a comprehensive response to your question. In software development, we often talk about the importance of clean code and good architecture. But what does that actually mean in practice? It means writing code that is easy to read, easy to modify, and easy to test. It means organizing your codebase in a way that makes sense to other developers. And it means making deliberate choices about dependencies, patterns, and abstractions.",

    "That's a thoughtful question that deserves a detailed answer. The landscape of web development is constantly evolving, with new frameworks, tools, and best practices emerging regularly. However, the fundamental principles remain the same: write clean code, handle errors gracefully, secure your endpoints, and always think about the user experience. These principles will serve you well regardless of which specific technologies you choose to use.",
  ];

  /**
   * Generates a simulated LLM response.
   *
   * Structured like a real external API call:
   * 1. Validates input
   * 2. Simulates network latency + inference time
   * 3. Returns a multi-sentence response
   * 4. Handles timeouts and errors
   */
  async generateReply(userMessage: string): Promise<string> {
    this.logger.log(`LLM request received. Simulating external API call...`);

    const delay = this.getRandomDelay();
    this.logger.log(`Simulated LLM processing time: ${delay}ms`);

    try {
      const response = await this.simulateApiCall(userMessage, delay);
      this.logger.log(`LLM response generated successfully after ${delay}ms`);
      return response;
    } catch (error) {
      this.logger.error(`LLM request failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Simulates an external HTTP request to an LLM API.
   * In production, this would use HttpService/axios to call the real endpoint.
   */
  private async simulateApiCall(
    _userMessage: string,
    delayMs: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error('LLM request timed out'));
      }, this.REQUEST_TIMEOUT_MS);

      setTimeout(() => {
        clearTimeout(timeoutHandle);
        const response = this.selectResponse();
        resolve(response);
      }, delayMs);
    });
  }

  /** Returns a random delay between 10-20 seconds */
  private getRandomDelay(): number {
    return (
      Math.floor(Math.random() * (this.MAX_DELAY_MS - this.MIN_DELAY_MS + 1)) +
      this.MIN_DELAY_MS
    );
  }

  /** Selects a random response from the pool */
  private selectResponse(): string {
    const index = Math.floor(Math.random() * this.responses.length);
    return this.responses[index];
  }
}
