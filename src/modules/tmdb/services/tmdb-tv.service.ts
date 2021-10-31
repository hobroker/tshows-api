import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '../../http';

@Injectable()
export class TmdbTvService {
  @Inject(HttpService)
  private httpService: HttpService;

  async list() {
    const { data } = await this.httpService.get('/genre/tv/list');
    const { genres } = data;

    return genres;
  }
}
