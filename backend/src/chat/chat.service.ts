import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { ChatMediator } from './chat.mediator.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * ChatService owns the ChatMediator instance and exposes its methods to the
 * controller. It also provides getContacts() to surface all users a given
 * user has ever exchanged messages with.
 */
@Injectable()
export class ChatService {
  private readonly mediator: ChatMediator;

  constructor() {
    this.mediator = new ChatMediator(prisma);
  }

  sendMessage(senderId: string, receiverId: string, content: string) {
    return this.mediator.sendMessage(senderId, receiverId, content);
  }

  getConversation(userId1: string, userId2: string) {
    return this.mediator.getConversation(userId1, userId2);
  }

  /**
   * Find all unique users that userId has exchanged messages with.
   * Pulls both sides of each conversation (sent and received) and
   * deduplicates so each contact appears only once.
   */
  async getContacts(userId: string) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, email: true } },
        receiver: { select: { id: true, email: true } },
      },
    });

    // Collect the "other" user from each message and deduplicate by id
    const contactMap = new Map<string, { id: string; email: string }>();
    for (const msg of messages) {
      if (msg.senderId !== userId) {
        contactMap.set(msg.senderId, msg.sender);
      }
      if (msg.receiverId !== userId) {
        contactMap.set(msg.receiverId, msg.receiver);
      }
    }

    return Array.from(contactMap.values());
  }
}
