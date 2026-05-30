const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const elementos = {
  musica: $("#musica"),
  intro: $("#intro"),
  popup: $("#popup"),
  tituloPopup: $("#tituloPopup"),
  textoPopup: $("#textoPopup"),
  btnStart: $("#btnStart"),
  btnClose: $("#btnClose"),
  bgVideo: $("#bg-video"),
};

const CONFIG = {
  velocidadeDigitacao: 16,
  volumeIntro: 0.35,
  volumePopup: 1,
  formatosAudio: [".mp3", ".mpeg", ".wav", ".ogg", ".aac", ".m4a", ".webm"],
};

// Preencha os campos abaixo quando quiser adicionar os textos e músicas.
// Para usar áudio, coloque o nome do arquivo sem extensão, exemplo: audio: "audio1".
const conteudos = {
  foto1: { titulo: "", texto: "", audio: "" },
  foto2: { titulo: "", texto: "", audio: "" },
  foto3: { titulo: "", texto: "", audio: "" },
  foto4: { titulo: "", texto: "", audio: "" },
  foto5: { titulo: "", texto: "", audio: "" },
  foto6: { titulo: "", texto: "", audio: "" },
  foto7: { titulo: "", texto: "", audio: "" },
  skill1: { titulo: "", texto: "" },
  skill2: { titulo: "", texto: "" },
  skill3: { titulo: "", texto: "" },
  skill4: { titulo: "", texto: "" },
  skill5: { titulo: "", texto: "" },
  skill6: { titulo: "", texto: "" },
};

let intervaloDigitacao = null;
let fadeAudio = null;

function iniciarSite() {
  const audioInicial = ""; // Exemplo: "audio1"

  if (audioInicial) tocarAudio(audioInicial, CONFIG.volumeIntro);

  elementos.intro.style.opacity = "0";
  elementos.intro.style.pointerEvents = "none";

  setTimeout(() => {
    elementos.intro.style.display = "none";
  }, 1200);
}

function abrirPopup(item) {
  if (!item) return;

  elementos.tituloPopup.textContent = item.titulo || "";
  elementos.textoPopup.textContent = "";
  elementos.popup.style.display = "flex";
  elementos.popup.style.opacity = "1";
  elementos.popup.setAttribute("aria-hidden", "false");

  digitarTexto(item.texto || "", elementos.textoPopup, CONFIG.velocidadeDigitacao);

  if (item.audio) tocarAudio(item.audio, CONFIG.volumePopup);
}

function fecharPopup() {
  elementos.popup.style.opacity = "0";

  setTimeout(() => {
    elementos.popup.style.display = "none";
    elementos.popup.style.opacity = "1";
    elementos.popup.setAttribute("aria-hidden", "true");
  }, 300);
}

function digitarTexto(texto, elemento, velocidade) {
  clearInterval(intervaloDigitacao);

  if (!texto) {
    elemento.textContent = "";
    return;
  }

  let i = 0;
  intervaloDigitacao = setInterval(() => {
    elemento.textContent = texto.slice(0, i + 1);
    i += 1;

    if (i >= texto.length) {
      clearInterval(intervaloDigitacao);
      intervaloDigitacao = null;
    }
  }, velocidade);
}

function tocarAudio(nomeBase, volumeFinal = 1) {
  const audio = elementos.musica;
  if (!audio || !nomeBase) return;

  clearInterval(fadeAudio);
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 0;

  testarAudio(nomeBase, 0, volumeFinal);
}

function testarAudio(nomeBase, index, volumeFinal) {
  const audio = elementos.musica;
  const temExtensao = /\.[a-z0-9]+$/i.test(nomeBase);
  const arquivo = temExtensao ? nomeBase : nomeBase + CONFIG.formatosAudio[index];

  if (!arquivo) return;

  if (!temExtensao && index >= CONFIG.formatosAudio.length) {
    console.warn("Nenhum áudio encontrado para:", nomeBase);
    return;
  }

  audio.src = arquivo;
  audio.load();
  audio.play()
    .then(() => fadeVolume(volumeFinal))
    .catch(() => {
      if (!temExtensao) testarAudio(nomeBase, index + 1, volumeFinal);
      else console.warn("Não foi possível tocar:", arquivo);
    });
}

function fadeVolume(volumeFinal) {
  const audio = elementos.musica;
  let volume = 0;

  clearInterval(fadeAudio);
  fadeAudio = setInterval(() => {
    volume = Math.min(volume + 0.05, volumeFinal);
    audio.volume = volume;

    if (volume >= volumeFinal) clearInterval(fadeAudio);
  }, 100);
}

function prepararAnimacoes() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  $$("section").forEach((section) => observer.observe(section));
}

function otimizarMobile() {
  if (window.innerWidth < 768 && elementos.bgVideo) {
    elementos.bgVideo.pause();
    elementos.bgVideo.style.display = "none";
  }
}

function configurarEventos() {
  elementos.btnStart?.addEventListener("click", iniciarSite);
  elementos.btnClose?.addEventListener("click", fecharPopup);

  $$(".foto-click, .skill-card").forEach((elemento) => {
    elemento.addEventListener("click", () => abrirPopup(conteudos[elemento.dataset.id]));
  });

  window.addEventListener("click", (event) => {
    if (event.target === elementos.popup) fecharPopup();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") fecharPopup();
  });
}

configurarEventos();
prepararAnimacoes();
otimizarMobile();
