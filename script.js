/* ==========================================================================
   1. PESQUISA DE NOTÍCIAS/RESPOSTAS EM TEMPO REAL NA INTERNET (SEM RESPOSTAS PRONTAS)
   ========================================================================== */
const campoPergunta = document.getElementById('campo-pergunta');
const btnPerguntar = document.getElementById('btn-perguntar');
const loader = document.getElementById('loader');
const caixaResultado = document.getElementById('caixa-resultado');
const textoResultado = document.getElementById('texto-resultado');
const areaFonte = document.getElementById('area-fonte');
const tituloNoticia = document.getElementById('titulo-noticia');
const linkNoticia = document.getElementById('link-noticia');
const btnVoz = document.getElementById('btn-voz');
const btnPararVoz = document.getElementById('btn-parar-voz');
const chipsSugestao = document.querySelectorAll('.chip-sugestao');

btnPerguntar.addEventListener('click', buscarNaInternet);
campoPergunta.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscarNaInternet();
});

chipsSugestao.forEach(chip => {
    chip.addEventListener('click', () => {
        campoPergunta.value = chip.getAttribute('data-query');
        buscarNaInternet();
    });
});

async function buscarNaInternet() {
    const termo = campoPergunta.value.trim();
    if (!termo) return;

    pararVoz();

    caixaResultado.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        // Consulta em API pública Web (DuckDuckGo Instant Answer API / Wikipedia)
        const queryF1 = termo.toLowerCase().includes('f1') || termo.toLowerCase().includes('fórmula 1') ? termo : `${termo} Formula 1`;
        const urlAPI = `https://api.duckduckgo.com/?q=${encodeURIComponent(queryF1)}&format=json&no_html=1&skip_disambig=1`;

        const resposta = await fetch(urlAPI);
        const data = await resposta.json();

        let textoResposta = "";
        let linkFonte = "";
        let tituloFonte = "";

        if (data.AbstractText) {
            textoResposta = data.AbstractText;
            linkFonte = data.AbstractURL;
            tituloFonte = data.Heading || "Ver Notícia / Fonte Completa";
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0 && data.RelatedTopics[0].Text) {
            textoResposta = data.RelatedTopics[0].Text;
            linkFonte = data.RelatedTopics[0].FirstURL || `https://www.google.com/search?q=${encodeURIComponent(queryF1)}`;
            tituloFonte = "Ver Notícia Completa no Google/Notícias";
        } else {
            // Caso a API direta não tenha resumo automático, redireciona para a pesquisa ao vivo de notícias
            textoResposta = `Não foi encontrado um resumo automático direto para "${termo}". Você pode acessar a cobertura completa da notícia e matérias atualizadas diretamente na fonte.`;
            linkFonte = `https://www.google.com/search?q=${encodeURIComponent(queryF1)}&tbm=nws`;
            tituloFonte = `Clique para ver todas as notícias ao vivo sobre "${termo}"`;
        }

        exibirResultado(textoResposta, tituloFonte, linkFonte);

    } catch (erro) {
        // Fallback para pesquisa direta de notícias se a conexão falhar
        const queryF1 = `${termo} Formula 1 notícias`;
        exibirResultado(
            `Resultados para "${termo}": Acesse a cobertura jornalística completa das corridas e novidades da F1 diretamente no link abaixo.`,
            `Abrir pesquisas e notícias recentes sobre ${termo}`,
            `https://www.google.com/search?q=${encodeURIComponent(queryF1)}&tbm=nws`
        );
    } finally {
        loader.classList.add('hidden');
    }
}

function exibirResultado(texto, noticiaTitulo, noticiaLink) {
    textoResultado.textContent = texto;
    
    if (noticiaTitulo && noticiaLink) {
        areaFonte.classList.remove('hidden');
        tituloNoticia.textContent = noticiaTitulo;
        linkNoticia.href = noticiaLink;
    } else {
        areaFonte.classList.add('hidden');
    }

    caixaResultado.classList.remove('hidden');
}

/* ==========================================================================
   2. LEITOR DE VOZ IA (SÍNTESE DE VOZ)
   ========================================================================== */
let synth = window.speechSynthesis;
let utterance = null;

btnVoz.addEventListener('click', () => {
    if (!synth) {
        alert("Seu navegador não possui suporte a leitura por voz.");
        return;
    }

    pararVoz();

    const textoParaLer = textoResultado.textContent;
    utterance = new SpeechSynthesisUtterance(textoParaLer);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;

    utterance.onstart = () => {
        btnVoz.classList.add('hidden');
        btnPararVoz.classList.remove('hidden');
    };

    utterance.onend = () => {
        btnVoz.classList.remove('hidden');
        btnPararVoz.classList.add('hidden');
    };

    synth.speak(utterance);
});

btnPararVoz.addEventListener('click', pararVoz);

function pararVoz() {
    if (synth && synth.speaking) {
        synth.cancel();
    }
    btnVoz.classList.remove('hidden');
    btnPararVoz.classList.add('hidden');
}

