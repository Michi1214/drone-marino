# Drone Marino – Backend (Express + TypeScript + Sequelize + Postgres)

Backend per la gestione dei piani di navigazione di un drone marino, con ruoli **user / operator / admin**, validazioni, JWT **RS256**, esporto **JSON/XML** e **Docker** ovunque (Windows/Ubuntu).

> **Obiettivo**: partire in pochi minuti, **senza** installare Node/Postgres sul PC.  
> Tutto gira in **container**.

---

## 🧰 Stack

- **Node 22 (alpine)** + **Express** + **TypeScript**
- **Sequelize** (ORM) + **PostgreSQL 16**
- **JWT RS256** (chiave pubblica per verificare, privata opzionale per firmare token)
- **Docker Compose** (api, db, adminer)
- Esporti: **JSON** e **XML**

---

## ✅ Prerequisiti

### Windows 11
- **Docker Desktop** installato (con **WSL2** attivo).
- Apri i comandi **nella shell Ubuntu di WSL** (consigliato) oppure in Git Bash.
  - *Consiglio*: lavora sotto `\\wsl$\Ubuntu\home\…` (FS di WSL) per performance migliori.

### Ubuntu (anche vecchia)
- **Docker Engine** + **docker compose plugin** installati.

> Se vedi la warning *“`version` is obsolete”* quando lanci `docker compose`: **ignora**.

---

## 📦 Clona il progetto

```bash
git clone https://github.com/MichelaCarletti12/drone-marino.git
cd drone-marino
```

## 🔑 Configura ambiente e chiavi JWT

1. Crea il file .env nella radice del repo:

```bash
# ---- DB Postgres ----
POSTGRES_USER=drone
POSTGRES_PASSWORD=dronepwd
POSTGRES_DB=dronedb
POSTGRES_PORT=5432

# ---- API ----
NODE_ENV=development
API_PORT=3000
TZ=UTC

# ---- JWT ----
JWT_ALGO=RS256
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
JWT_PRIVATE_KEY_PATH=/run/secrets/jwt_private.pem
JWT_ISS=drone-backend
JWT_AUD=drone-clients

# ---- Regole business ----
TOKEN_COST_CREATE_PLAN=2
TOKEN_COST_REQUEST=5
MIN_HOURS_BEFORE_NAV=48

# ---- Export ----
DEFAULT_EXPORT_FORMAT=json

```

2. Genera le chiavi RS256 (senza installare openssl sul PC, usiamo un container):

```bash
mkdir -p keys
docker run --rm -it -v "$PWD/keys":/keys alpine sh -c \
  "apk add --no-cache openssl && \
   openssl genrsa -out /keys/jwtRS256.key 2048 && \
   openssl rsa -in /keys/jwtRS256.key -pubout -out /keys/jwtRS256.key.pub && \
   chmod 600 /keys/jwtRS256.key /keys/jwtRS256.key.pub"

```

keys/jwtRS256.key = privata → NON committarla.
keys/jwtRS256.key.pub = pubblica.

## ▶️ Avvio rapido (60 secondi)

```bash
# dalla radice del progetto
docker compose build
docker compose up -d
docker compose ps
```

Controlli rapidi:

```bash
curl -i http://localhost:3000/healthz
curl -i http://localhost:3000/v1/areas/public
```

Apri Adminer: http://localhost:8081

Login:

  - System: PostgreSQL
  - Server: db
  - Username: drone
  - Password: dronepwd
  - Database: dronedb

Nota: il DB non espone la porta sull’host; Adminer parla con db sulla rete Docker.

## 🗃️ Migrazioni & Seed (primo setup DB)

Esegui dopo che i container sono su:
```bash
# crea tabelle
docker compose run --rm api npm run db:migrate
# dati iniziali (utenti/aree)
docker compose run --rm api npm run db:seed
```

Se vedi un errore su gen_random_uuid():

```bash
docker compose exec db psql -U drone -d dronedb -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
docker compose run --rm api npm run db:migrate

```

(poi ripeti il db:seed)

## 🔐 Generare JWT per i test

1. Apri jwt.io
2. Scegli algoritmo RS256
3. Incolla la chiave privata keys/jwtRS256.key nel box VERIFY SIGNATURE (solo in locale, per test)
4. Usa uno di questi payload (modifica exp se vuoi):

user:
```json
{ "sub":"user-1","email":"user1@example.com","role":"user","iss":"drone-backend","aud":"drone-clients","exp":4102444800 }

```

operator:
```json
{ "sub":"op-1","email":"op1@example.com","role":"operator","iss":"drone-backend","aud":"drone-clients","exp":4102444800 }

```

admin:
```json
{ "sub":"admin-1","email":"admin@example.com","role":"admin","iss":"drone-backend","aud":"drone-clients","exp":4102444800 }

```

Copia il token generato per le chiamate Bearer

## 🧪 Test rapidi (smoke test)

```bash
curl -i http://localhost:3000/healthz
curl -i http://localhost:3000/v1/areas/public
```
Atteso: 200 OK + JSON.

## 🧭 Prova end-to-end 

Sostituisci TOKEN_... con i tuoi token JWT generati da jwt.io

