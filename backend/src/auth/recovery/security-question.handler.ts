import { createHmac, timingSafeEqual } from 'crypto';

const HMAC_SECRET = 'driveshare-secret';

interface UserWithAnswers {
  securityAnswer1: string;
  securityAnswer2: string;
  securityAnswer3: string;
}

function hashAnswer(answer: string): string {
  return createHmac('sha256', HMAC_SECRET).update(answer).digest('hex');
}

function verifyAnswer(plain: string, hashed: string): boolean {
  const candidate = hashAnswer(plain.toLowerCase().trim());
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(hashed));
}

/**
 * Chain of Responsibility Pattern — Password Recovery
 *
 * Each handler checks one security question answer.
 * If it passes, it forwards to the next handler in the chain.
 * All three must pass for recovery to succeed.
 */
abstract class BaseHandler {
  protected next: BaseHandler | null = null;

  setNext(handler: BaseHandler): BaseHandler {
    this.next = handler;
    return handler;
  }

  abstract handle(user: UserWithAnswers, answers: string[]): boolean;
}

class Question1Handler extends BaseHandler {
  handle(user: UserWithAnswers, answers: string[]): boolean {
    if (!answers[0] || !verifyAnswer(answers[0], user.securityAnswer1)) return false;
    return this.next ? this.next.handle(user, answers) : true;
  }
}

class Question2Handler extends BaseHandler {
  handle(user: UserWithAnswers, answers: string[]): boolean {
    if (!answers[1] || !verifyAnswer(answers[1], user.securityAnswer2)) return false;
    return this.next ? this.next.handle(user, answers) : true;
  }
}

class Question3Handler extends BaseHandler {
  handle(user: UserWithAnswers, answers: string[]): boolean {
    if (!answers[2] || !verifyAnswer(answers[2], user.securityAnswer3)) return false;
    return this.next ? this.next.handle(user, answers) : true;
  }
}

export class SecurityQuestionHandler {
  /**
   * Builds the chain Q1 → Q2 → Q3 and runs all answers through it.
   * Returns true only if all three answers are correct.
   */
  static verifyRecoveryAnswers(user: UserWithAnswers, answers: string[]): boolean {
    const q1 = new Question1Handler();
    const q2 = new Question2Handler();
    const q3 = new Question3Handler();
    q1.setNext(q2).setNext(q3);
    return q1.handle(user, answers);
  }
}