import 'reflect-metadata';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Injectable, UseGuards } from '@nestjs/common';
import { GraphqlJwtAuthGuard } from '../../auth/guards';
import { RequestWithUser } from '../../auth/interfaces';
import { PreferenceService } from '../services';
import { Preference } from '../entities';
import { Void } from '../../../util/void';
import { Genre } from '../../show';
import { ToggleGenrePreferenceInput } from './input';

@Injectable()
@Resolver(Preference)
export class PreferenceResolver {
  constructor(private readonly preferenceService: PreferenceService) {}

  @ResolveField()
  async genres(@Parent() preference: Preference): Promise<Genre[]> {
    if (!preference) return [];

    return this.preferenceService.findGenresByPreferenceId(preference.id);
  }

  @Mutation(() => Void)
  @UseGuards(GraphqlJwtAuthGuard)
  async toggleGenrePreference(
    @Args('input') { genreId }: ToggleGenrePreferenceInput,
    @Context() { req: { user } }: { req: RequestWithUser },
  ) {
    return this.preferenceService.toggleGenreForUser(user.id, genreId);
  }

  @Query(() => Preference, { nullable: true })
  @UseGuards(GraphqlJwtAuthGuard)
  async getPreferences(@Context() { req: { user } }: { req: RequestWithUser }) {
    return this.preferenceService.findByUserId(user.id);
  }
}
