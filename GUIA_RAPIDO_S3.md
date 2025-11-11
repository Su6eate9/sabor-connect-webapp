# ⚡ Guia Rápido: Configurar AWS S3 em 15 Minutos

## 🎯 Objetivo

Configurar AWS S3 para armazenar imagens do SaborConnect.

---

## ✅ Checklist Rápido

- [ ] 1. Criar conta AWS (5 min)
- [ ] 2. Criar bucket S3 (2 min)
- [ ] 3. Configurar permissões (2 min)
- [ ] 4. Criar IAM user (3 min)
- [ ] 5. Obter credenciais (1 min)
- [ ] 6. Configurar .env (1 min)
- [ ] 7. Testar (1 min)

**Total: ~15 minutos**

---

## 🚀 Passo a Passo

### 1️⃣ Criar Conta AWS (5 min)

```
🔗 https://aws.amazon.com/

1. Clique em "Create an AWS Account"
2. Preencha:
   - Email
   - Senha
   - Nome da conta AWS
3. Adicione cartão de crédito (não será cobrado no free tier)
4. Verifique por SMS
5. Escolha plano: "Basic Support - Free"
6. Aguarde ativação (pode levar minutos)
```

### 2️⃣ Criar Bucket S3 (2 min)

```
🔗 https://s3.console.aws.amazon.com/

1. Clique em "Create bucket"
2. Configurações:
   ✅ Bucket name: saborconnect-uploads (ÚNICO globalmente)
   ✅ Region: us-east-1 (mais barato)
   ✅ Block all public access: DESMARQUE ⚠️
   ✅ Bucket Versioning: Disabled
   ✅ Default encryption: Enable (SSE-S3)
3. Clique em "Create bucket"
```

💡 **Dica:** Nome do bucket deve ser único em TODO o AWS! Se der erro, tente outro nome.

### 3️⃣ Configurar Permissões (2 min)

#### 3.1 Bucket Policy (Acesso Público para Leitura)

```
No bucket criado:
1. Vá em "Permissions"
2. Em "Bucket policy", clique em "Edit"
3. Cole:
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::saborconnect-uploads/*"
    }
  ]
}
```

⚠️ **Substitua `saborconnect-uploads` pelo nome do SEU bucket!**

```
4. Clique em "Save changes"
```

#### 3.2 CORS Configuration

```
No bucket criado:
1. Vá em "Permissions"
2. Em "Cross-origin resource sharing (CORS)", clique em "Edit"
3. Cole:
```

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

```
4. Clique em "Save changes"
```

### 4️⃣ Criar IAM User (3 min)

```
🔗 https://console.aws.amazon.com/iam/

1. No menu lateral, clique em "Users"
2. Clique em "Create user"
3. User name: saborconnect-api
4. Clique em "Next"
5. Permissions: "Attach policies directly"
6. Busque e selecione: "AmazonS3FullAccess"
7. Clique em "Next"
8. Clique em "Create user"
```

### 5️⃣ Obter Credenciais (1 min)

```
No IAM User criado:
1. Clique no usuário "saborconnect-api"
2. Vá em "Security credentials"
3. Em "Access keys", clique em "Create access key"
4. Use case: "Application running outside AWS"
5. Clique em "Next"
6. Description: SaborConnect API
7. Clique em "Create access key"
8. 🔴 COPIE E GUARDE (mostrado apenas 1 vez!):
```

```
Access key ID:     AKIA...
Secret access key: wJalr...
```

⚠️ **NUNCA compartilhe essas credenciais!**

### 6️⃣ Configurar .env (1 min)

```bash
# No seu projeto, edite o arquivo .env na raiz
nano .env

# Adicione as seguintes linhas:
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
AWS_REGION=us-east-1
AWS_S3_BUCKET=saborconnect-uploads
```

⚠️ **Substitua pelos valores reais copiados acima!**

### 7️⃣ Testar (1 min)

```bash
# Reinicie o backend
docker-compose restart backend

# Verifique os logs
docker-compose logs backend | grep -i s3

# Deve aparecer:
# ✅ Upload configurado para usar AWS S3
# S3 client initialized { region: 'us-east-1', bucket: 'saborconnect-uploads', configured: true }
```

---

## 🧪 Teste Rápido

### Opção 1: Via Frontend

```
1. Acesse http://localhost:5173
2. Faça login
3. Crie uma receita com imagem
4. Verifique se a imagem aparece
5. Vá no S3 Console e veja: recipes/nome-timestamp-hash.jpg
```

### Opção 2: Via cURL

```bash
curl -X POST http://localhost:4000/api/recipes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Teste S3" \
  -F "description=Testando upload" \
  -F "ingredients=Ingrediente 1" \
  -F "instructions=Passo 1" \
  -F "prepTime=10" \
  -F "cookTime=20" \
  -F "servings=2" \
  -F "difficulty=easy" \
  -F "cuisine=brasileira" \
  -F "category=lanche" \
  -F "image=@/caminho/para/imagem.jpg"
```

**Resposta esperada:**

```json
{
  "id": 1,
  "name": "Teste S3",
  "image": "https://saborconnect-uploads.s3.us-east-1.amazonaws.com/recipes/teste-1234567890-abc123.jpg"
  ...
}
```

**Copie a URL da imagem e cole no navegador - deve abrir!**

---

## 🎉 Pronto!

Agora você tem:

- ✅ AWS S3 configurado
- ✅ Upload de imagens funcionando
- ✅ Acesso público às imagens
- ✅ Storage ilimitado e escalável

### 📋 Próximos Passos

1. **Migrar imagens antigas:**

   ```bash
   docker exec saborconnect-backend npm run migrate:s3
   ```

2. **Configurar CDN (CloudFlare):**
   - Ver: `IMPLEMENTACAO_CDN.md` (próximo guia)

3. **Monitorar custos:**
   - AWS Console > Billing > Bills

---

## 🐛 Troubleshooting

### Erro: "Access Denied"

```bash
✅ Verificar: Bucket policy configurada?
✅ Verificar: Block public access desmarcado?
✅ Verificar: Credenciais corretas no .env?
```

### Erro: "NoSuchBucket"

```bash
✅ Verificar: Nome do bucket correto (case-sensitive)?
✅ Verificar: Region correta (us-east-1)?
✅ Verificar: Bucket foi criado com sucesso?
```

### Imagem não abre no navegador

```bash
✅ Verificar: Bucket policy permite GetObject?
✅ Verificar: URL completa e correta?
✅ Verificar: CORS configurado?
```

### Backend não vê configuração

```bash
✅ Verificar: .env na raiz do projeto?
✅ Verificar: docker-compose.yml tem as variáveis?
✅ Verificar: Backend reiniciado após configurar?

# Reiniciar:
docker-compose restart backend
```

---

## 💰 Custos Estimados

### Free Tier (12 meses grátis):

- ✅ 5 GB storage
- ✅ 20.000 GET requests/mês
- ✅ 2.000 PUT requests/mês
- ✅ 100 GB transfer/mês

### Após Free Tier:

- **10k usuários:** ~$12/mês
- **Com CDN:** ~$3/mês (economia de 75%)

💡 **Para começar: GRÁTIS por 12 meses!**

---

## 📚 Documentação Completa

Para mais detalhes, ver:

- `IMPLEMENTACAO_S3.md` - Documentação técnica completa
- `GUIA_FASE_2_IMPORTANTES.md` - Guia detalhado da Fase 2

---

**Criado por:** Equipe SaborConnect  
**Data:** 6 de novembro de 2025  
**Tempo:** 15 minutos ⚡
