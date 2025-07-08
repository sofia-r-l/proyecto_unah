// Funciones para el modal de la biblioteca (scope global)
window.abrirModalAgregar = function() {
    const modal = document.getElementById('modal-libro');
    const modalTitulo = document.getElementById('modal-titulo');
    const form = document.getElementById('form-libro');
    
    // Configurar el modal para agregar
    modalTitulo.textContent = 'Agregar Nuevo Libro';
    form.reset(); // Limpiar el formulario
    // Habilitar campo archivo
    form.archivo.disabled = false;
    // Mostrar/ocultar texto aclaratorio
    const archivoHelp = document.getElementById('archivo-help');
    if (archivoHelp) archivoHelp.style.display = 'block';
    const archivoEditHelp = document.getElementById('archivo-edit-help');
    if (archivoEditHelp) archivoEditHelp.style.display = 'none';
    // Limpiar chips de temas
    if (window.temasArray) {
        window.temasArray = [];
        if (window.updateTemasHidden) window.updateTemasHidden();
        if (window.renderChips) window.renderChips();
    }
    // Mostrar el modal
    modal.classList.remove('modal-oculto');
};

window.abrirModalEditar = function() {
    const modal = document.getElementById('modal-libro');
    const modalTitulo = document.getElementById('modal-titulo');
    const form = document.getElementById('form-libro');
    
    // Configurar el modal para editar
    modalTitulo.textContent = 'Editar Libro';
    
    // Aquí podrías cargar los datos del libro seleccionado desde el servidor
    // Por ahora usamos datos de ejemplo (sin el archivo)
    form.titulo.value = 'Título de Ejemplo';
    form.autor.value = 'Juan A. Pérez';
    
    // Cargar temas de ejemplo
    if (window.temasArray) {
        window.temasArray = ['Tema1', 'Tema2'];
        if (window.updateTemasHidden) window.updateTemasHidden();
        if (window.renderChips) window.renderChips();
    }
    
    // Mostrar el modal
    modal.classList.remove('modal-oculto');
};

window.cerrarModal = function() {
    const modal = document.getElementById('modal-libro');
    if (modal) {
        modal.classList.add('modal-oculto');
    }
};

window.eliminarLibro = function(idLibro) {
    if (confirm('¿Estás seguro de que deseas eliminar este libro?')) {
        // Enviar petición para eliminar el libro
        fetch('/src/services/biblioteca/eliminarLibro.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'id=' + encodeURIComponent(idLibro)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Libro eliminado exitosamente: ' + data.message);
                // Aquí podrías recargar la lista de libros
                console.log('Libro eliminado:', data.libro_eliminado);
            } else {
                alert('Error al eliminar el libro: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al comunicarse con el servidor');
        });
    }
};

window.probarServidor = function() {
    console.log('Probando conexión con el servidor...');
    fetch('/src/services/biblioteca/test.php')
        .then(response => {
            console.log('Respuesta de prueba:', response);
            return response.json();
        })
        .then(data => {
            console.log('Datos de prueba:', data);
            alert('Servidor funcionando: ' + data.message);
        })
        .catch(error => {
            console.error('Error en prueba:', error);
            alert('Error de conexión: ' + error.message);
        });
};

