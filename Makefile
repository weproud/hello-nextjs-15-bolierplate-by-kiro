PRISMA_MIGRATION_NAME=init

lint:
	pnpm lint
format:
	pnpm format

supabase-start:
	npx supabase start
supabase-stop:
	npx supabase stop
supabase-restart: supabase-stop supabase-start
# supabase local development
supabase-stop-no-backup:
	npx supabase stop --no-backup
docker-clean:
	docker container rm $$(docker container ls -aq --filter name=supabase) --force 2>/dev/null || true
	docker volume rm $$(docker volume ls -q --filter name=supabase) --force 2>/dev/null || true
docker-volume-prune:
	docker volume prune
supabase-destroy: supabase-stop-no-backup docker-clean docker-volume-prune

supabase-studio:
	npx supabase studio
supbase-status:
	npx supabase status

# prisma
prisma-init:
	npx prisma migrate reset --skip-seed --skip-generate
	npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > baseline.sql
	npx prisma migrate resolve --applied "init"
prisma-status:
	npx prisma status
prisma-pull: # db 정보를 schema.prisma에 적용
	npx prisma db pull
prisma-generate: # schema.prisma를 기반으로 lib 생성
	npx prisma generate
prisma-push: # schema.prisma를 db에 적용
	npx prisma db push
prisma-migrate:
	npx prisma migrate dev --name ${PRISMA_MIGRATION_NAME}
prisma-diff:
	npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
prisma-deploy: # 모든 migration 파일 적용
	npx prisma migrate deploy
prisma-migrate-reset:
	npx prisma migrate reset
prisma-format:
	npx prisma format

tsc-no-emit:
	pnpm tsc --noEmit
run-build:
	pnpm run build

done: lint format tsc-no-emit run-build
	@echo "done"

seed:
	tsx prisma/seed.ts