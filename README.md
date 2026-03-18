# 🎬 Cine Cocais — Backend

---

**1. Instale as dependências**
```bash
npm install
```

**2. Crie o arquivo `.env` na raiz do projeto**
```env
PORT=3000
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/cine_cocais"
JWT_SECRET=cinecocais2025
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```
> Troque `SUA_SENHA` pela senha do seu MySQL. Se não tiver senha deixe: `mysql://root:@localhost:3306/cine_cocais`

**3. Crie o banco de dados**

Abra o MySQL Workbench e execute:
```sql
CREATE DATABASE cine_cocais;
```

**4. Crie as tabelas**
```bash
npx prisma migrate dev --name init
```

**5. Crie o usuário administrador**
```bash
node src/seeds/admin.js
```

**6. Inicie o servidor**
```bash
node src/server.js
```

Acesse: `http://localhost:3000` ✅

---

## Login do Admin
```
Email: admin@cinecocais.com
Senha: admin123
```