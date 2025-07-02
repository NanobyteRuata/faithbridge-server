## FaithBridge Server

- database up
```
$ docker-compose up -d db
```

- format, validate and migrate when schema change
```
$ npx prisma format
$ npx prisma validate
$ npx prisma migrate dev --name {comment-text}
```

- generate prisma models
```
$ npx prisma generate --schema=./prisma/schema.prisma
```

- seed (for initial startup)
```
$ npx prisma db seed
```

- reset migrations (not recommended but just in case)
```
$ npx prisma migrate reset
// format, validate and migrate
```

- run project locally
```
$ npm run start:dev
```

- eslint
```
$ npx eslint ./src --quiet --fix
```