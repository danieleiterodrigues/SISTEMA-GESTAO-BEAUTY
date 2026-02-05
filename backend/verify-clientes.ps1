<#
.SYNOPSIS
    Script de Verificação Manual de CRUD de Clientes (Sprint 3)
#>

$baseUrl = "http://localhost:3000/api"

Write-Host "--- Iniciando Verificação de CRUD de Clientes ---" -ForegroundColor Cyan

# 1. Login
$loginUrl = "$baseUrl/auth/login"
$loginBody = @{
    email = "admin@teste.com"
    senha = "senha123456"
} | ConvertTo-Json

Write-Host "`n1. Fazendo Login..."
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $loginResponse.access_token
    Write-Host "   Login OK!" -ForegroundColor Green
} catch {
    Write-Host "   FALHA NO LOGIN" -ForegroundColor Red
    exit
}

$headers = @{
    Authorization = "Bearer $token"
}

# 2. Criar Cliente
$createUrl = "$baseUrl/clientes"
$cpf = (Get-Random -Minimum 10000000000 -Maximum 99999999999).ToString()
$createBody = @{
    nome = "Cliente Teste $(Get-Random)"
    telefone = "11999999999"
    cpf = $cpf
} | ConvertTo-Json

Write-Host "`n2. Criando Cliente..."
try {
    $cliente = Invoke-RestMethod -Uri $createUrl -Method Post -Headers $headers -Body $createBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Sucesso! ID: $($cliente.id), Nome: $($cliente.nome)" -ForegroundColor Green
    $clienteId = $cliente.id
} catch {
    Write-Host "   ERRO AO CRIAR: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. Listar
Write-Host "`n3. Listando Clientes..."
try {
    $lista = Invoke-RestMethod -Uri "$baseUrl/clientes" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "   Sucesso! Total: $($lista.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ERRO AO LISTAR" -ForegroundColor Red
}

# 4. Atualizar
Write-Host "`n4. Atualizando Cliente..."
$updateBody = @{
    nome = "Cliente Atualizado"
} | ConvertTo-Json
try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/clientes/$clienteId" -Method Patch -Headers $headers -Body $updateBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Sucesso! Novo nome: $($updated.nome)" -ForegroundColor Green
} catch {
    Write-Host "   ERRO AO ATUALIZAR" -ForegroundColor Red
}

# 5. Remover (Soft Delete - torna inativo)
# Nota: O controller usa .remove() que no service seta status='inativo'
Write-Host "`n5. Removendo Cliente (Inativando)..."
try {
    $removed = Invoke-RestMethod -Uri "$baseUrl/clientes/$clienteId" -Method Delete -Headers $headers -ErrorAction Stop
    Write-Host "   Sucesso! Status agora é: $($removed.status)" -ForegroundColor Green
} catch {
    Write-Host "   ERRO AO REMOVER" -ForegroundColor Red
}
