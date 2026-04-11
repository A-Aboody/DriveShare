import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { WatchlistService } from './watchlist.service.js';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  // POST /watchlist
  @Post()
  add(@Body() body: { userId: string; carId: string }) {
    return this.watchlistService.addToWatchlist(body.userId, body.carId);
  }

  // DELETE /watchlist/:userId/:carId
  @Delete(':userId/:carId')
  remove(@Param('userId') userId: string, @Param('carId') carId: string) {
    return this.watchlistService.removeFromWatchlist(userId, carId);
  }

  // GET /watchlist/:userId
  @Get(':userId')
  getWatchlist(@Param('userId') userId: string) {
    return this.watchlistService.getWatchlist(userId);
  }

  // GET /watchlist/:userId/:carId/status
  @Get(':userId/:carId/status')
  async isWatching(@Param('userId') userId: string, @Param('carId') carId: string) {
    return { watching: await this.watchlistService.isWatching(userId, carId) };
  }
}