1) [U] Crea un piano (scala token, route chiusa, 48h di anticipo)

```bash
TOKEN_USER="...qui il token user..."
curl -i -H "Authorization: Bearer $TOKEN_USER" -H "Content-Type: application/json" \
  -d '{
    "boatCode":"ABCD123456",
    "startAt":"'"$(date -u -d '+49 hours' +%Y-%m-%dT%H:%M:%SZ)"'",
    "endAt":"'"$(date -u -d '+51 hours' +%Y-%m-%dT%H:%M:%SZ)"'",
    "route":[
      {"lat":45.400,"lon":12.280},
      {"lat":45.400,"lon":12.340},
      {"lat":45.460,"lon":12.340},
      {"lat":45.460,"lon":12.280},
      {"lat":45.400,"lon":12.280}
    ]
  }' \
  http://localhost:3000/v1/requests
```

2) [U/O] Lista richieste (con filtri) + export XML
```bash
# User vede solo le sue
curl -i -H "Authorization: Bearer $TOKEN_USER" \
  "http://localhost:3000/v1/requests?status=pending"

# XML
curl -i -H "Authorization: Bearer $TOKEN_USER" \
  "http://localhost:3000/v1/requests?format=xml"
```

3) [O] Accetta o rigetta
```bash
TOKEN_OP="...qui il token operator..."
REQ_ID="...incolla id dalla creazione..."

# Accetta
curl -i -X POST -H "Authorization: Bearer $TOKEN_OP" \
  http://localhost:3000/v1/requests/$REQ_ID/accept

# Oppure rigetta
curl -i -X POST -H "Authorization: Bearer $TOKEN_OP" -H "Content-Type: application/json" \
  -d '{"reason":"Rotta non sicura"}' \
  http://localhost:3000/v1/requests/$REQ_ID/reject
```

4) [A] Ricarica token utente
```bash
TOKEN_ADM="...qui il token admin..."
curl -i -X POST -H "Authorization: Bearer $TOKEN_ADM" -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","tokens":20}' \
  http://localhost:3000/v1/admin/users/credit
```

5) [U] Cancella (solo se pending)
```bash
curl -i -X DELETE -H "Authorization: Bearer $TOKEN_USER" \
  http://localhost:3000/v1/requests/$REQ_ID

```

## 🧭 Comandi quotidiani
```bash
# avvia in background
docker compose up -d

# stato
docker compose ps

# log dell'API
docker compose logs -f api

# stop / down
docker compose stop
docker compose down

# reset TOTALE (⚠️ cancella il DB!)
docker compose down -v
docker compose up -d
docker compose run --rm api npm run db:migrate
docker compose run --rm api npm run db:seed

```

## 🧩 Differenze Windows vs Ubuntu
Comandi: sono gli stessi (Docker uniforma tutto).

Dove lanciare i comandi su Windows: apri Ubuntu (WSL) o Git Bash.
In PowerShell funziona, ma le heredoc (<< EOF) potrebbero non andare: crea i file con un editor (VS Code).

Percorsi: su Windows lavora in \\wsl$\Ubuntu\home\... (più veloce) ed evita C:\... per i bind mount.

Adminer: sempre su http://localhost:8081, server db.

## 🗂️ Struttura del repo (minima)
```arduino
drone-marino/
├─ .env                      # variabili (NON committare)
├─ docker-compose.yml
├─ keys/
│  ├─ jwtRS256.key           # privata (NON su git)
│  └─ jwtRS256.key.pub       # pubblica
└─ api/
   ├─ Dockerfile
   ├─ package.json
   ├─ tsconfig.json
   ├─ src/
   │  ├─ app.ts
   │  ├─ server.ts
   │  ├─ config/db.ts
   │  ├─ middleware/ (auth, ruoli, errori, tokens)
   │  ├─ models/ (User, Area, Request)
   │  ├─ routes/ (public, areas, requests)
   │  └─ utils/ (geo)
   └─ sequelize/
      ├─ config.js
      ├─ migrations/
      └─ seeders/

```

## 🛠️ Troubleshooting

Connection refused in Adminer:

  In Adminer scegli System=PostgreSQL, Server= db (non localhost), user drone, pwd dronepwd, DB dronedb.

  Verifica che il DB sia healthy: docker compose ps.

  Test dalla API:
  docker compose exec api sh -lc 'apk add --no-cache netcat-openbsd >/dev/null 2>&1 || true; nc -zv db 5432'

Porta 5432 occupata sull’host:
Non esponiamo la porta del DB sull’host (mapping disattivato nel compose). Se l’hai attivato, disattivalo o usa 15432:5432.

UUID gen_random_uuid() mancante:
docker compose exec db psql -U drone -d dronedb -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;", poi rifai migrazioni.

JWT invalid:
Controlla algoritmo RS256, iss e aud coerenti con .env, e che l’ora del PC sia corretta (campo exp).

## 🔒 Sicurezza (dev vs prod)

In dev montiamo le chiavi come Docker secrets da file locale (keys/).

In prod usa un Secrets Manager, CORS con whitelist, scadenze JWT brevi, niente adminer esposto.