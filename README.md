## FaithBridge Server

### Prerequisites
- Docker
- Node.js (v22.16.0)

### Setup
1. Create a `.env` file in the root directory
2. Copy the contents of `.env.example` into the `.env` file
3. Fill in the values for the environment variables
4. Start the database in docker
    ```
    $ docker-compose up -d db
    ```

5. Apply the schema models to the database (only run once)
    ```
    $ npx prisma db push
    ```

6. Generate Prisma Client (only run once)
    ```
    $ npx prisma generate --schema=./prisma/schema.prisma
    ```

7. Seed the database (only run once)
    ```
    $ npx prisma db seed
    ```

8. Install dependencies (only run once)
    ```
    $ npm install
    ```

9. Start the application
    ```
    $ npm run start:dev
    ```

### Development
- format, validate and migrate when schema change
    ```
    $ npx prisma format
    $ npx prisma validate
    $ npx prisma migrate dev --name {comment-text}
    $ npx prisma generate --schema=./prisma/schema.prisma
    ```

- reset migrations (not recommended but just in case)
    ```
    $ npx prisma migrate reset
    ```

- apply lint
    ```
    $ npx eslint ./src --quiet --fix
    ```