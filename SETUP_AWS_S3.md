# ⚡ Setup Rápido - AWS S3 (20 minutos)

## ⚠️ Aviso Importante

**CloudFlare R2 é 98% mais barato!** Considere usar R2 primeiro.

Veja: `SETUP_CLOUDFLARE_R2.md`

Use AWS S3 apenas se:

- Você já tem conta AWS
- Precisa integrar com outros serviços AWS
- Tem créditos AWS para usar

---

## 💰 Custo Comparativo

| Serviço       | Custo/mês (10k usuários) |
| ------------- | ------------------------ |
| CloudFlare R2 | $0.38                    |
| AWS S3        | $18.23                   |

---

## 📝 Passo a Passo

### 1️⃣ Criar Conta AWS (5 min)

1. Acesse: https://aws.amazon.com/free
2. Clique em **Create a Free Account**
3. Preencha:
   - Email
   - Password
   - Account name
4. Escolha: **Personal Account**
5. Preencha informações pessoais
6. **Adicione cartão de crédito** (obrigatório)
7. Verifique telefone
8. Escolha plano: **Free**

✅ **Free Tier dura 12 meses** (5GB grátis)

---

### 2️⃣ Criar S3 Bucket (4 min)

1. Faça login no console: https://console.aws.amazon.com
2. Busque por **S3** no topo
3. Clique em **Create bucket**
4. Preencha:

   ```
   Bucket name: saborconnect-uploads-SEU-NOME
   (exemplo: saborconnect-uploads-joao123)

   AWS Region: US East (N. Virginia) us-east-1
   ```

5. Em **Block Public Access settings**:
   - ⬜ DESMARQUE "Block all public access"
   - ☑️ Marque "I acknowledge..."
6. Deixe outras opções padrão
7. Clique em **Create bucket**

📸 **Você verá seu bucket na lista**

---

### 3️⃣ Configurar CORS (2 min)

1. Clique no bucket criado
2. Vá na aba **Permissions**
3. Role até **Cross-origin resource sharing (CORS)**
4. Clique em **Edit**
5. Cole este JSON:

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

6. Clique em **Save changes**

---

### 4️⃣ Configurar Bucket Policy (2 min)

1. Ainda em **Permissions**
2. Role até **Bucket policy**
3. Clique em **Edit**
4. Cole este JSON (substitua `SEU-BUCKET-NAME`):

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

**Exemplo:**

```json
"Resource": "arn:aws:s3:::saborconnect-uploads-joao123/*"
```

5. Clique em **Save changes**

---

### 5️⃣ Criar IAM User (4 min)

1. No console AWS, busque por **IAM**
2. No menu lateral, clique em **Users**
3. Clique em **Create user**
4. Preencha:
   ```
   User name: saborconnect-s3
   ```
5. **NÃO** marque "Provide user access to AWS Management Console"
6. Clique em **Next**
7. Escolha: **Attach policies directly**
8. Na busca, digite: `AmazonS3FullAccess`
9. ☑️ Marque a política `AmazonS3FullAccess`
10. Clique em **Next**
11. Clique em **Create user**

---

### 6️⃣ Criar Access Keys (2 min)

1. Clique no usuário `saborconnect-s3` criado
2. Vá na aba **Security credentials**
3. Role até **Access keys**
4. Clique em **Create access key**
5. Escolha: **Application running outside AWS**
6. Clique em **Next**
7. (Opcional) Adicione descrição: `SaborConnect Backend`
8. Clique em **Create access key**

🚨 **ATENÇÃO**: Você verá 2 valores importantes:

```
Access key ID: AKIA.....................
Secret access key: abcd1234........................
```

💾 **COPIE ESSES 2 VALORES AGORA!** O Secret não aparecerá novamente.

---

### 7️⃣ Configurar .env (2 min)

