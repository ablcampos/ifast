// ==========================================
// APLICATIVO MPX MOBILE - PWA LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const startTime = Date.now();
  const MIN_SPLASH_TIME = 1500; // Tempo mínimo de 1.5 segundos na tela de Splash

  // Elementos DOM
  const splashScreen = document.getElementById('splashScreen');
  const btnPower = document.getElementById('btnPower');
  const btnGear = document.getElementById('btnGear');
  const loginForm = document.getElementById('loginForm');
  const inputName = document.getElementById('inputName');
  const inputPassword = document.getElementById('inputPassword');
  const checkRemember = document.getElementById('checkRemember');
  const settingsModal = document.getElementById('settingsModal');
  const btnCloseModal = document.getElementById('btnCloseModal');

  // 1. GERENCIAMENTO DA TELA DE SPLASH (MÍNIMO 1.5 SEGUNDOS)
  function hideSplashScreen() {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, MIN_SPLASH_TIME - elapsedTime);

    setTimeout(() => {
      if (splashScreen) {
        splashScreen.classList.add('hidden');
        console.log(`[MPX] Splash screen encerrada após ${(Date.now() - startTime)}ms.`);
      }
    }, remainingTime);
  }

  // Oculta a splash após o carregamento ou após 1.5s
  window.addEventListener('load', hideSplashScreen);
  // Fallback de segurança se o load demorar
  setTimeout(hideSplashScreen, 2500);

  // 2. RECUPERAÇÃO DO NOME E SENHA SALVOS ("Sempre Lembrar Este Usuário")
  const savedUser = localStorage.getItem('mpx_remembered_username');
  const savedPass = localStorage.getItem('mpx_remembered_password');

  if (savedUser || savedPass) {
    if (savedUser) inputName.value = savedUser;
    if (savedPass) inputPassword.value = savedPass;
    checkRemember.checked = true;
  }

  // 3. TENTATIVA DE TELA CHEIA (FULLSCREEN PERSISTENTE)
  function requestFullscreenMode() {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  // Para garantir que o Android volte para tela cheia se a barra aparecer,
  // nós forçamos o Fullscreen a cada interação (clique ou toque) do usuário.
  window.addEventListener('click', requestFullscreenMode);
  window.addEventListener('touchend', requestFullscreenMode);

  // Detecta sistema operacional e modo de exibição
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

  const pwaInstallBanner = document.getElementById('pwaInstallBanner');
  const pwaBannerText = document.getElementById('pwaBannerText');
  const btnClosePwaBanner = document.getElementById('btnClosePwaBanner');

  if (!isStandalone && pwaInstallBanner && pwaBannerText) {
    if (isIOS) {
      pwaBannerText.innerHTML = `
        <strong>📲 Abrir em Tela Cheia no iPhone:</strong><br>
        Toque em <strong>Compartilhar</strong> <svg class="ios-share-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z"/></svg> e selecione <strong>"Adicionar à Tela de Início"</strong> ➕
      `;
    } else if (isAndroid) {
      pwaBannerText.innerHTML = `
        <strong>📲 Abrir em Tela Cheia no Android:</strong><br>
        Toque no <strong>Menu (⋮)</strong> do Chrome e selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.
      `;
    }

    // Exibe o aviso inteligente no celular se aberto pelo navegador comum
    if (isIOS || isAndroid) {
      setTimeout(() => {
        pwaInstallBanner.classList.remove('hidden');
      }, 1500);
    }

    if (btnClosePwaBanner) {
      btnClosePwaBanner.addEventListener('click', () => {
        pwaInstallBanner.classList.add('hidden');
      });
    }
  }

  // 4. ROLAGEM INTELIGENTE AO FOCAR NO TECLADO VIRTUAL DO CELULAR
  const inputs = [inputName, inputPassword];
  inputs.forEach((input) => {
    input.addEventListener('focus', () => {
      setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  });

  // 5. AÇÃO DO BOTÃO DESLIGAR (FECHAR APLICAÇÃO)
  btnPower.addEventListener('click', () => {
    const confirmClose = confirm('Deseja fechar e encerrar a aplicação MPX?');
    if (confirmClose) {
      console.log('[MPX] Encerrando aplicação...');
      
      // Tenta fechar a janela no navegador / PWA
      try {
        window.close();
      } catch (e) {
        console.log('window.close() bloqueado pelo navegador');
      }

      // Se a janela não fechar (restrição de segurança do navegador), oculta o app e exibe mensagem
      document.body.innerHTML = `
        <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#1e293b; color:white; font-family:sans-serif; text-align:center; padding:20px;">
          <h2 style="margin-bottom:12px;">Aplicação Encerrada</h2>
          <p style="color:#94a3b8; margin-bottom:20px;">Você pode fechar esta aba ou janela com segurança.</p>
          <button onclick="window.location.reload()" style="background:#1d4ed8; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">
            Reiniciar Aplicativo
          </button>
        </div>
      `;
    }
  });

  // 6. AÇÃO DO BOTÃO ENGRENAGEM (CONFIGURAÇÕES)
  btnGear.addEventListener('click', () => {
    if (settingsModal) {
      settingsModal.classList.add('active');
    }
  });

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      settingsModal.classList.remove('active');
    });
  }

  // 6.5 MODAL DE MENSAGENS CUSTOMIZADO (Substitui o alert nativo para não quebrar a tela cheia)
  const messageModal = document.getElementById('messageModal');
  const messageModalBody = document.getElementById('messageModalBody');
  const btnCloseMessageModal = document.getElementById('btnCloseMessageModal');

  function showCustomAlert(message) {
    if (messageModal && messageModalBody) {
      messageModalBody.textContent = message;
      messageModal.classList.add('active');
    } else {
      alert(message);
    }
  }

  if (btnCloseMessageModal) {
    btnCloseMessageModal.addEventListener('click', () => {
      messageModal.classList.remove('active');
    });
  }

  // 7. ENVIO DO FORMULÁRIO DE LOGIN (GUARDA NOME + SENHA E EXIBE O QUE FOI DIGITADO)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = inputName.value.trim();
    const password = inputPassword.value.trim();

    if (!username || !password) {
      showCustomAlert('Por favor, preencha o Nome e a Senha para entrar.');
      return;
    }

    // Se o checkbox estiver marcado, guarda o Nome e a Senha no localStorage
    if (checkRemember.checked) {
      localStorage.setItem('mpx_remembered_username', username);
      localStorage.setItem('mpx_remembered_password', password);
    } else {
      localStorage.removeItem('mpx_remembered_username');
      localStorage.removeItem('mpx_remembered_password');
    }

    // Exibe em tela exatamente o que foi digitado sem quebrar a tela cheia
    showCustomAlert(`📋 DADOS DE LOGIN DIGITADOS:\n\n👤 Nome: ${username}\n🔑 Senha: ${password}\n\n💾 Lembrar Dados: ${checkRemember.checked ? 'SIM (Salvo no aparelho)' : 'NÃO'}`);
  });

  // 8. REGISTRO DO SERVICE WORKER (PWA) E AVISO DE ATUALIZAÇÃO
  if ('serviceWorker' in navigator) {
    // Verifica se já existe um Service Worker controlando a página (não é a 1ª instalação)
    const isFirstInstall = !navigator.serviceWorker.controller;
    let refreshing = false;

    // Detecta quando um novo Service Worker assume o controle (nova versão instalada)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!isFirstInstall && !refreshing) {
        refreshing = true;
        const updateModal = document.getElementById('updateModal');
        const btnReloadApp = document.getElementById('btnReloadApp');
        const btnCancelUpdate = document.getElementById('btnCancelUpdate');

        if (updateModal) {
          updateModal.classList.add('active');

          if (btnReloadApp) {
            btnReloadApp.addEventListener('click', () => {
              window.location.reload();
            });
          }
          if (btnCancelUpdate) {
            btnCancelUpdate.addEventListener('click', () => {
              updateModal.classList.remove('active');
              // Se o usuário cancelar, a página não recarrega, mas a próxima vez que ele abrir o app,
              // já estará na nova versão pois o novo Service Worker já assumiu.
            });
          }
        }
      }
    });

    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('✅ [PWA] Service Worker registrado no escopo:', reg.scope))
      .catch((err) => console.error('❌ [PWA] Falha ao registrar Service Worker:', err));
  }
});
