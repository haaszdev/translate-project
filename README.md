# Translate Project

Este projeto é composto por dois serviços que se comunicam de forma assíncrona via RabbitMQ para realizar traduções de texto.

## Serviços

- **translation-api**: API REST para receber pedidos de tradução e consultar o status.
- **translation-worker**: Serviço consumidor que processa as traduções.

## Como rodar

1. **Configure o arquivo `.env`** na raiz do projeto e em cada serviço, com:
    ```
    MONGO_URL=seu_url_do_mongo
    RABBITMQ_URL=amqp://rabbitmq:5672
    PORT=3000
    ```

2. **Suba os serviços com Docker Compose:**
    ```sh
    docker compose up --build
    ```

3. **Faça uma requisição de tradução:**
    ```sh
    curl -X POST http://localhost:3000/translations \
      -H "Content-Type: application/json" \
      -d '{"originalText":"Hello world","targetLanguage":"es"}'
    ```

4. **Consulte o status da tradução:**
    ```sh
    curl http://localhost:3000/translations/SEU_REQUEST_ID
    ```

## Tecnologias

- Node.js
- Express
- MongoDB
- RabbitMQ
- Docker

---