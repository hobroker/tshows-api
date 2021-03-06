import { Inject, Injectable } from '@nestjs/common';
import {
  always,
  compose,
  evolve,
  filter,
  prop,
  propEq,
  splitEvery,
  when,
} from 'ramda';
import { ConfigType } from '@nestjs/config';
import { Memoize } from 'typescript-memoize';
import { HttpService } from '../../http';
import { showFacade } from '../facades';
import { tmdbConfig } from '../tmdb.config';
import { Show } from '../../show';
import { serialEvery } from '../../../util/promise';

@Injectable()
export class TmdbShowService {
  constructor(
    @Inject(tmdbConfig.KEY)
    private config: ConfigType<typeof tmdbConfig>,

    private readonly httpService: HttpService,
  ) {
    this.discoverByGenreId = this.discoverByGenreId.bind(this);
    this.whereNotExcluded = this.whereNotExcluded.bind(this);
    this.getShow = this.getShow.bind(this);
  }

  async discoverByGenres(
    genreIds: number[] = [],
    { countPerGenre = 6, excludedExternalIds = [] } = {},
  ): Promise<Show[]> {
    const data = await Promise.all(genreIds.map(this.discoverByGenreId));

    return data.reduce((acc, curr) => {
      let i = 0;

      curr.forEach((item) => {
        if (
          i >= countPerGenre ||
          excludedExternalIds.includes(item.externalId) ||
          acc.find(propEq('externalId', item.externalId))
        ) {
          return;
        }
        acc.push(item);
        i++;
      });

      return acc;
    }, []);
  }

  @Memoize({ hashFunction: true })
  private async discoverByGenreId(genreId: number): Promise<Show[]> {
    const {
      data: { results },
    } = await this.httpService.get(`/discover/tv`, {
      params: {
        page: 1,
        with_genres: genreId,
        with_original_language: 'en',
      },
    });

    return this.withShowFacade(results);
  }

  @Memoize({ hashFunction: true })
  async getRecommendations(showId: number): Promise<Show[]> {
    const {
      data: { results },
    } = await this.httpService.get(`/tv/${showId}/recommendations`);

    return this.withShowFacade(results);
  }

  @Memoize({ hashFunction: true })
  async getShow(externalId: number) {
    const data = await this.httpService
      .get(`/tv/${externalId}`)
      .then(prop('data'))
      .then(
        when(
          always(this.config.skipSpecials),
          evolve({
            seasons: filter(compose(Boolean, prop('season_number'))),
          }),
        ),
      );

    return showFacade(data);
  }

  @Memoize({ hashFunction: true })
  async search(query: string): Promise<Show[]> {
    const {
      data: { results },
    } = await this.httpService.get(`/search/tv/`, {
      params: { query },
    });

    return this.withShowFacade(results).filter(prop('wideImage'));
  }

  @Memoize({ hashFunction: true })
  async getTrending(page = 1): Promise<Show[]> {
    const {
      data: { results },
    } = await this.httpService.get('/trending/tv/week', {
      params: {
        page,
      },
    });

    return this.withShowFacade(results);
  }

  @Memoize({ hashFunction: true })
  getShows(externalIds: number[]): Promise<Show[]> {
    return serialEvery(splitEvery(10, externalIds), this.getShow);
  }

  private whereNotExcluded(show: Show) {
    const { skipShowIds } = this.config;

    return !skipShowIds.includes(show.externalId);
  }

  private withShowFacade(data) {
    return data.map(showFacade).filter(this.whereNotExcluded);
  }
}
