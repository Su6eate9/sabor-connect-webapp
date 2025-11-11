# 🚀 Implementação AWS S3 - Guia Completo

**Data:** 6 de novembro de 2025  
**Fase:** 2 - Importante  
**Dias:** 2-3 de 5  
**Status:** 🔄 EM PROGRESSO

---

## 🎯 Objetivo

Migrar uploads de arquivos do storage local para AWS S3, permitindo:

- ✅ Storage ilimitado e escalável
- ✅ Múltiplas instâncias da API (horizontal scaling)
- ✅ Backup automático e durabilidade 99.999999999%
- ✅ Preparação para CDN (CloudFlare)

---

## ✅ Implementações Realizadas

### 1. Dependências Instaladas

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Pacotes:**

- `@aws-sdk/client-s3`: Cliente oficial AWS para S3
- `@aws-sdk/s3-request-presigner`: Gera URLs assinadas

### 2. Configuração S3 (backend/src/config/s3.ts)

```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Funções principais:
- uploadToS3(file, folder): Upload de arquivo
- uploadMultipleToS3(files, folder): Upload múltiplo
- deleteFromS3(key): Deletar arquivo
- deleteMultipleFromS3(keys): Deletar múltiplos
- generateSignedUrl(key, expiresIn): URL temporária
- extractS3Key(url): Extrair key de URL
- isS3Configured(): Verifica configuração
```

**Features:**

- ✅ Nome único com timestamp + hash
- ✅ Content-Type automático por extensão
- ✅ Cache-Control: 1 ano (imutável)
- ✅ Metadata com nome original
- ✅ Logs estruturados
- ✅ Suporte a CDN URL
- ✅ Fallback para local se não configurado

### 3. Upload Helper (backend/src/utils/uploadHelper.ts)

```typescript
// Abstração que funciona com S3 ou local
export const uploadFile = async (file, folder) => {
  if (isS3Configured()) {
    // Upload para S3
    const { url, key, cdnUrl } = await uploadToS3(file, folder);
    return { url: cdnUrl || url, key, cdnUrl };
  }

  // Fallback para local
  // ...
};

export const deleteFile = async (url) => {
  if (isS3Configured() && url.includes('.s3.')) {
    const key = extractS3Key(url);
    await deleteFromS3(key);
  } else {
    // Delete local
  }
};
```

**Benefícios:**

- ✅ Código da aplicação não precisa saber se é S3 ou local
- ✅ Fácil alternar entre S3 e local
- ✅ Suporta upload único e múltiplo
- ✅ Delete inteligente (S3 ou local)

### 4. Middleware Upload Atualizado

```typescript
// backend/src/middleware/upload.ts
const storage = multer.memoryStorage(); // Usa buffer em vez de disco

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxSize },
});
```

**Mudança:** De `diskStorage` para `memoryStorage` para permitir upload direto ao S3.

### 5. Script de Migração (backend/src/scripts/migrateToS3.ts)

```bash
npm run migrate:s3
```

**O que faz:**

1. Busca todas as receitas com imagens locais
2. Busca todos os usuários com avatares locais
3. Para cada imagem:
   - Lê arquivo local
   - Faz upload para S3
   - Atualiza URL no banco de dados
   - Loga resultado
4. Exibe relatório com estatísticas

**Estatísticas:**

- Total de imagens
- ✅ Migradas com sucesso
- ⏭️ Puladas (já no S3)
- ❌ Falhas
- Lista de erros

### 6. Variáveis de Ambiente

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=secret...
AWS_REGION=us-east-1
AWS_S3_BUCKET=saborconnect-uploads

# CDN Configuration (opcional)
CDN_URL=https://cdn.saborconnect.com
```

Adicionadas no:

- ✅ `.env.example`
- ✅ `docker-compose.yml`

---

## 📋 Próximos Passos (Para Você)

### Passo 1: Criar Conta AWS

```bash
1. Acesse: https://aws.amazon.com/
2. Clique em "Create an AWS Account"
3. Preencha: Email, senha, nome da conta
4. Adicione método de pagamento (cartão de crédito)
5. Verifique identidade (SMS/chamada)
6. Selecione plano: "Basic Support - Free"
7. Aguarde ativação (pode levar até 24h)
```

### Passo 2: Criar Bucket S3

```bash
1. Acesse: https://s3.console.aws.amazon.com/
2. Clique em "Create bucket"
3. Configurações:
   - Bucket name: saborconnect-uploads (ou outro único)
   - Region: us-east-1 (ou mais próxima)
   - Block all public access: DESMARQUE ✅
   - Bucket Versioning: Disabled
   - Tags: Opcional
   - Default encryption: Enable (SSE-S3)