// Evento para cerrar el modal al hacer clic fuera de él
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal-libro');
    
    // Asegurar que el modal esté oculto al cargar la página
    if (modal) {
        modal.classList.add('modal-oculto');
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    }
    
    // Manejar el envío del formulario
    const formLibro = document.getElementById('form-libro');
    if (formLibro) {
        formLibro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener los datos del formulario
            const formData = new FormData(formLibro);
            const titulo = formData.get('titulo').trim();
            const autor = formData.get('autor').trim();
            const temas = formData.get('temas').trim();
            const archivo = formData.get('archivo');
            
            // Validar título
            if (titulo.length < 5 || titulo.length > 70) {
                alert('El título debe tener entre 5 y 70 caracteres.');
                return;
            }
            
            // Validar autor con validación paso a paso
            const palabras = autor.split(/\s+/);
            
            // Verificar que haya al menos 2 palabras (nombre y apellido)
            if (palabras.length < 2) {
                alert('El autor debe tener al menos un nombre y un apellido.');
                return;
            }
            
            // Validar cada palabra
            for (let palabra of palabras) {
                // Verificar que empiece con mayúscula
                if (!/^[A-ZÁÉÍÓÚÑ]/.test(palabra)) {
                    alert('Cada palabra debe empezar con mayúscula.');
                    return;
                }
                
                // Verificar que solo contenga letras y un punto al final (no en medio)
                if (!/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]*\.?$/.test(palabra)) {
                    alert('Las palabras solo pueden contener letras y un punto al final para iniciales.');
                    return;
                }
                
                // Verificar que no haya puntos en medio de la palabra
                if (palabra.includes('.') && !palabra.endsWith('.')) {
                    alert('Los puntos solo pueden estar al final de las palabras (ej: A. en lugar de Sofía.)');
                    return;
                }
                
                // Verificar que las iniciales (letras solas) tengan punto
                if (palabra.length === 1 && !palabra.endsWith('.')) {
                    alert('Las iniciales (letras solas) deben terminar con punto (ej: A. en lugar de A)');
                    return;
                }
            }
            
            // Validar temas con expresión regular
            const temasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+(\s*,\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)*$/;
            if (!temasRegex.test(temas)) {
                alert('Los temas deben contener solo letras y espacios, separados por comas.');
                return;
            }
            
            // Validar que se haya seleccionado un archivo
            if (!archivo || archivo.size === 0) {
                alert('Por favor, selecciona un archivo para subir.');
                return;
            }
            
            // Validar el tipo de archivo - solo PDF
            if (archivo.type !== 'application/pdf') {
                alert('Por favor, selecciona solo archivos PDF.');
                return;
            }
            
            // Validar también la extensión del archivo
            const extension = archivo.name.split('.').pop().toLowerCase();
            if (extension !== 'pdf') {
                alert('Por favor, selecciona solo archivos con extensión .pdf');
                return;
            }
            
            // Crear FormData para enviar al servidor
            const formDataToSend = new FormData();
            formDataToSend.append('titulo', titulo);
            formDataToSend.append('autor', autor);
            formDataToSend.append('temas', temas);
            formDataToSend.append('archivo', archivo);
            
            // Enviar datos al servidor
            console.log('Enviando datos al servidor...');
            fetch('/src/services/biblioteca/guardarLibro.php', {
                method: 'POST',
                body: formDataToSend
            })
            .then(async response => {
                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    throw new Error('Respuesta no es JSON: ' + await response.text());
                }
                if (!response.ok) {
                    // Mostrar el error detallado del backend
                    throw new Error(data.error || JSON.stringify(data));
                }
                return data;
            })
            .then(data => {
                alert('Libro guardado exitosamente: ' + data.message);
                console.log('Libro guardado:', data.libro);
                cerrarModal();
                cargarLibros();
            })
            .catch(error => {
                console.error('Error detallado:', error);
                alert('Error al guardar el libro: ' + error.message);
            });
        });
    }

    // --- Chips de Temas ---
    const chipsContainer = document.getElementById('temas-chips-container');
    const chipsInput = document.getElementById('temas-input');
    const temasHidden = document.getElementById('temas');
    window.temasArray = [];

    window.renderChips = function() {
        // Elimina todos los chips menos el input
        chipsContainer.querySelectorAll('.chip-tema').forEach(chip => chip.remove());
        window.temasArray.forEach((tema, idx) => {
            const chip = document.createElement('span');
            chip.className = 'chip-tema';
            chip.style.cssText = 'background:#e0e0e0; border-radius:16px; padding:2px 8px; display:inline-flex; align-items:center; margin-right:4px; margin-bottom:2px;';
            chip.textContent = tema;
            // Botón eliminar
            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.textContent = '×';
            closeBtn.style.cssText = 'background:none; border:none; color:#d90429; font-size:16px; margin-left:4px; cursor:pointer;';
            closeBtn.onclick = function() {
                window.temasArray.splice(idx, 1);
                window.updateTemasHidden();
                window.renderChips();
            };
            chip.appendChild(closeBtn);
            chipsContainer.insertBefore(chip, chipsInput);
        });
    };

    window.updateTemasHidden = function() {
        temasHidden.value = window.temasArray.join(', ');
    };

    function addTema(tema) {
        tema = tema.trim();
        if (tema && !window.temasArray.includes(tema)) {
            window.temasArray.push(tema);
            window.updateTemasHidden();
            window.renderChips();
        }
    }

    if (chipsInput && chipsContainer && temasHidden) {
        chipsInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
                e.preventDefault();
                const valor = chipsInput.value.replace(/,/g, '').trim();
                if (valor) {
                    addTema(valor);
                    chipsInput.value = '';
                }
            } else if (e.key === 'Backspace' && chipsInput.value === '') {
                // Eliminar el último tema si el input está vacío
                window.temasArray.pop();
                window.updateTemasHidden();
                window.renderChips();
            }
        });
    }

    // Inicializar si hay valor inicial (por ejemplo, al editar)
    if (temasHidden && temasHidden.value) {
        window.temasArray = temasHidden.value.split(',').map(t => t.trim()).filter(Boolean);
        window.renderChips();
    }
});

