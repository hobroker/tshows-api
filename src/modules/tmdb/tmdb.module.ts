import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '../http';
import { tmdbConfig } from './tmdb.config';
import { HttpConfigService } from './services/http-config.service';
import { TmdbGenreService, TmdbTvService } from './services';
import { GenreResolver } from './resolvers';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
      imports: [ConfigModule.forFeature(tmdbConfig)],
    }),
  ],
  exports: [],
  providers: [TmdbTvService, TmdbGenreService, GenreResolver],
})
export class TmdbModule {}
