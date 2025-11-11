# ⚡ Guia Rápido: Configurar CloudFlare CDN em 20 Minutos

## 🎯 Objetivo

Configurar CloudFlare CDN para reduzir latência global em 75% e custos de transferência em 80%.

---

## ✅ Checklist Rápido

### Com Domínio Próprio:

- [ ] 1. Criar conta CloudFlare (3 min)
- [ ] 2. Adicionar site (2 min)
- [ ] 3. Atualizar nameservers (5 min + 24h propagação)
- [ ] 4. Configurar Page Rules (3 min)
- [ ] 5. Configurar SSL/TLS (2 min)
- [ ] 6. Obter API credentials (3 min)
- [ ] 7. Configurar .env (1 min)
- [ ] 8. Testar (1 min)

### Sem Domínio (Alternativa):

- [ ] 1. Criar conta CloudFlare (3 min)
- [ ] 2. Criar R2 bucket (3 min)
- [ ] 3. Configurar acesso público (2 min)
- [ ] 4. Obter credenciais (2 min)
- [ ] 5. Configurar .env (1 min)
- [ ] 6. Migrar de S3 para R2 (5 min)
- [ ] 7. Testar (1 min)

---

## 🚀 Opção 1: Com Domínio Próprio

### 1️⃣ Criar Conta CloudFlare (3 min)

```
🔗 https://dash.cloudflare.com/sign-up

1. Preencha: Email e senha
2. Verifique email
3. Faça login
```

### 2️⃣ Adicionar Site (2 min)

```
1. No dashboard, clique em "Add a Site"
2. Digite seu domínio: saborconnect.com
3. Escolha plano: "Free" (grátis)
4. Clique em "Add site"
```

### 3️⃣ Atualizar Nameservers (5 min + 24h)

```
CloudFlare vai mostrar 2 nameservers:
- Example: alice.ns.cloudflare.com
- Example: bob.ns.cloudflare.com

No seu registrador de domínio (GoDaddy, Namecheap, etc):
1. Vá em "DNS Management"
2. Encontre "Nameservers"
3. Substitua pelos nameservers do CloudFlare
4. Salve

⏰ Aguarde propagação (pode levar até 24h)
💡 Verifique status no dashboard CloudFlare
```

### 4️⃣ Configurar DNS para CDN (2 min)

```
No CloudFlare, vá em "DNS" > "Records":

1. Adicione registro CNAME:
   Type: CNAME
   Name: cdn
   Target: saborconnect-uploads.s3.us-east-1.amazonaws.com
   Proxy status: Proxied (nuvem laranja) ☁️
   TTL: Auto

2. Clique em "Save"

Seu CDN URL será: https://cdn.saborconnect.com
```

### 5️⃣ Configurar Page Rules (3 min)

```
Vá em "Rules" > "Page Rules":

1. Clique em "Create Page Rule"
2. URL pattern: cdn.saborconnect.com/*
3. Settings:
   ✅ Cache Level: Cache Everything
   ✅ Edge Cache TTL: 1 month
   ✅ Browser Cache TTL: 1 month
4. Clique em "Save and Deploy"

Plano Free: 3 Page Rules
Plano Pro: 20 Page Rules
```

### 6️⃣ Configurar SSL/TLS (2 min)

```
Vá em "SSL/TLS":

1. Encryption mode: "Full (strict)"
2. Vá em "Edge Certificates"
3. Ative:
   ✅ Always Use HTTPS
   ✅ Automatic HTTPS Rewrites
   ✅ Minimum TLS Version: 1.2
   ✅ Opportunistic Encryption
```

### 7️⃣ Obter API Token (3 min)

```
1. Clique no ícone do perfil (canto superior direito)
2. "My Profile" > "API Tokens"
3. Clique em "Create Token"
4. Use template: "Edit zone DNS"
5. Zone Resources: Specific zone > saborconnect.com
6. Clique em "Continue to summary"
7. Clique em "Create Token"
8. COPIE E GUARDE o token!
```

### 8️⃣ Obter Zone ID (1 min)

```
1. No dashboard, selecione seu site
2. Sidebar direito, seção "API"
3. Copie o "Zone ID"
```

### 9️⃣ Configurar .env (1 min)

```bash
# .env
CLOUDFLARE_ZONE_ID=abc123...
CLOUDFLARE_API_TOKEN=xyz789...
CDN_URL=https://cdn.saborconnect.com
```

### 🔟 Reiniciar e Testar (1 min)

```bash
# Reiniciar
docker-compose restart backend

# Verificar logs
docker-compose logs backend | grep -i cloudflare

# Deve aparecer:
# CloudFlare client initialized { configured: true, cdnUrl: 'https://cdn.saborconnect.com' }

# Testar upload
# Nova receita deve ter URL: https://cdn.saborconnect.com/recipes/...
```

---

## 🚀 Opção 2: CloudFlare R2 (Sem Domínio)

### Por que R2?

- ✅ **Compatível com S3** (mesma API)
- ✅ **Egress GRÁTIS** (vs S3: $0.09/GB)
- ✅ **87% mais barato** que S3
- ✅ **CDN integrado** (sem configuração DNS)
- ✅ **URL público** instantâneo

### 1️⃣ Criar Conta CloudFlare (3 min)

```
Mesmos passos da Opção 1
```

### 2️⃣ Criar R2 Bucket (3 min)

```
1. No dashboard, vá em "R2" (no menu lateral)
2. Clique em "Create bucket"
3. Nome: saborconnect-uploads
4. Location: Automatic (usa região mais próxima)
5. Clique em "Create bucket"
```

