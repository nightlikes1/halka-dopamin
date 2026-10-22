// Profil repository sözleşmesi
import type { Profile } from '@domain/entities/Profile';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type IProfileRepository = IEntityRepository<Profile>;
