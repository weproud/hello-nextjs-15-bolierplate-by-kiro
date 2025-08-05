#!/usr/bin/env tsx

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface BackupMetadata {
  timestamp: string
  version: string
  description: string
  files: string[]
  gitCommit?: string
  backupPath: string
}

interface RestoreOptions {
  backupId?: string
  dryRun?: boolean
  verbose?: boolean
}

class BackupRestoreSystem {
  private readonly backupDir: string
  private readonly projectRoot: string
  private readonly srcDir: string

  constructor(projectRoot: string = '.', srcDir: string = 'src') {
    this.projectRoot = projectRoot
    this.srcDir = srcDir
    this.backupDir = path.join(projectRoot, '.backup')

    // 백업 디렉토리 생성
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  /**
   * 현재 Git 커밋 해시를 가져옵니다.
   */
  private getCurrentGitCommit(): string | undefined {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()
    } catch (error) {
      console.warn('⚠️  Git 커밋 정보를 가져올 수 없습니다:', error)
      return undefined
    }
  }

  /**
   * 백업할 파일 목록을 생성합니다.
   */
  private getFilesToBackup(): string[] {
    const files: string[] = []
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md']

    const scanDirectory = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          // node_modules, .git, .next 등 제외
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            scanDirectory(fullPath)
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name)
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    }

    // src 디렉토리 스캔
    if (fs.existsSync(this.srcDir)) {
      scanDirectory(this.srcDir)
    }

    // 루트 레벨 설정 파일들 추가
    const rootFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.ts',
      'tailwind.config.ts',
      'eslint.config.ts',
      '.env.example',
      'README.md',
    ]

    for (const file of rootFiles) {
      const filePath = path.join(this.projectRoot, file)
      if (fs.existsSync(filePath)) {
        files.push(filePath)
      }
    }

    return files
  }

  /**
   * 파일을 백업 디렉토리로 복사합니다.
   */
  private copyFileToBackup(filePath: string, backupPath: string): void {
    const relativePath = path.relative(this.projectRoot, filePath)
    const targetPath = path.join(backupPath, relativePath)
    const targetDir = path.dirname(targetPath)

    // 대상 디렉토리 생성
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // 파일 복사
    fs.copyFileSync(filePath, targetPath)
  }

  /**
   * 백업을 생성합니다.
   */
  public createBackup(
    description: string = '코드베이스 리팩토링 전 백업'
  ): BackupMetadata {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupId = `backup-${timestamp}`
    const backupPath = path.join(this.backupDir, backupId)

    console.log(`🔄 백업 생성 중: ${backupId}`)

    // 백업 디렉토리 생성
    fs.mkdirSync(backupPath, { recursive: true })

    // 백업할 파일 목록 가져오기
    const filesToBackup = this.getFilesToBackup()
    console.log(`📁 백업할 파일 수: ${filesToBackup.length}`)

    // 파일들을 백업 디렉토리로 복사
    let copiedFiles = 0
    for (const filePath of filesToBackup) {
      try {
        this.copyFileToBackup(filePath, backupPath)
        copiedFiles++

        if (copiedFiles % 50 === 0) {
          console.log(`   진행률: ${copiedFiles}/${filesToBackup.length}`)
        }
      } catch (error) {
        console.warn(`⚠️  파일 복사 실패: ${filePath}`, error)
      }
    }

    // 백업 메타데이터 생성
    const metadata: BackupMetadata = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      description,
      files: filesToBackup.map(f => path.relative(this.projectRoot, f)),
      gitCommit: this.getCurrentGitCommit(),
      backupPath: backupId,
    }

    // 메타데이터 저장
    const metadataPath = path.join(backupPath, 'backup-metadata.json')
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

    console.log(`✅ 백업 완료: ${backupId}`)
    console.log(`   백업된 파일 수: ${copiedFiles}`)
    console.log(`   백업 위치: ${backupPath}`)

    return metadata
  }

  /**
   * 사용 가능한 백업 목록을 가져옵니다.
   */
  public listBackups(): BackupMetadata[] {
    const backups: BackupMetadata[] = []

    if (!fs.existsSync(this.backupDir)) {
      return backups
    }

    const entries = fs.readdirSync(this.backupDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('backup-')) {
        const metadataPath = path.join(
          this.backupDir,
          entry.name,
          'backup-metadata.json'
        )

        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
            backups.push(metadata)
          } catch (error) {
            console.warn(`⚠️  백업 메타데이터 로드 실패: ${entry.name}`, error)
          }
        }
      }
    }

    // 타임스탬프 기준으로 정렬 (최신순)
    return backups.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  /**
   * 백업에서 파일을 복원합니다.
   */
  public restoreFromBackup(options: RestoreOptions = {}): boolean {
    const backups = this.listBackups()

    if (backups.length === 0) {
      console.error('❌ 사용 가능한 백업이 없습니다.')
      return false
    }

    // 백업 선택 (기본값: 가장 최근 백업)
    const targetBackup = options.backupId
      ? backups.find(b => b.backupPath === options.backupId)
      : backups[0]

    if (!targetBackup) {
      console.error(`❌ 백업을 찾을 수 없습니다: ${options.backupId}`)
      return false
    }

    const backupPath = path.join(this.backupDir, targetBackup.backupPath)

    if (!fs.existsSync(backupPath)) {
      console.error(`❌ 백업 디렉토리가 존재하지 않습니다: ${backupPath}`)
      return false
    }

    console.log(`🔄 백업에서 복원 중: ${targetBackup.backupPath}`)
    console.log(`   생성 시간: ${targetBackup.timestamp}`)
    console.log(`   설명: ${targetBackup.description}`)

    if (options.dryRun) {
      console.log('🔍 드라이런 모드: 실제 복원은 수행하지 않습니다.')
      console.log(`   복원될 파일 수: ${targetBackup.files.length}`)
      return true
    }

    // 파일 복원
    let restoredFiles = 0
    let failedFiles = 0

    for (const relativeFilePath of targetBackup.files) {
      const sourcePath = path.join(backupPath, relativeFilePath)
      const targetPath = path.join(this.projectRoot, relativeFilePath)

      try {
        if (fs.existsSync(sourcePath)) {
          // 대상 디렉토리 생성
          const targetDir = path.dirname(targetPath)
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true })
          }

          // 파일 복원
          fs.copyFileSync(sourcePath, targetPath)
          restoredFiles++

          if (options.verbose && restoredFiles % 20 === 0) {
            console.log(
              `   진행률: ${restoredFiles}/${targetBackup.files.length}`
            )
          }
        } else {
          console.warn(`⚠️  백업 파일이 존재하지 않습니다: ${sourcePath}`)
          failedFiles++
        }
      } catch (error) {
        console.warn(`⚠️  파일 복원 실패: ${relativeFilePath}`, error)
        failedFiles++
      }
    }

    console.log(`✅ 복원 완료`)
    console.log(`   복원된 파일 수: ${restoredFiles}`)
    if (failedFiles > 0) {
      console.log(`   실패한 파일 수: ${failedFiles}`)
    }

    return failedFiles === 0
  }

  /**
   * 백업을 삭제합니다.
   */
  public deleteBackup(backupId: string): boolean {
    const backupPath = path.join(this.backupDir, backupId)

    if (!fs.existsSync(backupPath)) {
      console.error(`❌ 백업이 존재하지 않습니다: ${backupId}`)
      return false
    }

    try {
      fs.rmSync(backupPath, { recursive: true, force: true })
      console.log(`✅ 백업 삭제 완료: ${backupId}`)
      return true
    } catch (error) {
      console.error(`❌ 백업 삭제 실패: ${backupId}`, error)
      return false
    }
  }

  /**
   * 백업 목록을 출력합니다.
   */
  public printBackupList(): void {
    const backups = this.listBackups()

    if (backups.length === 0) {
      console.log('📦 사용 가능한 백업이 없습니다.')
      return
    }

    console.log('📦 사용 가능한 백업 목록:')
    console.log('='.repeat(60))

    backups.forEach((backup, index) => {
      const date = new Date(backup.timestamp).toLocaleString('ko-KR')
      console.log(`${index + 1}. ${backup.backupPath}`)
      console.log(`   생성 시간: ${date}`)
      console.log(`   설명: ${backup.description}`)
      console.log(`   파일 수: ${backup.files.length}`)
      if (backup.gitCommit) {
        console.log(`   Git 커밋: ${backup.gitCommit.substring(0, 8)}`)
      }
      console.log()
    })
  }

  /**
   * 프로젝트 상태를 검증합니다.
   */
  public validateProjectState(): boolean {
    console.log('🔍 프로젝트 상태 검증 중...')

    try {
      // TypeScript 컴파일 검사
      console.log('   TypeScript 컴파일 검사...')
      execSync('npx tsc --noEmit', { stdio: 'pipe' })
      console.log('   ✅ TypeScript 컴파일 성공')

      // ESLint 검사
      console.log('   ESLint 검사...')
      execSync('npx eslint src --ext .ts,.tsx --max-warnings=0', {
        stdio: 'pipe',
      })
      console.log('   ✅ ESLint 검사 성공')

      // 빌드 테스트
      console.log('   Next.js 빌드 테스트...')
      execSync('npm run build', { stdio: 'pipe' })
      console.log('   ✅ 빌드 성공')

      console.log('✅ 프로젝트 상태 검증 완료')
      return true
    } catch (error) {
      console.error('❌ 프로젝트 상태 검증 실패:', error)
      return false
    }
  }
}

