import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `✅ Server running on port ${process.env.PORT}`;
  }
}
