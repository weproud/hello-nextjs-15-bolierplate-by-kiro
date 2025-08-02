const fs = require('fs')

console.log('Script started')

try {
  const exists = fs.existsSync('typescript-errors.log')
  console.log('Log file exists:', exists)

  if (exists) {
    const content = fs.readFileSync('typescript-errors.log', 'utf8')
    console.log('Log file size:', content.length)
    console.log('First 100 chars:', content.substring(0, 100))
  }
} catch (error) {
  console.error('Error:', error.message)
}

console.log('Script finished')
