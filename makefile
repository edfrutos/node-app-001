IMAGE=edefrutos/node-base-template:latest

.PHONY: help build scan up down logs ps

help:
	@echo "make build  -> build local con SBOM + provenance"
	@echo "make scan   -> scout (high only)"
	@echo "make up     -> levantar con compose"
	@echo "make down   -> parar"
	@echo "make logs   -> logs"
	@echo "make ps     -> estado"

build:
	docker buildx build --pull --provenance=mode=max --sbom=true -t $(IMAGE) --load .

scan:
	docker scout cves --only-severity high local://$(IMAGE)

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps