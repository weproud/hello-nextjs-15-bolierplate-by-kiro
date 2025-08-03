const { execSync } = require('child_process')
const fs = require('fs')

console.log('TypeScript 에러 분석을 시작합니다...')

try {
  // 에러 로그 파일이 있는지 확인
  if (!fs.existsSync('typescript-errors.log')) {
    console.log('typescript-errors.log 파일이 없습니다. 새로 생성합니다...')
    execSync('pnpm type-check 2>&1 | tee typescript-errors.log', {
      stdio: 'inherit',
    })
  }

  // 분석 스크립트 실행
  console.log('에러 분석 스크립트를 실행합니다...')
  execSync('node scripts/analyze-typescript-errors.js', { stdio: 'inherit' })
} catch (error) {
  console.error('에러 발생:', error.message)
}
