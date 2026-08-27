# cronapp-repository

Worker Cloudflare que faz proxy para o GitHub Packages Maven (`maven.pkg.github.com`), autenticando com usuário e token.

## Uso

Qualquer requisição recebida pelo worker é repassada para o mesmo caminho em `https://maven.pkg.github.com`, com autenticação Basic (`cronapp-repo` + token).

Exemplo:

- Worker: `GET https://repository.cronapp.com/cronapp/cronapp-repository/io/cronapp/cronapp-integracao-oidc-sdk/4.4.11/cronapp-integracao-oidc-sdk-4.4.11.jar`
- Upstream: `GET https://maven.pkg.github.com/cronapp/cronapp-repository/io/cronapp/cronapp-integracao-oidc-sdk/4.4.11/cronapp-integracao-oidc-sdk-4.4.11.jar`

## Desenvolvimento local

```bash
npm install
cp .dev.vars.example .dev.vars
# Edite .dev.vars com o token real
npm run dev
```

## Deploy

```bash
npm install
wrangler secret put GITHUB_TOKEN
npm run deploy
```

## Configuração Maven

Aponte o repositório Maven para a URL do worker (sem credenciais no `settings.xml`):

```xml
    <repository>
      <id>cronapp-repository</id>
      <url>https://repository.cronapp.com/cronapp/cronapp-repository/</url>
    </repository>
</repository>
```
