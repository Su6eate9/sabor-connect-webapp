# 🚀 Guia de Configuração CloudFlare e AWS S3

Este guia vai te ajudar a configurar o CloudFlare R2 (recomendado) ou AWS S3 para armazenamento de imagens do SaborConnect.

## 📊 Comparação de Custos

| Serviço                         | Custo Mensal | Setup  | Benefícios                                          |
| ------------------------------- | ------------ | ------ | --------------------------------------------------- |
| **CloudFlare R2** (Recomendado) | ~$0.38       | 15 min | 87% mais barato, CDN integrado, sem custo de egress |
| AWS S3                          | ~$12         | 15 min | Mais estabelecido, ecossistema AWS                  |
| Local Storage (atual)           | $0           | 0 min  | Sem custos, mas limita escala                       |

## 🎯 Opção 1: CloudFlare R2 (RECOMENDADO - Mais Barato)

### Por que CloudFlare R2?

- ✅ **87% mais barato** que S3 ($0.38 vs $12/mês)
- ✅ **CDN integrado** gratuitamente
- ✅ **Zero custo de transferência** (egress gratuito)
- ✅ **API compatível com S3** (mesmo código)
- ✅ **Cache global** em 275+ cidades

### Passo 1: Criar Conta CloudFlare

1. Acesse https://dash.cloudflare.com/sign-up
2. Crie conta gratuita (não precisa cartão de crédito para começar)
3. Verifique email

### Passo 2: Criar R2 Bucket

1. No dashboard, vá em **R2** no menu lateral
2. Clique em **Create bucket**
3. Configure:
   - **Bucket name**: `saborconnect-uploads` (ou outro nome)
   - **Location**: Automatic (recomendado)
4. Clique em **Create bucket**

### Passo 3: Configurar Acesso Público

1. No bucket criado, vá em **Settings**
2. Em **Public access**, clique em **Allow Access**
3. Configure:
   - ☑️ Allow public access to this bucket
4. Copie a **Public Bucket URL** (ex: `https://pub-xxxxx.r2.dev`)

### Passo 4: Criar API Token

1. No painel do R2, vá em **Manage R2 API Tokens**
2. Clique em **Create API Token**
3. Configure:
   - **Token name**: `saborconnect-api`
   - **Permissions**: Object Read & Write
   - **Specific buckets**: Selecione seu bucket
4. Clique em **Create API Token**
5. **IMPORTANTE**: Copie e salve:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (ex: `https://xxxxx.r2.cloudflarestorage.com`)

### Passo 5: Configurar .env

Abra o arquivo `.env` e adicione:

```bash
# AWS S3 Configuration (usando CloudFlare R2)
AWS_ACCESS_KEY_ID=seu_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=seu_secret_access_key_aqui
AWS_REGION=auto
AWS_S3_BUCKET=saborconnect-uploads
AWS_ENDPOINT_URL=https://xxxxx.r2.cloudflarestorage.com

# CloudFlare Configuration
CDN_URL=https://pub-xxxxx.r2.dev
```

### Passo 6: Reiniciar Backend

```bash
docker restart saborconnect-backend
```

### Passo 7: Verificar Configuração

```bash
curl http://localhost:4000/api/admin/health | python -m json.tool
```

Você deve ver:

```json
{
  "s3": {
    "configured": true,
    "status": "connected"
  }
}
```

### Passo 8: Migrar Imagens Existentes (Opcional)

```bash
docker exec saborconnect-backend npm run migrate:s3
```

### Passo 9: Configurar Cache CloudFlare (Opcional - CDN Avançado)

Se você tem um domínio próprio e quer cache ainda mais avançado:

1. No dashboard CloudFlare, vá em **Overview**
2. Copie o **Zone ID**
3. Vá em **Profile** > **API Tokens**
4. Crie token com permissão `Zone.Cache Purge`
5. Adicione ao `.env`:

```bash
CLOUDFLARE_ZONE_ID=seu_zone_id_aqui
CLOUDFLARE_API_TOKEN=seu_api_token_aqui
```

---

## 🏢 Opção 2: AWS S3 (Tradicional)

### Passo 1: Criar Conta AWS