4. Clique em "Create bucket"
```

### Passo 3: Configurar Permissões (Bucket Policy)

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

**Como aplicar:**

1. Selecione o bucket
2. Vá em "Permissions"
3. Em "Bucket policy", clique em "Edit"
4. Cole o JSON acima
5. Substitua `saborconnect-uploads` pelo seu bucket
6. Clique em "Save changes"

### Passo 4: Configurar CORS

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

**Como aplicar:**

1. Selecione o bucket
2. Vá em "Permissions"
3. Em "Cross-origin resource sharing (CORS)", clique em "Edit"
4. Cole o JSON acima
5. Clique em "Save changes"

### Passo 5: Criar IAM User

```bash
1. Acesse: https://console.aws.amazon.com/iam/
2. No menu lateral, clique em "Users"
3. Clique em "Create user"
4. User name: saborconnect-api
5. Permissions: Attach policies directly
6. Selecione: AmazonS3FullAccess
7. Clique em "Create user"
```

### Passo 6: Criar Access Keys

```bash
1. Clique no usuário criado
2. Vá em "Security credentials"
3. Em "Access keys", clique em "Create access key"
4. Use case: Application running outside AWS
5. Clique em "Next"
6. Description: SaborConnect API
7. Clique em "Create access key"
8. COPIE E GUARDE:
   - Access key ID: AKIA...
   - Secret access key: (mostrado apenas 1 vez!)
```

### Passo 7: Configurar Variáveis de Ambiente

```bash
# Edite o arquivo .env na raiz do projeto
nano .env

# Adicione:
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=saborconnect-uploads
```

### Passo 8: Reiniciar Backend

```bash
docker-compose restart backend

# Verificar logs
docker-compose logs backend | grep -i s3

# Deve aparecer:
# ✅ Upload configurado para usar AWS S3
# S3 client initialized { region: 'us-east-1', bucket: 'saborconnect-uploads', configured: true }
```

### Passo 9: Testar Upload

```bash
# Criar uma receita com imagem via API
# Ou usar o frontend

# Verificar no S3:
1. Acesse: https://s3.console.aws.amazon.com/
2. Clique no bucket
3. Vá em "Objects"
4. Deve aparecer: recipes/nome-timestamp-hash.jpg
```

### Passo 10: Migrar Imagens Existentes

```bash
# Execute o script de migração
docker exec saborconnect-backend npm run migrate:s3

# Aguarde o processo (pode demorar dependendo da quantidade)

# Verifique o relatório:
# 📊 RESUMO DA MIGRAÇÃO
# Total de imagens:     X
# ✅ Migradas:          Y
# ⏭️  Puladas:           Z
# ❌ Falhas:            0
```

---

## 🧪 Testes

### 1. Testar Upload de Nova Receita

```bash
curl -X POST http://localhost:4000/api/recipes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Receita de Teste S3" \
  -F "description=Testando upload para S3" \
  -F "ingredients=Ingrediente 1, Ingrediente 2" \
  -F "instructions=Passo 1, Passo 2" \
  -F "prepTime=30" \
  -F "cookTime=45" \
  -F "servings=4" \
  -F "difficulty=medium" \
  -F "cuisine=brasileira" \
  -F "category=almoço" \
  -F "image=@/caminho/para/imagem.jpg"

# Verifique a resposta:
# {
#   "image": "https://saborconnect-uploads.s3.us-east-1.amazonaws.com/recipes/nome-timestamp-hash.jpg"
# }
```

### 2. Verificar Acesso Público

```bash
# Copie a URL da imagem da resposta acima
# Cole no navegador
# A imagem deve abrir normalmente
```

### 3. Testar Delete

```bash
# Delete uma receita
curl -X DELETE http://localhost:4000/api/recipes/ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Verifique os logs:
docker-compose logs backend | grep "deleted from S3"

# Deve aparecer: File deleted from S3 successfully
```

---

## 📊 Estimativa de Custos AWS S3

### Free Tier (12 meses):

- ✅ 5 GB de armazenamento
- ✅ 20.000 GET requests
- ✅ 2.000 PUT requests
- ✅ 100 GB de transferência de dados

### Após Free Tier (us-east-1):

- **Storage:** $0.023 / GB / mês
- **PUT requests:** $0.005 / 1.000 requests
- **GET requests:** $0.0004 / 1.000 requests
- **Data transfer:** $0.09 / GB (primeiros 10 TB)

### Exemplo - 10.000 usuários:

- 50.000 imagens x 500 KB = **25 GB**
- 1 milhão de views/mês = **1M GET requests**
- 5.000 uploads/mês = **5K PUT requests**
- 12.5 TB de transferência/mês

**Custo Mensal:**

```
Storage:       25 GB x $0.023        = $0.58
PUT requests:  5K x $0.005/1K        = $0.025
GET requests:  1M x $0.0004/1K       = $0.40
Data transfer: 12.5 TB x $0.09/GB    = $11.48
                                TOTAL = $12.49/mês
