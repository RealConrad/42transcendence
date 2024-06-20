NEEDS_SUDO := $(shell if [ "$$(uname)" = "Linux" ]; then echo "sudo"; fi)

DOCKER_COMPOSE     = $(NEEDS_SUDO) docker compose -f compose.yml

all: up

down:
	$(DOCKER_COMPOSE) down

start:
	$(DOCKER_COMPOSE) start

build:
	$(DOCKER_COMPOSE) build

up: build
	$(DOCKER_COMPOSE) up

stop:
	$(DOCKER_COMPOSE) stop

clean: down
	sudo docker container prune -f
	sudo docker network prune -f
	sudo docker image prune -f

fclean: clean
	sudo docker system prune -a -f

re: fclean all

.PHONY: all up down clean fclean re start stop