// Función para cargar y renderizar la lista de libros
window.cargarLibros = function() {
    const contenedor = document.getElementById('contenedor-resultados');
    contenedor.innerHTML = '<div class="text-center">Cargando libros...</div>';
    fetch('/src/services/biblioteca/listarLibros.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success || !Array.isArray(data.libros)) {
                contenedor.innerHTML = '<div class="text-danger">No se pudieron cargar los libros.</div>';
                return;
            }
            if (data.libros.length === 0) {
                contenedor.innerHTML = '<div class="text-muted">No hay libros registrados.</div>';
                return;
            }
            // Renderizar como lista
            let html = '<ul class="list-group">';
            data.libros.forEach(libro => {
                html += `
                <li class="list-group-item d-flex justify-content-between align-items-start flex-wrap">
                    <div style="flex:1; min-width:200px;">
                        <div><strong>${libro.titulo}</strong></div>
                        <div><span class="text-secondary">Autor:</span> ${libro.autor}</div>
                        <div><span class="text-secondary">Temas:</span> ${libro.temas}</div>
                        <!-- ID oculto visualmente, pero disponible en JS -->
                        <!--<div style="display:none;"><span class="text-secondary">ID:</span> <span class="badge bg-info text-dark">${libro.id}</span></div>-->
                    </div>
                    <div class="acciones-libro d-flex gap-2">
                        <button class="btn btn-sm btn-primary" onclick="abrirModalEditarLibro('${libro.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarLibro('${libro.id}')">Eliminar</button>
                    </div>
                </li>`;
            });
            html += '</ul>';
            contenedor.innerHTML = html;
        })
        .catch(error => {
            contenedor.innerHTML = '<div class="text-danger">Error al cargar los libros.</div>';
            console.error('Error al cargar libros:', error);
        });
};

// Llamar a cargarLibros al cargar la página
window.addEventListener('DOMContentLoaded', function() {
    cargarLibros();
});

// Función para abrir el modal de edición con los datos del libro seleccionado
window.abrirModalEditarLibro = function(idLibro) {
    fetch('/src/services/biblioteca/listarLibros.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success || !Array.isArray(data.libros)) return;
            const libro = data.libros.find(l => l.id === idLibro);
            if (!libro) return;
            // Llenar el modal con los datos del libro
            const modal = document.getElementById('modal-libro');
            const modalTitulo = document.getElementById('modal-titulo');
            const form = document.getElementById('form-libro');
            modalTitulo.textContent = 'Editar Libro';
            form.titulo.value = libro.titulo;
            form.autor.value = libro.autor;
            // Temas (chips)
            if (window.temasArray) {
                window.temasArray = libro.temas.split(',').map(t => t.trim()).filter(Boolean);
                if (window.updateTemasHidden) window.updateTemasHidden();
                if (window.renderChips) window.renderChips();
            }
            // Deshabilitar campo archivo
            form.archivo.disabled = true;
            // Mostrar/ocultar texto aclaratorio
            const archivoHelp = document.getElementById('archivo-help');
            if (archivoHelp) archivoHelp.style.display = 'none';
            const archivoEditHelp = document.getElementById('archivo-edit-help');
            if (archivoEditHelp) archivoEditHelp.style.display = 'block';
            // Limpiar archivo (no se puede editar el archivo en HTML por seguridad)
            form.archivo.value = '';
            // Mostrar el modal
            modal.classList.remove('modal-oculto');
        });
};