```

💡 **Com CDN (CloudFlare), reduz transferência do S3 em 80%+ = ~$3/mês**

---

## 🔧 Comandos Úteis

### AWS CLI (opcional)

```bash
# Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciais
aws configure

# Listar objetos no bucket
aws s3 ls s3://saborconnect-uploads/ --recursive

# Ver tamanho total do bucket
aws s3 ls s3://saborconnect-uploads/ --recursive --summarize

# Baixar backup de todos os arquivos
aws s3 sync s3://saborconnect-uploads/ ./backup/
```

### Monitoramento

```bash
# Ver logs de upload
docker-compose logs backend | grep "uploaded to S3"

# Ver logs de delete
docker-compose logs backend | grep "deleted from S3"

# Ver tamanho do bucket (via AWS Console)
# S3 > Bucket > Metrics > Total bucket size
```

---

## 🐛 Troubleshooting

### Erro: "Access Denied"

```bash
# Verifique:
1. Bucket policy configurada corretamente
2. IAM user tem permissão AmazonS3FullAccess
3. Credenciais corretas no .env
4. Bucket name está correto
```

### Erro: "NoSuchBucket"

```bash
# Verifique:
1. Nome do bucket está correto (case-sensitive)
2. Region está correta
3. Bucket foi criado com sucesso
```

### Imagem não carrega no navegador

```bash
# Verifique:
1. Bucket policy permite acesso público (GetObject)
2. Block public access está DESMARCADO
3. URL está completa e correta
4. CORS configurado se acessar de outro domínio
```

### Script de migração falha

```bash
# Verifique:
1. AWS credenciais configuradas
2. Backend pode acessar arquivos locais
3. Espaço em disco suficiente
4. Conexão com AWS OK

# Ver logs detalhados:
docker exec saborconnect-backend npm run migrate:s3 2>&1 | tee migration.log
```

---

## 🎯 Benefícios Alcançados

### Escalabilidade:

- ✅ **Storage ilimitado** (vs. 50 GB local)
- ✅ **Múltiplas instâncias** da API (horizontal scaling)
- ✅ **99.999999999% durabilidade** (vs. 99% local)

### Performance:

- ✅ **Preparado para CDN** (próximo passo)
- ✅ **Cache de 1 ano** configurado
- ✅ **Content-Type otimizado**

### Confiabilidade:

- ✅ **Backup automático** em 3 zonas de disponibilidade
- ✅ **Versionamento** disponível se necessário
- ✅ **Logs** de acesso disponíveis

### Custo:

- ✅ **Free tier** para começar (12 meses)
- ✅ **~$12/mês** para 10k usuários
- ✅ **~$3/mês** com CDN

---

## 📈 Próximos Passos

✅ **Dia 1: Redis Cache** - COMPLETO  
✅ **Dias 2-3: AWS S3** - COMPLETO (aguardando configuração AWS)  
📋 **Dia 4: CloudFlare CDN** - Próximo  
📋 **Dia 5: Load Testing** - Pendente

---

## 📝 Notas Importantes

1. **Segurança:**
   - ⚠️ NUNCA commite credenciais AWS no Git
   - ✅ Use IAM roles em produção (se possível)
   - ✅ Ative MFA na conta AWS
   - ✅ Rotacione access keys periodicamente

2. **Backup:**
   - ✅ S3 já tem backup automático (3 AZs)
   - 💡 Considere S3 Versioning para rollback
   - 💡 Considere S3 Lifecycle para arquivos antigos

3. **Monitoramento:**
   - ✅ Ative CloudWatch Metrics no bucket
   - 💡 Configure alarmes para custos
   - 💡 Monitore taxa de erros 4xx/5xx

4. **Otimização:**
   - 💡 Considere S3 Intelligent-Tiering
   - 💡 Considere comprimir imagens antes do upload
   - 💡 Considere limitar tamanho máximo de uploads

---

**Implementado por:** Equipe SaborConnect  
**Data:** 6 de novembro de 2025  
**Status:** 🔄 AGUARDANDO CONFIGURAÇÃO AWS
