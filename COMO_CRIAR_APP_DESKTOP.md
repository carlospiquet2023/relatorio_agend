# 🖥️ Como Transformar TaskFlow em App Desktop para Windows

## 📋 Pré-requisitos

Você precisa ter instalado:
- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **npm** (vem junto com Node.js)

## 🚀 Instalação

### 1️⃣ Abra o PowerShell na pasta do projeto

```powershell
cd c:\Users\pique\Desktop\organize
```

### 2️⃣ Instale as dependências

```powershell
npm install
```

Isso vai instalar:
- Electron (framework para criar apps desktop)
- Electron Builder (para criar instaladores)

## ▶️ Executar o App (Modo Desenvolvimento)

Para testar o app sem instalar:

```powershell
npm start
```

Isso abrirá o TaskFlow como um aplicativo desktop!

## 📦 Criar Instalador do Windows

### Opção 1: Instalador Completo (recomendado)

```powershell
npm run build:win
```

Cria um instalador `.exe` em `dist/` que:
- ✅ Instala o app
- ✅ Cria ícone na área de trabalho
- ✅ Adiciona ao Menu Iniciar
- ✅ Permite desinstalar normalmente

### Opção 2: Versão Portátil (não precisa instalar)

```powershell
npm run build
```

Cria um arquivo `.exe` portátil que você pode executar direto, sem instalação.

### Opção 3: Todas as versões

```powershell
npm run build:all
```

Cria:
- Instalador 64 bits
- Instalador 32 bits
- Versão portátil

## 📁 Onde Encontrar os Arquivos

Após a compilação, os arquivos estarão em:

```
organize/
└── dist/
    ├── TaskFlow-Setup-2.0.0.exe     ← Instalador completo
    └── TaskFlow-Portable-2.0.0.exe  ← Versão portátil
```

## 🎨 Criar Ícone Personalizado

### 1. Crie um ícone `.ico`

Você pode usar:
- [ICO Convert](https://icoconvert.com/) - Converte PNG para ICO
- [GIMP](https://www.gimp.org/) - Editor gratuito

**Requisitos do ícone:**
- Formato: `.ico`
- Tamanhos incluídos: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
- Nome: `icon.ico`

### 2. Coloque o ícone na pasta

```
organize/
└── assets/
    ├── icon.ico  ← Ícone do Windows
    └── icon.png  ← Ícone PNG (opcional)
```

### 3. Recompile o app

```powershell
npm run build:win
```

## ✨ Recursos do App Desktop

### 🔔 Notificações Nativas
- Notificações do Windows (não precisa permissão do navegador)
- Som e alerta visual integrados

### ⌨️ Atalhos de Teclado
- `Ctrl+N` - Nova tarefa
- `Ctrl+E` - Exportar relatório
- `Ctrl+B` - Fazer backup
- `Ctrl+K` - Abrir caderno
- `Ctrl+T` - Alternar tema
- `Ctrl+Q` - Sair
- `F11` - Tela cheia
- `F12` - DevTools (debug)

### 📊 Ícone na Bandeja
- Minimiza para a bandeja do sistema
- Menu de contexto com ações rápidas
- Badge com contagem de tarefas pendentes

### 💾 Armazenamento Local
- Dados salvos no computador
- Funciona offline
- Backup automático

## 🎯 Distribuir o App

### Para Usuários Finais

1. **Instalador Completo** (`TaskFlow-Setup-2.0.0.exe`)
   - Envie este arquivo para quem vai usar
   - Duplo clique para instalar
   - Aparece no Menu Iniciar e Área de Trabalho

2. **Versão Portátil** (`TaskFlow-Portable-2.0.0.exe`)
   - Pode rodar de um pendrive
   - Não precisa instalação
   - Ideal para usar em qualquer PC

### Compartilhar Online

Você pode hospedar em:
- GitHub Releases
- Google Drive
- Dropbox
- OneDrive

## 🔧 Personalização

### Mudar Nome do App

Edite `package.json`:

```json
{
  "name": "taskflow",
  "productName": "Meu TaskFlow Personalizado",
  "description": "Minha descrição"
}
```

### Mudar Configurações do Instalador

Edite a seção `build` em `package.json`:

```json
"nsis": {
  "shortcutName": "TaskFlow Pro",
  "language": "2070"
}
```

### Adicionar Auto-Iniciar com Windows

Em `electron-main.js`, adicione:

```javascript
app.setLoginItemSettings({
  openAtLogin: true
});
```

## 🐛 Solução de Problemas

### "npm não é reconhecido"
- Instale o Node.js: https://nodejs.org/

### "Erro ao compilar"
- Execute: `npm install` novamente
- Verifique se tem espaço em disco

### "Ícone não aparece"
- Certifique-se que `assets/icon.ico` existe
- Formato correto: `.ico` com múltiplos tamanhos

### "App não abre após instalar"
- Desinstale e reinstale
- Execute como administrador

## 📱 Próximos Passos

Depois de criar o app, você pode:

1. ✅ Criar assinatura digital (certificado de código)
2. ✅ Publicar na Microsoft Store
3. ✅ Adicionar auto-atualização
4. ✅ Criar versão para macOS e Linux

## 📞 Suporte

Problemas? Abra uma issue no GitHub:
https://github.com/carlospiquet2023/relatorio_agend/issues

---

**Desenvolvido por:** Carlos Antonio de Oliveira Piquet  
**Versão:** 2.0.0  
**Licença:** Consulte LICENSE
