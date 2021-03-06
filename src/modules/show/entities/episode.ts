import 'reflect-metadata';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Show } from './show';

@ObjectType()
export class Episode {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  externalId: number;

  @Field(() => Int)
  showId: number;

  @Field(() => Int)
  number: number;

  @Field(() => Int)
  seasonNumber: number;

  @Field()
  name: string;

  @Field()
  isWatched: boolean;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  wideImage: string;

  @Field(() => Date, { nullable: true })
  airDate: Date;

  @Field(() => Show)
  show: Show;
}
