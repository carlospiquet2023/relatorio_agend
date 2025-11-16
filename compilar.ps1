# TaskFlow - Script para Compilar App
# Execute com: .\compilar.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TaskFlow - Compilador Desktop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Escolha o tipo de compilação:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Instalador completo (64 bits) - Recomendado" -ForegroundColor White
Write-Host "2. Versão portátil (não precisa instalar)" -ForegroundColor White
Write-Host "3. Todas as versões (64 e 32 bits)" -ForegroundColor White
Write-Host ""

$opcao = Read-Host "Digite o número da opção"

Write-Host ""
Write-Host "Compilando... (pode levar alguns minutos)" -ForegroundColor Yellow
Write-Host ""

switch ($opcao) {
    "1" {
        npm run build:win
    }
    "2" {
        npm run build
    }
    "3" {
        npm run build:all
    }
    default {
        Write-Host "Opção inválida!" -ForegroundColor Red
        exit
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ Compilação Concluída!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Arquivos criados na pasta 'dist/'" -ForegroundColor Cyan
    Write-Host ""
    
    # Listar arquivos criados
    if (Test-Path "dist") {
        Get-ChildItem "dist" -Filter "*.exe" | ForEach-Object {
            Write-Host "  📦 $($_.Name)" -ForegroundColor White
        }
    }
    
    Write-Host ""
    $resposta = Read-Host "Deseja abrir a pasta dist? (S/N)"
    
    if ($resposta -eq 'S' -or $resposta -eq 's') {
        explorer dist
    }
} else {
    Write-Host ""
    Write-Host "❌ Erro na compilação!" -ForegroundColor Red
}
