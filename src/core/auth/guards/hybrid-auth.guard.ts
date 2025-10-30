import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class HybridAuthGuard extends AuthGuard(['jwt', 'access-code']) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try JWT
      const jwtGuard = new JwtAuthGuard();
      const jwtResult = await jwtGuard.canActivate(context);
      if (jwtResult) return true;
    } catch {
      try {
        // Try access code
        const accessCodeGuard = new (AuthGuard('access-code'))();
        const accessCodeResult = await accessCodeGuard.canActivate(context);
        if (accessCodeResult) return true;
      } catch {
        // Both failed
        throw new UnauthorizedException('No valid authentication');
      }
    }

    throw new UnauthorizedException('No valid authentication');
  }
}
