<#
.SYNOPSIS
    Script de Verificação Manual de CRUD de Usuários (Sprint 2)
.DESCRIPTION
    Este script verifica se as proteções (Guards) estão funcionando.
    1. Loga como Admin.
    2. Cria um usuário Gerente.
    3. Lista todos os usuários.
    4. Deleta o usuário criado.
#>

$baseUrl = "http://localhost:3000/api"

Write-Host "--- Iniciando Verificação de CRUD de Usuários ---" -ForegroundColor Cyan

# 1. Login como Admin (criado no script anterior)
$loginUrl = "$baseUrl/auth/login"
$loginBody = @{
    email = "admin@teste.com"
    senha = "senha123456"
} | ConvertTo-Json

Write-Host "`n1. Fazendo Login como Admin..."
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $loginResponse.access_token
    Write-Host "   Login realizado com Sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ERRO NO LOGIN ADMIN. Verifique se o admin existe." -ForegroundColor Red
    exit
}

$headers = @{
    Authorization = "Bearer $token"
}

# 2. Criar Usuário (Gerente)
$createUrl = "http://localhost:3000/api/usuarios"
$gerenteEmail = "gerente_$(Get-Random)@teste.com" # Email unico
$createBody = @{
    nome = "Gerente Teste"
    email = $gerenteEmail
    senha = "senha123"
    perfil = "gerente"
} | ConvertTo-Json

Write-Host "`n2. Criando novo usuário (Gerente)..."
try {
    $newUser = Invoke-RestMethod -Uri $createUrl -Method Post -Headers $headers -Body $createBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Sucesso! Usuário criado com ID: $($newUser.id)" -ForegroundColor Green
    $newUserId = $newUser.id
} catch {
    Write-Host "   FALHA AO CRIAR USUÁRIO: $($_.Exception.Message)" -ForegroundColor Red
    # Pode falhar se já existir, mas usamos random no email
}

# 3. Listar Usuários
$listUrl = "http://localhost:3000/api/usuarios"
Write-Host "`n3. Listando todos os usuários..."
try {
    $users = Invoke-RestMethod -Uri $listUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "   Sucesso! Total de usuários encontrados: $($users.Count)" -ForegroundColor Green
    $users | Format-Table id, nome, email, perfil, ativo -AutoSize
} catch {
    Write-Host "   FALHA AO LISTAR USUÁRIOS: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Deletar o Usuário Criado
if ($newUserId) {
    $deleteUrl = "http://localhost:3000/api/usuarios/$newUserId"
    Write-Host "`n4. Deletando o usuário criado (ID: $newUserId)..."
    try {
        Invoke-RestMethod -Uri $deleteUrl -Method Delete -Headers $headers -ErrorAction Stop
        Write-Host "   Sucesso! Usuário deletado." -ForegroundColor Green
    } catch {
        Write-Host "   FALHA AO DELETAR USUÁRIO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n--- Fim da Verificação ---" -ForegroundColor Cyan
