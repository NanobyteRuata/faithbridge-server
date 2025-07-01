## FaithBridge Server

- database up
```
$ docker-compose up -d db
```

- migrate when schema change
```
$ npx prisma migrate dev --name add-more-user-fields
```

- generate prisma models
```
$ npx prisma generate
```

- run project locally
```
$ npm run start:dev
```

- eslint
```
$ npx eslint ./src --quiet --fix
```