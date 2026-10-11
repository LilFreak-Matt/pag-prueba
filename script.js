const body = document.body;
const root = document.documentElement;

const selectFuente = document.getElementById('selectFuente');
const inputColor = document.getElementById('inputColor');
const inputFondoUrl = document.getElementById('inputFondoUrl');
const btnRestablecer = document.getElementById('btnRestablecer');
const btnIdioma = document.getElementById('btnIdioma');

const valoresPorDefecto = {
    fuente: 'Tahoma, Verdana, Geneva, sans-serif',
    color: '#ebeae4',
    idioma: 'es'
};
const clavesPreferencias = ['miFuente', 'miColor', 'miFondoUrl', 'miIdioma'];
const fuentesPermitidas = selectFuente
    ? new Set(Array.from(selectFuente.options, option => option.value))
    : new Set();

function leerPreferencia(clave) {
    try {
        return localStorage.getItem(clave);
    } catch (error) {
        console.error(`No se pudo leer la preferencia "${clave}".`, error);
        return null;
    }
}

function guardarPreferencia(clave, valor) {
    try {
        localStorage.setItem(clave, valor);
    } catch (error) {
        console.error(`No se pudo guardar la preferencia "${clave}".`, error);
    }
}

function eliminarPreferencias() {
    try {
        clavesPreferencias.forEach(clave => localStorage.removeItem(clave));
    } catch (error) {
        console.error('No se pudieron eliminar las preferencias del portafolio.', error);
    }
}

function obtenerUrlImagen(valor) {
    if (!valor.trim()) {
        return null;
    }

    try {
        const url = new URL(valor.trim(), document.baseURI);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
    } catch {
        return null;
    }
}

function aplicarImagenFondo(url) {
    if (url) {
        body.style.backgroundImage = `url(${JSON.stringify(url.href)})`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundRepeat = 'no-repeat';
        return;
    }

    body.style.removeProperty('background-image');
    body.style.removeProperty('background-size');
    body.style.removeProperty('background-position');
    body.style.removeProperty('background-repeat');
}

function aplicarIdioma(idioma) {
    const idiomaAplicado = idioma === 'en' ? 'en' : 'es';
    document.documentElement.lang = idiomaAplicado;

    document.querySelectorAll('[data-es][data-en]').forEach(elemento => {
        elemento.textContent = elemento.getAttribute(`data-${idiomaAplicado}`) || '';
    });
}

const fuenteGuardada = leerPreferencia('miFuente');
if (fuenteGuardada && fuentesPermitidas.has(fuenteGuardada)) {
    root.style.setProperty('--fuente-dinamica', fuenteGuardada);
    if (selectFuente) selectFuente.value = fuenteGuardada;
}

const colorGuardado = leerPreferencia('miColor');
if (colorGuardado && /^#[0-9a-f]{6}$/i.test(colorGuardado)) {
    body.style.backgroundColor = colorGuardado;
    if (inputColor) inputColor.value = colorGuardado;
}

const fondoGuardado = leerPreferencia('miFondoUrl');
if (fondoGuardado) {
    const urlGuardada = obtenerUrlImagen(fondoGuardado);
    if (urlGuardada) {
        aplicarImagenFondo(urlGuardada);
        if (inputFondoUrl) inputFondoUrl.value = urlGuardada.href;
    } else {
        console.warn('Se ignoró una URL de fondo guardada que no es HTTP o HTTPS.');
    }
}

if (btnIdioma) {
    aplicarIdioma(leerPreferencia('miIdioma') || valoresPorDefecto.idioma);
}

if (btnIdioma) {
    btnIdioma.addEventListener('click', () => {
        const idiomaActual = document.documentElement.lang;
        const nuevoIdioma = idiomaActual === 'es' ? 'en' : 'es';
        guardarPreferencia('miIdioma', nuevoIdioma);
        aplicarIdioma(nuevoIdioma);
    });
}

if (selectFuente) {
    selectFuente.addEventListener('change', () => {
        const fuente = selectFuente.value;
        if (!fuentesPermitidas.has(fuente)) {
            return;
        }

        root.style.setProperty('--fuente-dinamica', fuente);
        guardarPreferencia('miFuente', fuente);
    });
}

if (inputColor) {
    inputColor.addEventListener('input', () => {
        const color = inputColor.value;
        if (!/^#[0-9a-f]{6}$/i.test(color)) {
            return;
        }

        body.style.backgroundColor = color;
        guardarPreferencia('miColor', color);
    });
}

if (inputFondoUrl) {
    inputFondoUrl.addEventListener('input', () => {
        const valor = inputFondoUrl.value.trim();
        const url = obtenerUrlImagen(valor);
        inputFondoUrl.setCustomValidity(valor && !url ? 'Introduce una URL HTTP o HTTPS válida.' : '');
        inputFondoUrl.setAttribute('aria-invalid', String(Boolean(valor && !url)));

        if (valor && !url) {
            return;
        }

        aplicarImagenFondo(url);
        if (url) {
            guardarPreferencia('miFondoUrl', url.href);
        } else {
            guardarPreferencia('miFondoUrl', '');
        }
    });
}

if (btnRestablecer) {
    btnRestablecer.addEventListener('click', () => {
        eliminarPreferencias();

        root.style.setProperty('--fuente-dinamica', valoresPorDefecto.fuente);
        body.style.backgroundColor = valoresPorDefecto.color;
        aplicarImagenFondo(null);

        if (selectFuente) selectFuente.value = valoresPorDefecto.fuente;
        if (inputColor) inputColor.value = valoresPorDefecto.color;
        if (inputFondoUrl) {
            inputFondoUrl.value = '';
            inputFondoUrl.setCustomValidity('');
            inputFondoUrl.setAttribute('aria-invalid', 'false');
        }

        if (btnIdioma) {
            aplicarIdioma(valoresPorDefecto.idioma);
        }
    });
}

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.documentElement.classList.add('reveal-enabled');
    document.querySelectorAll('[data-reveal], [data-reveal-item]').forEach(element => {
        revealObserver.observe(element);
    });
}
