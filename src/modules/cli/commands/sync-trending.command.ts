import { Command, CommandRunner } from 'nest-commander';
import {
  SyncCleanService,
  SyncEpisodesService,
  SyncTrendingService,
} from '../../sync';
import { CliLogger, Option } from '../util';

interface Options {
  clean: boolean;
  start: number;
  end: number;
}

@Command({
  name: 'sync:trending',
  description: 'Sync trending shows on TMDB (partial data only)',
})
export class SyncTrendingCommand implements CommandRunner {
  private readonly logger = new CliLogger(this.constructor.name, {
    action: 'syncing',
  });

  constructor(
    private readonly syncTrendingService: SyncTrendingService,
    private readonly syncEpisodesService: SyncEpisodesService,
    private readonly syncCleanService: SyncCleanService,
  ) {}

  async run(_, { start, end, clean }: Options) {
    if (clean) await this.runClean();

    await this.logger.wrap(
      () => this.syncTrendingService.syncTrending(start, end),
      'partial trending shows',
    );
  }

  @Option({
    flags: '--clean',
    description: 'If should delete shows from DB',
    defaultValue: false,
  })
  parseCleanOption(): Options['clean'] {
    return true;
  }

  @Option({
    flags: '--start [start]',
    description: 'Start page inclusive',
    defaultValue: 1,
  })
  parseStartOption(value: string): Options['start'] {
    return Number(value);
  }

  @Option({
    flags: '--end [end]',
    description: 'End page exclusive',
    required: true,
    defaultValue: 2,
  })
  parseEndOption(value: string): Options['end'] {
    return Number(value);
  }

  private async runClean() {
    await this.logger.wrap(
      () => this.syncCleanService.deleteShows(),
      'shows',
      'deleting',
    );
  }
}