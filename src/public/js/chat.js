document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const lista = document.getElementById('mensajes');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value.trim()) {
            socket.emit('chat:mensaje', input.value);
            input.value = '';
        }
    });

    socket.on('chat:mensaje', (msg) => {
        const li = document.createElement('li');
        li.textContent = msg;
        lista.appendChild(li);
    });
});
