import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service.js';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // POST /chat/send — send a message from one user to another
  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  sendMessage(
    @Body('senderId') senderId: string,
    @Body('receiverId') receiverId: string,
    @Body('content') content: string,
  ) {
    return this.chatService.sendMessage(senderId, receiverId, content);
  }

  // GET /chat/conversation/:userId/:otherId — fetch the thread between two users
  @Get('conversation/:userId/:otherId')
  getConversation(
    @Param('userId') userId: string,
    @Param('otherId') otherId: string,
  ) {
    return this.chatService.getConversation(userId, otherId);
  }

  // GET /chat/contacts/:userId — list all users this user has messaged
  @Get('contacts/:userId')
  getContacts(@Param('userId') userId: string) {
    return this.chatService.getContacts(userId);
  }
}
