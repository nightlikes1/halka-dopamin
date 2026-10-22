// Tüm anlık görüntüyü DTO'ya çevirir (varsayılan veriyi üretmek için)
import { STORAGE_SCHEMA_VERSION } from '@core/constants/storage';
import type { HalkaStorageDto } from '@data/dto/HalkaStorageDto';
import { bigOneMapper } from '@data/mappers/bigOneMapper';
import { budgetMapper } from '@data/mappers/budgetMapper';
import { layoutMapper } from '@data/mappers/layoutMapper';
import { moodMapper } from '@data/mappers/moodMapper';
import { notesMapper } from '@data/mappers/notesMapper';
import { pomodoroMapper } from '@data/mappers/pomodoroMapper';
import { profileMapper } from '@data/mappers/profileMapper';
import { streakMapper } from '@data/mappers/streakMapper';
import { tasksMapper } from '@data/mappers/tasksMapper';
import { waterMapper } from '@data/mappers/waterMapper';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';

export function snapshotToDto(snapshot: HalkaSnapshot): HalkaStorageDto {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    profile: profileMapper.toDto(snapshot.profile),
    layout: layoutMapper.toDto(snapshot.activeWidgetIds),
    water: waterMapper.toDto(snapshot.water),
    pomodoro: pomodoroMapper.toDto(snapshot.pomodoro),
    tasks: tasksMapper.toDto(snapshot.tasks),
    streak: streakMapper.toDto(snapshot.streak),
    notes: notesMapper.toDto(snapshot.notes),
    mood: moodMapper.toDto(snapshot.mood),
    bigOne: bigOneMapper.toDto(snapshot.bigOne),
    budget: budgetMapper.toDto(snapshot.budget),
  };
}
