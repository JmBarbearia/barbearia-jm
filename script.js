document.addEventListener("DOMContentLoaded", function () {
    const dataInput = document.getElementById("data");
    const horaSelect = document.getElementById("hora");
    const checkboxes = document.querySelectorAll('input[name="servico"]');
    const mensagemFechado = document.getElementById("mensagem-fechado");

    const agendamentos = []; // Simula armazenamento local

    function gerarHorarios(duracao) {
        const horarios = [];
        let horaAtual = 9 * 60;
        const horaFinal = 18 * 60;

        while (horaAtual + duracao <= horaFinal) {
            const horas = String(Math.floor(horaAtual / 60)).padStart(2, "0");
            const minutos = String(horaAtual % 60).padStart(2, "0");
            horarios.push({ label: `${horas}:${minutos}`, minutos: horaAtual });
            horaAtual += 30; // intervalo de 30 min entre sugestões
        }
        return horarios;
    }

    function getDiaSemana(inputDate) {
        const [ano, mes, dia] = inputDate.split("-");
        const dataCorreta = new Date(ano, mes - 1, dia);
        return dataCorreta.getDay();
    }

    function horarioDisponivel(data, inicio, duracao) {
        const fim = inicio + duracao;
        return !agendamentos.some(ag => {
            if (ag.data !== data) return false;
            const agInicio = ag.inicio;
            const agFim = ag.inicio + ag.duracao;
            return (inicio < agFim && fim > agInicio);
        });
    }

    function atualizarHorarios() {
        let tempoTotal = 0;

        checkboxes.forEach(c => {
            if (c.checked) tempoTotal += parseInt(c.dataset.tempo);
        });

        horaSelect.innerHTML = "";

        if (tempoTotal === 0 || !dataInput.value) {
            horaSelect.innerHTML = "<option>Selecione ao menos um serviço</option>";
            return;
        }

        const diaSemana = getDiaSemana(dataInput.value);
        if (diaSemana === 0 || diaSemana === 1) {
            horaSelect.innerHTML = "<option>Selecione uma data válida</option>";
            return;
        }

        const horarios = gerarHorarios(tempoTotal);
        const disponiveis = horarios.filter(h => horarioDisponivel(dataInput.value, h.minutos, tempoTotal));

        if (disponiveis.length === 0) {
            horaSelect.innerHTML = "<option>Nenhum horário disponível</option>";
            return;
        }

        disponiveis.forEach(h => {
            const option = document.createElement("option");
            option.value = h.label;
            option.textContent = h.label;
            horaSelect.appendChild(option);
        });
    }

    dataInput.addEventListener("change", function () {
        const dia = getDiaSemana(dataInput.value);
        if (dia === 0 || dia === 1) {
            mensagemFechado.style.display = "block";
            horaSelect.innerHTML = "<option>Selecione uma data válida</option>";
        } else {
            mensagemFechado.style.display = "none";
            atualizarHorarios();
        }
    });

    checkboxes.forEach(cb => {
        cb.addEventListener("change", atualizarHorarios);
    });

    document.getElementById("form-agendamento").addEventListener("submit", function (e) {
        e.preventDefault();

        const dia = getDiaSemana(dataInput.value);
        if (dia === 0 || dia === 1) {
            alert("Estamos fechado aos domingos e segundas. Por favor, escolha outro dia.");
            return;
        }

        const horarioSelecionado = horaSelect.value;
        if (!horarioSelecionado) {
            alert("Por favor, selecione um horário.");
            return;
        }

        let tempoTotal = 0;
        checkboxes.forEach(c => {
            if (c.checked) tempoTotal += parseInt(c.dataset.tempo);
        });

        const [horas, minutos] = horarioSelecionado.split(":").map(Number);
        const inicioMinutos = horas * 60 + minutos;

        agendamentos.push({
            data: dataInput.value,
            inicio: inicioMinutos,
            duracao: tempoTotal
        });

        const mensagemSucesso = document.createElement('div');
        mensagemSucesso.classList.add('mensagem-sucesso', 'mostrar');
        mensagemSucesso.textContent = "Agendamento realizado com sucesso!";
        document.body.appendChild(mensagemSucesso);

        setTimeout(() => {
            mensagemSucesso.remove();
        }, 4000);

        this.reset();
        horaSelect.innerHTML = "<option value=''>Selecione os serviços primeiro</option>";
    });

    const hoje = new Date().toISOString().split("T")[0];
    dataInput.setAttribute("min", hoje);
});
