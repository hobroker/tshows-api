import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services';
import { UserModule } from '../user/user.module';
import {
  JwtStrategy,
  LocalStrategy,
  JwtRefreshTokenStrategy,
} from './strategies';
import { authConfig } from './auth.config';
import { AuthController } from './controllers';
import { AuthResolver } from './resolvers';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    JwtModule.register({}),
    UserModule,
    PassportModule,
  ],
  exports: [AuthService],
  providers: [
    AuthResolver,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
