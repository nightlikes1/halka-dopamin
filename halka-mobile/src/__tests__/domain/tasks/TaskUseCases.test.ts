// Görev use case testleri
import { InMemoryRepository } from '../../fakes/fakes';
import type { TaskList } from '@domain/entities/Task';
import { AddTaskUseCase } from '@domain/usecases/tasks/AddTaskUseCase';
import { DeleteTaskUseCase } from '@domain/usecases/tasks/DeleteTaskUseCase';
import { ToggleTaskUseCase } from '@domain/usecases/tasks/ToggleTaskUseCase';

const initialList = (): TaskList => ({
  items: [{ id: 't1', text: 'Mevcut görev', done: false, priority: 'normal' }],
});

describe('Görev use caseleri', () => {
  let repository: InMemoryRepository<TaskList>;

  beforeEach(() => {
    repository = new InMemoryRepository(initialList());
  });

  it('yeni görevi kırpılmış metinle listenin başına ekler', async () => {
    const result = await new AddTaskUseCase(repository).execute('  Kitap oku  ');

    expect(result.ok).toBe(true);
    expect(repository.value.items).toHaveLength(2);
    expect(repository.value.items[0]).toMatchObject({ text: 'Kitap oku', done: false });
  });

  it('boş görevi reddeder', async () => {
    const result = await new AddTaskUseCase(repository).execute('   ');

    expect(result.ok).toBe(false);
    expect(repository.saveCount).toBe(0);
  });

  it('görevi tamamlandı olarak işaretler', async () => {
    await new ToggleTaskUseCase(repository).execute('t1', true);

    expect(repository.value.items[0]?.done).toBe(true);
  });

  it('olmayan görevi işaretlemeye çalışınca hata döner', async () => {
    const result = await new ToggleTaskUseCase(repository).execute('yok', true);

    expect(result.ok).toBe(false);
  });

  it('görevi siler', async () => {
    await new DeleteTaskUseCase(repository).execute('t1');

    expect(repository.value.items).toHaveLength(0);
  });
});
