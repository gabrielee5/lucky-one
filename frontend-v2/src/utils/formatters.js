export const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatEther = (value, decimals = 4) => {
  if (!value) return '0'
  const num = parseFloat(value)
  if (num === 0) return '0'
  return num.toFixed(decimals)
}

export const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat().format(num)
}

export const formatTimeUnit = (value, unit) => {
  return `${value.toString().padStart(2, '0')} ${unit}${value !== 1 ? 's' : ''}`
}

export const formatTimeRemaining = (timeData) => {
  const { days, hours, minutes, seconds, isExpired } = timeData
  
  if (isExpired) return 'Expired'
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

export const formatPrizePool = (prizePool) => {
  const value = parseFloat(prizePool)
  if (value === 0) return '0 POL'
  if (value < 0.001) return '<0.001 POL'
  return `${formatEther(prizePool)} POL`
}

export const calculateWinChance = (userTickets, totalTickets) => {
  if (!userTickets || !totalTickets || totalTickets === 0) return 0
  return ((userTickets / totalTickets) * 100).toFixed(2)
}

export const getRelativeTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`
}

export const getExplorerUrl = (hash, type = 'tx') => {
  const baseUrl = 'https://amoy.polygonscan.com'
  return `${baseUrl}/${type}/${hash}`
}