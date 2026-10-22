// Bütçe use case testleri
import { FakeClock, InMemoryRepository, TEST_NOW } from '../../fakes/fakes';
import { getBudgetSummary, type Budget } from '@domain/entities/Budget';
import { AddExpenseUseCase } from '@domain/usecases/budget/AddExpenseUseCase';
import { DeleteExpenseUseCase } from '@domain/usecases/budget/DeleteExpenseUseCase';

describe('Bütçe use caseleri', () => {
  let repository: InMemoryRepository<Budget>;
  let addExpense: AddExpenseUseCase;

  beforeEach(() => {
    repository = new InMemoryRepository<Budget>({ limit: 500, expenses: [] });
    addExpense = new AddExpenseUseCase(repository, new FakeClock(TEST_NOW));
  });

  it('harcamayı kaydeder (web sürümünde kayıt tutulmuyordu)', async () => {
    const result = await addExpense.execute({ amount: 120.456, label: 'Kahve' });

    expect(result.ok).toBe(true);
    expect(repository.value.expenses[0]).toMatchObject({ label: 'Kahve', amount: 120.46 });
    expect(getBudgetSummary(repository.value)).toMatchObject({ spent: 120.46, remaining: 379.54 });
  });

  it('açıklama boşsa varsayılan etiketi kullanır', async () => {
    await addExpense.execute({ amount: 50, label: '  ' });

    expect(repository.value.expenses[0]?.label).toBe('Harcama');
  });

  it('geçersiz tutarı reddeder', async () => {
    const result = await addExpense.execute({ amount: -5 });

    expect(result.ok).toBe(false);
    expect(repository.saveCount).toBe(0);
  });

  it('limitin %80 ini aşınca uyarı verir', async () => {
    await addExpense.execute({ amount: 450 });

    expect(getBudgetSummary(repository.value).isWarning).toBe(true);
  });

  it('harcamayı siler', async () => {
    await addExpense.execute({ amount: 30 });
    const id = repository.value.expenses[0]?.id ?? '';

    await new DeleteExpenseUseCase(repository).execute(id);

    expect(repository.value.expenses).toHaveLength(0);
  });
});
