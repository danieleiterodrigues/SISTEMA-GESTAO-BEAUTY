<#
.SYNOPSIS
    Script de Verificação Manual da Autenticação (Sprint 2)
.DESCRIPTION
    Este script testa os endpoints de login e registro, e verifica o acesso a rotas protegidas.
    Requer 'curl' instalado ou pode ser adaptado para Invoke-RestMethod.
    Usaremos Invoke-RestMethod (nativo do PowerShell) para facilitar.
#>

$baseUrl = "http://localhost:3000/api"

Write-Host "--- Iniciando Verificação de Autenticação ---" -ForegroundColor Cyan

# 1. Registrar Usuário Admin
$registerUrl = "$baseUrl/auth/register"
$registerBody = @{
    nome = "Admin Teste"
    email = "admin@teste.com"
    senha = "senha123456"
    perfil = "admin"
} | ConvertTo-Json

Write-Host "`n1. Tentando Registrar Usuário Admin..."
try {
    $response = Invoke-RestMethod -Uri $registerUrl -Method Post -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Sucesso! Usuário criado com ID: $($response.id)" -ForegroundColor Green
} catch {
    # Se falhar (ex: email já existe), tentamos logar
    Write-Host "   Falha ou usuário já existe. Detalhes: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Login
$loginUrl = "$baseUrl/auth/login"
$loginBody = @{
    email = "admin@teste.com"
    senha = "senha123456"
} | ConvertTo-Json

Write-Host "`n2. Tentando Login..."
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $loginResponse.access_token
    Write-Host "   Login realizado com Sucesso!" -ForegroundColor Green
    Write-Host "   Token JWT recebido (primeiros 10 chars): $($token.Substring(0,10))..."
} catch {
    Write-Host "   ERRO NO LOGIN: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. Acessar Rota Protegida (Profile)
$profileUrl = "$baseUrl/auth/profile"
$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "`n3. Testando Acesso a Rota Protegida (/auth/profile)..."
try {
    $profile = Invoke-RestMethod -Uri $profileUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "   Sucesso! Perfil do usuário logado:" -ForegroundColor Green
    Write-Host "   Nome: $($profile.nome)"
    Write-Host "   Email: $($profile.email)"
    Write-Host "   Perfil: $($profile.perfil)"
} catch {
    Write-Host "   ERRO AO ACESSAR ROTA PROTEGIDA: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- Fim da Verificação ---" -ForegroundColor Cyan
