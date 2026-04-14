# COMP74 (Web Services) Group Project

[Design Document](https://docs.google.com/document/d/1FHtUM6zzg2CVdcccEVfskXuuGdrWePffiaDJGt7Xwzs/edit?usp=sharing)

## Setup
```bash
bun i
cp .env.example .env
bunx drizzle-kit push
bun run start
```

## API Usage
The API runs on the port configured by `WEBSERVER_PORT` or defaults to `3000`.

Start with the built-in help endpoint:

```bash
curl http://localhost:3000/api/help
```

That response lists the available routes, which ones require authentication, and a few request examples.

### Common Flow
1. Register a user with `POST /api/auth/register`.
2. Log in with `POST /api/auth/login` to receive a JWT.
3. Send the token with `Authorization: Bearer <token>` when calling protected routes.
4. Use the Bruno collection in the `bruno/` folder if you want ready-made requests.

### Example Requests
```bash
curl -X POST http://localhost:3000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"username":"demo","password":"secret"}'
```

```bash
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"username":"demo","password":"secret"}'
```

```bash
curl http://localhost:3000/api/wallets \
	-H "Authorization: Bearer <token>"
```

```bash
curl -X POST http://localhost:3000/api/wallets/new \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{"symbol":"BTC"}'
```

### Postman Collection
The `postman/` folder contains a Postman collection and local environment file.

Import both files as a folder into postman as a colection, then run the requests in order or press run all so the collection can capture the generated `token` and `walletId`:

**Note: The Register test will only work if the user does not exist on the db.sqlite it is expected to fail after the first run**

1. Register
2. Login
3. New Wallet
4. List Wallets
5. Deposit
6. Withdraw
7. List Transactions