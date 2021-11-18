import { Logger } from '@nestjs/common';
import { timer } from '../../../util/timer';

type Options = {
  subject?: string;
  action: string;
};

export class ConsoleLogger {
  private logger: Logger;

  constructor(context: string, private options: Options) {
    this.logger = new Logger(context);
  }

  wrap(
    promiseFn: () => Promise<any>,
    subject = this.options.subject || '',
    action = this.options.action,
  ) {
    const time = timer();
    this.logger.log(`Syncing ${subject}`);

    return promiseFn()
      .then(({ count } = {}) => {
        this.logger.log(`Done ${action} ${count} ${subject}`, { ms: time() });
      })
      .catch((err) => {
        this.logger.error(`Error ${action} ${subject}`);
        this.logger.error(err);
      });
  }
}