/* ==========================================================================
   3. AMBIENTE 3D AVANÇADO (PISTA EM S, ZEBRAS, CARROS DETALHADOS E PARTÍCULAS DE RASTRO)
   ========================================================================== */
function init3D() {
    const canvas = document.getElementById('f1-canvas');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.012);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xe10600, 3, 80);
    redLight.position.set(0, 15, 0);
    scene.add(redLight);

    // CRIAÇÃO DA PISTA 3D COMPLEXA (Curva em formato de 8 / Circuito)
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-30, 0, -15),
        new THREE.Vector3(-15, 0, -25),
        new THREE.Vector3(15, 0, -10),
        new THREE.Vector3(30, 0, 15),
        new THREE.Vector3(10, 0, 25),
        new THREE.Vector3(-20, 0, 10)
    ], true);

    const points = curve.getPoints(200);
    
    // Asfalto da Pista
    const trackGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const trackMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
    const trackLine = new THREE.Line(trackGeometry, trackMaterial);
    scene.add(trackLine);

    // Zebras em volta do circuito
    points.forEach((pt, index) => {
        if (index % 4 === 0) {
            const zebraGeo = new THREE.BoxGeometry(1.5, 0.1, 0.8);
            const zebraMat = new THREE.MeshBasicMaterial({ color: (index % 8 === 0) ? 0xe10600 : 0xffffff });
            const zebra = new THREE.Mesh(zebraGeo, zebraMat);
            zebra.position.set(pt.x + 1.5, 0.05, pt.z);
            scene.add(zebra);
        }
    });

    // SISTEMA DE PARTÍCULAS / RASTRO DE VELOCIDADE DOS CARROS
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for(let i=0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 80;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xe10600, size: 0.3, transparent: true, opacity: 0.6 });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // CARROS F1 DETALHADOS (Bico, Aerofólio e Rodas)
    function criarCarroF1Completo(corHex) {
        const grupo = new THREE.Group();

        // Chassi principal
        const corpoGeo = new THREE.BoxGeometry(1.2, 0.4, 3.2);
        const corpoMat = new THREE.MeshStandardMaterial({ color: corHex, metalness: 0.8, roughness: 0.2 });
        const corpo = new THREE.Mesh(corpoGeo, corpoMat);
        grupo.add(corpo);

        // Bico do Carro
        const bicoGeo = new THREE.ConeGeometry(0.5, 1.2, 4);
        bicoGeo.rotateX(Math.PI / 2);
        const bico = new THREE.Mesh(bicoGeo, corpoMat);
        bico.position.set(0, -0.05, 2.0);
        grupo.add(bico);

        // Asa Traseira 3D
        const asaGeo = new THREE.BoxGeometry(1.8, 0.5, 0.2);
        const asaMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const asa = new THREE.Mesh(asaGeo, asaMat);
        asa.position.set(0, 0.6, -1.4);
        grupo.add(asa);

        // Cockpit
        const cockpitGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.position.set(0, 0.3, 0.2);
        grupo.add(cockpit);

        // Rodas
        const rodaGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        rodaGeo.rotateZ(Math.PI / 2);
        const rodaMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

        const posRodas = [
            [-0.9, -0.1, 1.1],
            [0.9, -0.1, 1.1],
            [-0.9, -0.1, -1.1],
            [0.9, -0.1, -1.1]
        ];

        posRodas.forEach(p => {
            const r = new THREE.Mesh(rodaGeo, rodaMat);
            r.position.set(...p);
            grupo.add(r);
        });

        scene.add(grupo);
        return grupo;
    }

    const carro1 = criarCarroF1Completo(0xe10600); // Vermelho Ferrari
    const carro2 = criarCarroF1Completo(0xffffff); // Branco/Silver

    let pos1 = 0;
    let pos2 = 0.08;

    // Loop de Animação Continuo
    function animate() {
        requestAnimationFrame(animate);

        // Movimento no circuito em curva
        pos1 = (pos1 + 0.0025) % 1;
        const p1 = curve.getPointAt(pos1);
        const t1 = curve.getTangentAt(pos1);
        carro1.position.set(p1.x, 0.3, p1.z);
        carro1.rotation.y = Math.atan2(t1.x, t1.z);

        pos2 = (pos2 + 0.0023) % 1;
        const p2 = curve.getPointAt(pos2);
        const t2 = curve.getTangentAt(pos2);
        carro2.position.set(p2.x, 0.3, p2.z);
        carro2.rotation.y = Math.atan2(t2.x, t2.z);

        // Animar Partículas no Fundo
        const positions = particleSystem.geometry.attributes.position.array;
        for(let i = 1; i < particleCount * 3; i += 3) {
            positions[i] -= 0.1;
            if (positions[i] < -20) positions[i] = 20;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Rotação suave da câmera em torno da pista
        camera.position.x = Math.sin(Date.now() * 0.0002) * 45;
        camera.position.z = Math.cos(Date.now() * 0.0002) * 45;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

window.addEventListener('DOMContentLoaded', init3D);