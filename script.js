const db = new Dexie("CadastroClientes");
db.version(1).stores({
  clientes: "++id,nome,email",
  pedidos: "++id,clienteId,descricao,data",
});

async function cadastrarCliente() {
  const nome = document.getElementById("nomeCliente").value.trim();
  const email = document.getElementById("emailCliente").value.trim();

  if (!nome || !email) {
    alert("Preencha o nome e o email do cliente.");
    return;
  }

  await db.clientes.add({ nome, email });
  document.getElementById("nomeCliente").value = "";
  document.getElementById("emailCliente").value = "";
  await atualizarSelectClientes();
}

async function atualizarSelectClientes() {
  const select = document.getElementById("clientePedidoSelect");
  select.innerHTML = `<option value="">Selecione um cliente</option>`;
  const clientes = await db.clientes.toArray();
  clientes.forEach((cliente) => {
    const option = document.createElement("option");
    option.value = cliente.id;
    option.textContent = `${cliente.nome} (${cliente.email})`;
    select.appendChild(option);
  });
}

async function cadastrarPedido() {
  const clienteId = document.getElementById("clientePedidoSelect").value;
  const descricao = document.getElementById("descricaoPedido").value.trim();

  if (!clienteId || !descricao) {
    alert("Selecione um cliente e preencha a descrição.");
    return;
  }

  const data = new Date().toISOString();
  await db.pedidos.add({ clienteId: Number(clienteId), descricao, data });
  document.getElementById("descricaoPedido").value = "";
  await listarPedidosDoCliente(clienteId);
}

async function listarPedidosDoCliente(clienteId) {
  const pedidos = await db.pedidos
    .where("clienteId")
    .equals(Number(clienteId))
    .reverse()
    .sortBy("data");

  const ul = document.getElementById("listaPedidos");
  ul.innerHTML = "";

  if (pedidos.length === 0) {
    ul.innerHTML = "<li>Nenhum pedido encontrado.</li>";
    return;
  }

  pedidos.forEach((pedido) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${pedido.descricao}</strong><br>
      <span class="pedido-data">${new Date(pedido.data).toLocaleString()}</span>
    `;
    ul.appendChild(li);
  });
}

document
  .getElementById("clientePedidoSelect")
  .addEventListener("change", async (e) => {
    const clienteId = e.target.value;
    if (clienteId) {
      await listarPedidosDoCliente(clienteId);
    } else {
      document.getElementById("listaPedidos").innerHTML = "";
    }
  });

atualizarSelectClientes();
