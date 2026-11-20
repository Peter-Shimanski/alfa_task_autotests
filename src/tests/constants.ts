export const epics = {
  ui: 'UI',
  api: 'API'
};

export const features = {
  auth: 'Авторизация',
  transfers: 'Переводы',
  history: 'История',
  access: 'Доступ',
  cards: 'Карты',
  accounts: 'Счета',
  errors: 'Ошибки'
};

/**
 * Заголовки тестов (Allure story / Playwright title).
 * Если сценарий ловит дефект — в конце `[BUG-XXX]` (см. playwright/bugs/).
 */
export const stories = {
  loginIsLockedAfterThreeWrongPasswords:
    'Вход блокируется после трёх неверных паролей (п.12)',
  logoutInvalidatesIssuedToken:
    'Выход делает выданный токен недействительным (п.11) [BUG-005]',
  transferAmountUsesCommaAsDecimalSeparator:
    'Сумма перевода использует запятую как разделитель дробной части (п.1, п.2) [BUG-007]',
  insufficientFundsTransferIsRejected:
    'Перевод при нехватке средств отклоняется (п.3) [BUG-013]',
  transferFormWarnsBeforeSubmitWhenOverBalance:
    'Форма перевода предупреждает до отправки, если сумма больше остатка (п.22) [BUG-018]',
  externalFeeIsRoundedToCents:
    'Комиссия внешнего перевода 1,5% округляется до копеек (п.5, п.7) [BUG-008]',
  sameIdempotencyKeyDoesNotCreateSecondTransfer:
    'Повтор с тем же Idempotency-Key не создаёт второй перевод (п.8) [BUG-010]',
  foreignAccountReadIsDenied:
    'Чтение чужого счёта запрещено (п.9) [BUG-003]',
  transferFromForeignAccountIsDenied:
    'Перевод с чужого счёта запрещён (п.9) [BUG-001]',
  cardsApiDoesNotExposePanCvv:
    'API карт не отдаёт PAN/CVV (п.10) [BUG-004]',
  historySearchSortAndTodayFilter:
    'История: поиск, сортировка и фильтр «Сегодня» (п.17–19) [BUG-014][BUG-015][BUG-016]',
  accountsResponseMustNotAllowPublicCaching:
    'Ответ со списком счетов не должен разрешать публичное кэширование (п.14) [BUG-011]',
  errorResponseMustNotExposeStack:
    'Ответ с ошибкой не должен раскрывать stack (п.15) [BUG-012]',
  clientCannotOpenAdminSection:
    'Клиент не должен открыть служебный раздел /admin (п.13) [BUG-009]',
  concurrentTransfersCannotOverdrawAccount:
    'Параллельные переводы не должны уводить баланс в минус (п.4) [BUG-006]'
};