// Función para cargar y renderizar la lista de libros filtrados por búsqueda
window.buscarLibros = function() {
    const contenedor = document.getElementById('contenedor-resultados');
    const inputBusqueda = document.getElementById('busqueda');
    const selectFiltro = document.getElementById('catalogo');
    const termino = (inputBusqueda ? inputBusqueda.value.trim().toLowerCase() : '');
    const filtro = (selectFiltro ? selectFiltro.value.toLowerCase() : '');
    contenedor.innerHTML = '<div class="text-center">Buscando libros...</div>';
    fetch('/src/services/biblioteca/listarLibros.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success || !Array.isArray(data.libros)) {
                contenedor.innerHTML = '<div class="text-danger">No se pudieron cargar los libros.</div>';
                return;
            }
            // Filtrar libros por término de búsqueda y filtro seleccionado
            let resultados = data.libros;
            if (termino) {
                resultados = data.libros.filter(libro => {
                    if (filtro === 'autor') {
                        return libro.autor.toLowerCase().includes(termino);
                    } else if (filtro === 'tema') {
                        return libro.temas.toLowerCase().includes(termino);
                    } else if (filtro === 'catálogo de biblioteca' || filtro === '' || filtro === 'todos') {
                        // Búsqueda general
                        return (
                            libro.titulo.toLowerCase().includes(termino) ||
                            libro.autor.toLowerCase().includes(termino) ||
                            libro.temas.toLowerCase().includes(termino)
                        );
                    } else {
                        // Por defecto, búsqueda general
                        return (
                            libro.titulo.toLowerCase().includes(termino) ||
                            libro.autor.toLowerCase().includes(termino) ||
                            libro.temas.toLowerCase().includes(termino)
                        );
                    }
                });
            }
            if (resultados.length === 0) {
                contenedor.innerHTML = '<div class="text-muted">No se encontraron resultados.</div>';
                return;
            }
            // Renderizar como lista
            let html = '<ul class="list-group">';
            resultados.forEach(libro => {
                html += `
                <li class="list-group-item d-flex justify-content-between align-items-start flex-wrap">
                    <div style="flex:1; min-width:200px;">
                        <div><strong>${libro.titulo}</strong></div>
                        <div><span class="text-secondary">Autor:</span> ${libro.autor}</div>
                        <div><span class="text-secondary">Temas:</span> ${libro.temas}</div>
                    </div>
                    <div class="acciones-libro d-flex gap-2">
                        <button class="btn btn-sm btn-primary" onclick="abrirModalEditarLibro('${libro.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarLibro('${libro.id}')">Eliminar</button>
                    </div>
                </li>`;
            });
            html += '</ul>';
            contenedor.innerHTML = html;
        })
        .catch(error => {
            contenedor.innerHTML = '<div class="text-danger">Error al buscar libros.</div>';
            console.error('Error al buscar libros:', error);
        });
};

// Al cargar la página, la lista está vacía
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('contenedor-resultados').innerHTML = '<div class="text-muted">Utiliza la barra de búsqueda para ver resultados.</div>';
    // Asignar evento al botón "Ir"
    const btnIr = document.querySelector('.buscador-btn');
    if (btnIr) {
        btnIr.addEventListener('click', function(e) {
            e.preventDefault();
            buscarLibros();
        });
    }
});
