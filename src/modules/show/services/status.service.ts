import { Injectable } from '@nestjs/common';
import { always, ifElse, path, prop } from 'ramda';
import { FullShow, PartialShow } from '../entities';
import { PrismaService } from '../../prisma';
import { Status } from '../../watchlist/entities';
import { indexByAndMap } from '../../../util/fp/indexByAndMap';

const mapWatchlistToShowIdAndStatus = indexByAndMap(
  prop('showId'),
  ifElse(
    path(['episodes', 'length']),
    prop('statusId'),
    always(Status.FinishedWatching),
  ),
);

@Injectable()
export class StatusService {
  constructor(private readonly prismaService: PrismaService) {}

  async linkStatusToShows<T extends PartialShow>(
    userId: number,
    shows: T[],
  ): Promise<T[]> {
    const watchlist = await this.prismaService.watchlist.findMany({
      where: {
        userId,
        showId: {
          in: shows.map(prop('externalId')),
        },
      },
      include: {
        episodes: {
          take: 1,
          where: { isWatched: false },
        },
      },
    });

    const watchlistToStatusMap: Record<number, Status> =
      mapWatchlistToShowIdAndStatus(watchlist);

    return shows.map((show) => ({
      ...show,
      status: watchlistToStatusMap[show.externalId] || Status.None,
    }));
  }

  async linkStatusToShow(userId: number, item: FullShow): Promise<FullShow> {
    if (!item) {
      return null;
    }

    if (!userId) {
      return { ...item, status: Status.None };
    }

    return this.linkStatusToShows(userId, [item]).then(([item]) => item);
  }
}