// CLI 인터페이스
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const backupSystem = new BackupRestoreSystem()

  switch (command) {
    case 'create':
    case 'backup': {
      const description = args[1] || '수동 백업'
      const metadata = backupSystem.createBackup(description)
      console.log(`\n백업 ID: ${metadata.backupPath}`)
      break
    }

    case 'list': {
      backupSystem.printBackupList()
      break
    }

    case 'restore': {
      const dryRun = args.includes('--dry-run')
      const verbose = args.includes('--verbose')
      const backupId = args.find(
        arg => !arg.startsWith('--') && arg !== 'restore'
      )

      const success = backupSystem.restoreFromBackup({
        backupId,
        dryRun,
        verbose,
      })

      if (!success) {
        process.exit(1)
      }
      break
    }

    case 'delete': {
      const backupId = args[1]
      if (!backupId) {
        console.error('❌ 백업 ID를 지정해주세요.')
        process.exit(1)
      }

      const success = backupSystem.deleteBackup(backupId)
      if (!success) {
        process.exit(1)
      }
      break
    }

    case 'validate': {
      const success = backupSystem.validateProjectState()
      if (!success) {
        process.exit(1)
      }
      break
    }

    default: {
      console.log('사용법:')
      console.log(
        '  tsx scripts/backup-restore.ts create [설명]     - 백업 생성'
      )
      console.log(
        '  tsx scripts/backup-restore.ts list              - 백업 목록 조회'
      )
      console.log(
        '  tsx scripts/backup-restore.ts restore [ID]      - 백업에서 복원'
      )
      console.log(
        '  tsx scripts/backup-restore.ts restore [ID] --dry-run  - 복원 시뮬레이션'
      )
      console.log(
        '  tsx scripts/backup-restore.ts delete [ID]       - 백업 삭제'
      )
      console.log(
        '  tsx scripts/backup-restore.ts validate          - 프로젝트 상태 검증'
      )
      console.log('')
      console.log('예시:')
      console.log('  tsx scripts/backup-restore.ts create "리팩토링 전 백업"')
      console.log(
        '  tsx scripts/backup-restore.ts restore backup-2024-01-15T10-30-00-000Z'
      )
      break
    }
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 오류가 발생했습니다:', error)
    process.exit(1)
  })
}

export { BackupRestoreSystem, type BackupMetadata, type RestoreOptions }
