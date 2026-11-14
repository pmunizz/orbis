const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export const formatDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

export const dateOffset = (amount: number) => {
  const date = new Date()
  date.setDate(date.getDate() + amount)
  return localDateKey(date)
}

export const nextBusinessDate = () => {
  const date = new Date()
  do {
    date.setDate(date.getDate() + 1)
  } while (date.getDay() === 0)
  return localDateKey(date)
}