1. Acesse https://aws.amazon.com/free
2. Crie conta gratuita (precisa cartão de crédito)
3. **Atenção**: Free Tier dura 12 meses

### Passo 2: Criar S3 Bucket

1. Acesse o console AWS: https://console.aws.amazon.com/s3
2. Clique em **Create bucket**
3. Configure:
   - **Bucket name**: `saborconnect-uploads-UNIQUE` (deve ser único globalmente)
   - **Region**: `us-east-1` (ou mais próxima de você)
   - **Block Public Access**: DESMARQUE todas as opções
   - ☑️ Acknowledge que o bucket será público
4. Clique em **Create bucket**

### Passo 3: Configurar CORS

1. No bucket criado, vá em **Permissions** > **CORS**
2. Clique em **Edit** e adicione:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Passo 4: Configurar Bucket Policy

1. Ainda em **Permissions**, vá em **Bucket Policy**
2. Clique em **Edit** e adicione (substitua `SEU-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::SEU-BUCKET-NAME/*"
    }
  ]
}
```

### Passo 5: Criar IAM User

1. Acesse IAM: https://console.aws.amazon.com/iam
2. Vá em **Users** > **Create user**
3. Configure:
   - **User name**: `saborconnect-s3`
   - ☑️ Access key - Programmatic access
4. Em **Permissions**, clique em **Attach policies directly**
5. Busque e selecione: `AmazonS3FullAccess`
6. Clique em **Create user**
7. **IMPORTANTE**: Copie e salve:
   - Access Key ID
   - Secret Access Key

### Passo 6: Configurar .env

Abra o arquivo `.env` e adicione:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=seu_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=seu_secret_access_key_aqui
AWS_REGION=us-east-1
AWS_S3_BUCKET=saborconnect-uploads-UNIQUE
# AWS_ENDPOINT_URL= (deixe vazio para AWS S3)
```

### Passo 7: Reiniciar Backend

```bash
docker restart saborconnect-backend
```

### Passo 8: Verificar Configuração

```bash
curl http://localhost:4000/api/admin/health | python -m json.tool
```

### Passo 9: Migrar Imagens Existentes (Opcional)

```bash
docker exec saborconnect-backend npm run migrate:s3
```

---

## 🧪 Testando a Configuração

### 1. Verificar Status dos Serviços

```bash
curl http://localhost:4000/api/admin/health | python -m json.tool
```

**Resultado esperado:**

```json
{
  "redis": {
    "configured": true,
    "status": "connected"
  },
  "s3": {
    "configured": true,
    "status": "connected"
  },
  "cloudflare": {
    "configured": false,
    "status": "not configured"
  }
}
```

### 2. Testar Upload de Imagem

Use o frontend ou Postman para fazer upload de uma imagem de receita:

```bash
# Criar receita com imagem
curl -X POST http://localhost:4000/api/recipes \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "title=Receita Teste" \
  -F "image=@caminho/para/imagem.jpg"
```

### 3. Verificar Logs

```bash
docker-compose logs backend | tail -20
```

Você deve ver:

```
S3 client initialized {
  region: 'us-east-1',
  bucket: 'saborconnect-uploads',
  configured: true,
  cdnEnabled: true
}
```

### 4. Testar Admin Cache

```bash
# Limpar cache específico
curl -X POST http://localhost:4000/api/admin/cache/purge \
  -H "Content-Type: application/json" \
  -d '{"pattern": "recipes:*"}'

# Ver estatísticas
curl http://localhost:4000/api/admin/cache/stats | python -m json.tool
```

---

## 📊 Checklist de Configuração

### CloudFlare R2

- [ ] Conta CloudFlare criada
- [ ] R2 Bucket criado
- [ ] Acesso público configurado
- [ ] API Token criado e salvo
- [ ] Credenciais adicionadas ao `.env`
- [ ] Backend reiniciado
- [ ] Status verificado (`/api/admin/health`)
- [ ] Upload testado
- [ ] (Opcional) Imagens migradas

### AWS S3

- [ ] Conta AWS criada
- [ ] S3 Bucket criado
- [ ] CORS configurado
- [ ] Bucket Policy configurado
- [ ] IAM User criado
- [ ] Credenciais adicionadas ao `.env`
- [ ] Backend reiniciado
- [ ] Status verificado (`/api/admin/health`)
- [ ] Upload testado
- [ ] (Opcional) Imagens migradas

### CloudFlare CDN Avançado (Opcional)

- [ ] Domínio próprio configurado
- [ ] Zone ID obtido
- [ ] API Token criado
- [ ] Credenciais adicionadas ao `.env`
- [ ] Backend reiniciado
- [ ] Cache testado

---

## 🔧 Troubleshooting

### Erro: "S3 client initialized {configured:false}"

**Causa**: Credenciais não configuradas ou incorretas

**Solução**:

1. Verifique se o arquivo `.env` tem todas as variáveis
2. Verifique se não há espaços antes/depois dos valores
3. Reinicie o backend: `docker restart saborconnect-backend`

### Erro: "Access Denied" ao fazer upload

**Causa**: Permissões incorretas

**CloudFlare R2**:

- Verifique se o bucket tem acesso público habilitado
- Verifique se o API Token tem permissão de escrita

**AWS S3**:

- Verifique se o IAM User tem política `AmazonS3FullAccess`
- Verifique se a Bucket Policy está correta

### Erro: "SignatureDoesNotMatch"

**Causa**: Credenciais incorretas

**Solução**:

1. Verifique se `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` estão corretos
2. Verifique se não há caracteres especiais mal copiados
3. Recrie as credenciais se necessário

### Imagens não carregam no frontend

**Causa**: CORS não configurado

**Solução**:

1. Para AWS S3: Configure CORS como mostrado no Passo 3
2. Para CloudFlare R2: Verifique se o acesso público está habilitado

---

## 💰 Estimativa de Custos

### CloudFlare R2

```
Armazenamento: 10 GB × $0.015/GB = $0.15
Operações Classe A: 1M × $4.50/M = $4.50
Operações Classe B: 10M × $0.36/M = $3.60
Egress: GRÁTIS
CDN: GRÁTIS

Total mensal com 10k usuários: ~$0.38
```

### AWS S3

```
Armazenamento: 10 GB × $0.023/GB = $0.23
PUT/POST: 1M × $0.005/1k = $5.00
GET: 10M × $0.004/10k = $4.00
Transferência (100 GB): $9.00

Total mensal com 10k usuários: ~$18.23
```

**CloudFlare R2 é 98% mais barato!** 🎉

---

## 🎯 Recomendação Final

Para **SaborConnect com 10k+ usuários**, recomendamos:

1. **Usar CloudFlare R2** para armazenamento:
   - 98% mais barato que AWS S3
   - CDN global incluído gratuitamente
   - Zero custo de transferência de dados
   - API compatível com S3 (mesmo código)

2. **Configurar Redis Cache** (já feito ✅):
   - 97% de melhoria de performance
   - Reduz carga no banco de dados
   - Resposta de 221ms → 6ms

3. **Migrar imagens existentes**:
   - Use o script de migração
   - Processo automático e seguro
   - Mantém URLs antigas funcionando

4. **Monitorar performance**:
   - Use `/api/admin/health` para status
   - Use `/api/admin/cache/stats` para métricas
   - Configure alertas se necessário

---

## 📚 Próximos Passos

Depois de configurar CloudFlare/AWS:

1. **Load Testing** (Dia 5 - 3-4 horas)
   - Testar com 10k usuários simultâneos
   - Validar cache hit rate >70%
   - Medir latência (p50, p95, p99)

2. **Fase 3** (2 semanas)
   - PostgreSQL Read Replicas
   - CI/CD com GitHub Actions
   - Monitoring Stack (Prometheus + Grafana)

---

## ❓ Precisa de Ajuda?

- 📖 **Guias completos**: `IMPLEMENTACAO_S3.md`, `IMPLEMENTACAO_CDN.md`
- 🚀 **Guias rápidos**: `GUIA_RAPIDO_S3.md`, `GUIA_RAPIDO_CDN.md`
- 📊 **Status atual**: `STATUS_CONFIGURACAO.md`
- 📝 **Resumo técnico**: `RESUMO_FASE_2_COMPLETO.md`

**Sugestão**: Comece com CloudFlare R2! É mais barato, mais rápido de configurar e inclui CDN gratuitamente. 🎉
