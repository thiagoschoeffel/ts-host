export function formatCurrentDateLabel(date = new Date()) {
  const dateParts = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short'
  }).formatToParts(date)

  const day = dateParts.find(({ type }) => type === 'day')?.value ?? ''
  const month = dateParts
    .find(({ type }) => type === 'month')
    ?.value.replace('.', '') ?? ''

  return `Hoje · ${day} ${month}`
}