1. Abra o arquivo `.env` no VS Code
2. Preencha as variáveis com os valores que você copiou:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=cole_aqui_o_access_key_id
AWS_SECRET_ACCESS_KEY=cole_aqui_o_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket-name
# AWS_ENDPOINT_URL= (deixe vazio ou comente esta linha)
```

**Exemplo preenchido:**

```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=saborconnect-uploads-joao123
# AWS_ENDPOINT_URL=
```

💾 **Salve o arquivo** (Ctrl+S)

---

### 8️⃣ Reiniciar Backend (1 min)

Abra o terminal no VS Code e execute:

```bash
docker restart saborconnect-backend
```

Aguarde 5-10 segundos até ver:

```
saborconnect-backend
```

---

### 9️⃣ Verificar Configuração (30 seg)

Execute no terminal:

```bash
curl http://localhost:4000/api/admin/health | python -m json.tool
```

✅ **Resultado esperado:**

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

🎉 **Se `s3.configured` for `true`, está funcionando!**

---

### 🔟 Testar Upload (Opcional - 1 min)

Teste fazendo upload de uma imagem no frontend:

1. Abra: http://localhost:5173
2. Faça login
3. Crie uma nova receita
4. Adicione uma imagem
5. Salve

A imagem será enviada para o AWS S3! 🚀

---

### 1️⃣1️⃣ Migrar Imagens Antigas (Opcional - 2 min)

Se você já tem imagens no sistema:

```bash
docker exec saborconnect-backend npm run migrate:s3
```

Você verá:

```
Migrando receitas...
✓ Receita 1: migrada (1.2 MB)
✓ Receita 2: migrada (0.8 MB)
...
```

---

## 🎊 Pronto! AWS S3 Configurado

Seu SaborConnect agora usa AWS S3:

- ✅ **Armazenamento na AWS**
- ✅ **12 meses grátis** (5GB Free Tier)
- ✅ **Integração com AWS**
- ⚠️ **$18/mês** após Free Tier (vs $0.38 do R2)

---

## 🆘 Problemas Comuns

### ❌ Erro: "s3.configured: false"

**Causa**: Credenciais não configuradas

**Solução**:

1. Verifique se o `.env` tem Access Key e Secret preenchidos
2. Verifique se não há espaços antes/depois dos valores
3. Verifique se `AWS_ENDPOINT_URL` está vazio ou comentado
4. Reinicie: `docker restart saborconnect-backend`

### ❌ Erro: "Access Denied" ao fazer upload

**Causa**: Permissões incorretas

**Solução**:

1. Verifique se o IAM User tem política `AmazonS3FullAccess`
2. Verifique se a Bucket Policy está correta
3. Verifique se o bucket name no `.env` está correto

### ❌ Erro: "SignatureDoesNotMatch"

**Causa**: Credenciais incorretas

**Solução**:

1. Recrie as Access Keys
2. Copie novamente (sem espaços)
3. Atualize o `.env`
4. Reinicie o backend

### ❌ CORS Error no frontend

**Causa**: CORS não configurado

**Solução**:

1. Vá no bucket > Permissions > CORS
2. Adicione a configuração CORS (Passo 3)
3. Salve as mudanças

---

## 💡 Dica: Economize 98% com CloudFlare R2

Considere migrar para CloudFlare R2:

- **Mesmo código** (API compatível com S3)
- **$0.38/mês** vs $18/mês do S3
- **CDN grátis** incluído
- **Zero custo de transferência**

Veja: `SETUP_CLOUDFLARE_R2.md`

---

## 💰 Quanto Vai Custar?

### Free Tier (primeiros 12 meses):

```
5 GB de armazenamento: GRÁTIS
20.000 GET requests: GRÁTIS
2.000 PUT requests: GRÁTIS

Você provavelmente não pagará nada nos primeiros meses!
```

### Após Free Tier (com 10.000 usuários):

```
Armazenamento (10 GB): $0.23/mês
PUT/POST (1M): $5.00/mês
GET (10M): $4.00/mês
Transferência (100 GB): $9.00/mês

Total: ~$18.23/mês
```

**vs CloudFlare R2**: ~$0.38/mês (98% mais barato!)

---

## 📊 Próximos Passos

Agora que o AWS S3 está configurado:

1. ✅ **Redis Cache**: Já configurado (97% mais rápido)
2. ✅ **AWS S3**: Configurado (armazenamento)
3. ⏳ **CloudFlare CDN**: Opcional (mais velocidade)
4. ⏳ **Load Testing**: Testar com 10k usuários
5. ⏳ **Fase 3**: Monitoring, CI/CD

---

## 🔒 Segurança

### Proteja suas credenciais:

```bash
# NUNCA faça commit do .env no Git
git add .gitignore
# Verifique se .env está no .gitignore

# Rotacione as Access Keys a cada 90 dias
# (recomendação AWS)
```

### Limite permissões IAM:

Se quiser mais segurança, crie política customizada:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::SEU-BUCKET/*"
    }
  ]
}
```

---

## 🎓 Quer Saber Mais?

- 📖 **Guia completo**: `CONFIGURACAO_CLOUDFLARE_AWS.md`
- 🔧 **Implementação técnica**: `IMPLEMENTACAO_S3.md`
- 📊 **Status atual**: `STATUS_CONFIGURACAO.md`
- 💰 **Compare com R2**: `SETUP_CLOUDFLARE_R2.md`

---

**Dúvidas?** Consulte o guia completo! 🚀