### 3️⃣ Configurar Acesso Público (2 min)

```
No bucket criado:
1. Vá em "Settings"
2. "Public Access" section
3. Clique em "Allow Access"
4. Confirme
5. Copie a "Public Bucket URL": https://pub-xxxxx.r2.dev
```

### 4️⃣ Obter R2 API Credentials (2 min)

```
1. Vá em "R2" > "Manage R2 API Tokens"
2. Clique em "Create API Token"
3. Nome: SaborConnect API
4. Permissions: Object Read & Write
5. TTL: Forever (ou período desejado)
6. Clique em "Create API Token"
7. COPIE E GUARDE:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL
```

### 5️⃣ Configurar .env (1 min)

```bash
# .env

# COMENTE as variáveis do S3:
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=saborconnect-uploads

# ADICIONE as variáveis do R2:
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
AWS_REGION=auto
AWS_S3_BUCKET=saborconnect-uploads
AWS_ENDPOINT_URL=https://xxxxxxx.r2.cloudflarestorage.com
CDN_URL=https://pub-xxxxx.r2.dev
```

### 6️⃣ Atualizar Código para R2 (5 min)

Edite `backend/src/config/s3.ts`:

```typescript
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.AWS_ENDPOINT_URL, // Adicione esta linha
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
```

### 7️⃣ Migrar Dados de S3 para R2 (Opcional)

```bash
# Usar rclone para migração
# Instalar rclone: https://rclone.org/

# Configurar S3
rclone config create s3 s3 \
  access_key_id=YOUR_S3_KEY \
  secret_access_key=YOUR_S3_SECRET \
  region=us-east-1

# Configurar R2
rclone config create r2 s3 \
  access_key_id=YOUR_R2_KEY \
  secret_access_key=YOUR_R2_SECRET \
  endpoint=https://xxxxx.r2.cloudflarestorage.com

# Copiar dados
rclone copy s3:saborconnect-uploads r2:saborconnect-uploads --progress

# Tempo estimado: ~5-10 min para 1GB
```

### 8️⃣ Testar (1 min)

```bash
# Reiniciar
docker-compose restart backend

# Testar upload
curl -X POST http://localhost:4000/api/recipes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Teste R2" \
  -F "image=@test.jpg" \
  ...

# URL esperada: https://pub-xxxxx.r2.dev/recipes/...
```

---

## 🧪 Testes de Validação

### 1. Verificar CDN Headers

```bash
curl -I https://cdn.saborconnect.com/recipes/test.jpg

# Headers esperados:
# cf-cache-status: HIT (segunda request)
# cf-ray: xxxxx-GRU
# server: cloudflare
```

### 2. Testar Performance

```bash
# Instalar httpstat
pip install httpstat

# Testar latência
httpstat https://cdn.saborconnect.com/recipes/test.jpg

# Resultado esperado:
# DNS Lookup:     5-10ms
# TCP Connection: 5-10ms
# TLS Handshake:  10-15ms
# Server Processing: 1-3ms
# Content Transfer: 5-10ms
# TOTAL: 25-50ms (vs 150-300ms sem CDN)
```

### 3. Testar de Múltiplas Regiões

Use: https://tools.keycdn.com/performance

Digite a URL da sua imagem e teste!

**Resultados esperados:**

- América do Norte: 20-40ms
- Europa: 15-35ms
- Ásia: 25-50ms
- Oceania: 30-60ms

---

## 💰 Comparação de Custos

### 10k Usuários Ativos

| Serviço       | Setup  | Custo/Mês |
| ------------- | ------ | --------- |
| **S3 Apenas** | 15 min | $12.00    |
| **S3 + CDN**  | 35 min | $2.88     |
| **R2 + CDN**  | 20 min | $0.38     |

**Economia:** R2 é 97% mais barato que S3!

---

## 🎯 Qual Opção Escolher?

### Use S3 + CloudFlare CDN se:

- ✅ Já tem S3 configurado
- ✅ Tem domínio próprio
- ✅ Quer máxima compatibilidade

### Use CloudFlare R2 se:

- ✅ Está começando do zero
- ✅ Não tem domínio próprio
- ✅ Quer economia máxima (97% vs S3)
- ✅ Quer simplicidade (tudo em um lugar)

---

## 🐛 Troubleshooting

### DNS não propagou

```bash
# Verificar status
dig cdn.saborconnect.com

# Se não resolver, aguardar mais tempo (até 24h)
# Enquanto isso, pode usar IP direto para testar
```

### CDN não cacheia

```bash
✅ Page Rule configurada?
✅ URL matche o pattern?
✅ Proxy ativo (nuvem laranja)?
✅ Cache-Control headers corretos?
```

### R2 não conecta

```bash
✅ Endpoint URL correto?
✅ Access Key ID e Secret corretos?
✅ Bucket name correto?
✅ Permissions corretas no API Token?
```

---

## 🎉 Pronto!

Agora você tem:

- ⚡ **75% menos latência** global
- 💰 **80-97% economia** em transferência
- 🛡️ **DDoS protection** grátis
- 🔒 **SSL/TLS** automático
- 🌍 **300+ edge locations**

### 📋 Próximo Passo

**Dia 5: Load Testing**

- Ver: `IMPLEMENTACAO_LOAD_TESTING.md` (próximo guia)
- Testar 10k usuários simultâneos
- Validar performance end-to-end

---

**Criado por:** Equipe SaborConnect  
**Data:** 6 de novembro de 2025  
**Tempo:** 20-35 minutos ⚡
