import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// import { jwtConstants } from '../../auth.module'; // removed

// Actually, better to use ConfigService. But for now let's stick to env usage via ConfigService or process.env directly IF ConfigModule is global.
// Usage of constant string is easier for now to start, but I should use ConfigService. 
// Let's assume ConfigService is available or will be.
// However, to keep it simple and robust, I will use process.env.JWT_SECRET

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallbackSecretKeyChangeMe',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
