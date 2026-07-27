# Rate.IO

Aplicativo para organizar o rateio virtual de roles entre grupos.

## Ambientes

### API

A API Spring Boot espera as variaveis abaixo:

```bash
DATABASE_URL=jdbc:postgresql://host/database?sslmode=require
DATABASE_USERNAME=usuario
DATABASE_PASSWORD=senha
HIBERNATE_DDL_AUTO=update
JPA_SHOW_SQL=false
APP_CORS_ALLOWED_ORIGINS=*
```

Depois de remover credenciais antigas do projeto, rotacione a senha do banco no provedor antes de continuar usando o ambiente.

### App

O app Expo usa a URL da API por variavel publica:

```bash
EXPO_PUBLIC_API_BASE_URL=http://seu-ip-local:8080
```

Se a variavel nao for informada, o app usa o IP local configurado em `app/constants/api.ts`.
