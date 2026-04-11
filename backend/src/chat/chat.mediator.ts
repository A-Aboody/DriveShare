// Mediator interface — defines the contract for routing messages between users
export interface Mediator {
  sendMessage(senderId: string, receiverId: string, content: string): Promise<any>;
  getConversation(userId1: string, userId2: string): Promise<any[]>;
}

/**
 * Pattern: Mediator
 * ChatMediator sits between users so they never communicate directly.
 * All messages are persisted through here, keeping the messaging logic
 * centralized in one place rather than scattered across user objects.
 */
export class ChatMediator implements Mediator {
  constructor(private readonly prisma: any) {}

  async sendMessage(senderId: string, receiverId: string, content: string) {
    return this.prisma.message.create({
      data: { senderId, receiverId, content },
      include: {
        sender: { select: { id: true, email: true } },
        receiver: { select: { id: true, email: true } },
      },
    });
  }

  async getConversation(userId1: string, userId2: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      include: { sender: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
