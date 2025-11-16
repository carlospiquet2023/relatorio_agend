# TaskFlow - Script de Instalação Automática
# Execute com: .\instalar.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TaskFlow - Instalador Desktop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale o Node.js:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit
}

# Verificar se npm está instalado
Write-Host "2. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm não encontrado!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "3. Instalando dependências..." -ForegroundColor Yellow
Write-Host "   (Isso pode levar alguns minutos)" -ForegroundColor Gray

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependências instaladas!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao instalar dependências" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ Instalação Concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "▶️  Executar app (teste):" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "📦 Criar instalador:" -ForegroundColor Yellow
Write-Host "   npm run build:win" -ForegroundColor White
Write-Host ""
Write-Host "O instalador ficará em: dist/TaskFlow-Setup-2.0.0.exe" -ForegroundColor Gray
Write-Host ""

$resposta = Read-Host "Deseja executar o app agora? (S/N)"

if ($resposta -eq 'S' -or $resposta -eq 's') {
    Write-Host ""
    Write-Host "Iniciando TaskFlow..." -ForegroundColor Cyan
    npm start
}
