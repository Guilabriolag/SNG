// Estado inicial
let state = {
  loja: {
    nome: "",
    telefone: "",
    pix: "",
    banco: "",
    endereco: "",
    logo: "",
    horarios: "",
    corPrimaria: "#3498db",
    corSecundaria: "#95a5a6",
    fundo: "",
    botaoCarrinho: "",
    modoEscuro: false,
    musicaAmbiente: ""
  },
  categorias: [],
  subcategorias: [],
  modosVenda: [],
  produtos: [],
  clientes: [],
  cupons: [],
  publicidade: { 
    banner: { texto: "", imagem: "", link: "" },
    carrossel: [],
    redesSociais: { instagram: "", facebook: "", whatsapp: "" }
  },
  cobertura: []
};
let produtoEditandoIndex = null; 

// =============================================
// NAVEGAÇÃO E INICIALIZAÇÃO
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll("#menu-bar li");
  const tabs = document.querySelectorAll("main > section.tab");

  menuItems.forEach(item => { 
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-tab");

      tabs.forEach(tab => tab.classList.remove("active"));
      menuItems.forEach(btn => btn.classList.remove("active"));

      const targetTab = document.getElementById(targetId);
      if (targetTab) {
        targetTab.classList.add("active"); 
        item.classList.add("active");
      }

      // Atualiza o preview ao abrir a aba [cite: 73]
      if (targetId === "preview") {
        atualizarPreview();
      }
    });
  });

  // Ativa a primeira aba por padrão [cite: 19]
  const firstTab = document.querySelector(".tab");
  if (firstTab) firstTab.classList.add("active");

  carregarLocal(); 
  atualizarCategoriasUI();
  atualizarModosVendaUI();
  atualizarProdutosUI();
  atualizarPreview(); //
});

// =============================================
// LOCALSTORAGE E JSONBIN
// =============================================

function salvarLocal() { 
  localStorage.setItem("painelState", JSON.stringify(state));
  alert("💾 Salvo localmente!"); [cite: 20]
}

function carregarLocal() { 
  const saved = localStorage.getItem("painelState");
  if (saved) { 
    state = JSON.parse(saved); [cite: 21]
  }
}

function publicarTotem() { 
  const binId = document.getElementById("jsonbinId").value.trim(); [cite: 21]
  const masterKey = document.getElementById("masterKey").value.trim(); 

  if (!binId || !masterKey) { 
    alert("⚠️ Configure o JSONBin ID e a Master Key"); [cite: 22]
    return; 
  }

  fetch(`https://api.jsonbin.io/v3/b/${binId}`, { 
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": masterKey
    },
    body: JSON.stringify(state)
  })
    .then(res => res.json())
    .then(json => alert("✅ Publicado com sucesso!"))
    .catch(() => alert("❌ Erro ao publicar.")); [cite: 23, 24]
}

function restaurarPadrao() { 
  if (confirm("Tem certeza que deseja restaurar o painel?")) {
    localStorage.removeItem("painelState");
    location.reload(); [cite: 24, 25]
  }
}

// =============================================
// CRUD - CATEGORIAS
// =============================================

const btnAdicionarCategoria = document.getElementById("btnAdicionarCategoria"); 
const inputCategoria = document.getElementById("novaCategoria");
const categoryTree = document.getElementById("category-tree");
const selectProdCategoria = document.getElementById("prodCategoria");

btnAdicionarCategoria.addEventListener("click", () => { 
  const nome = inputCategoria.value.trim();
  if (!nome) return alert("⚠️ Digite um nome de categoria!"); [cite: 26]
  state.categorias.push({ nome });
  inputCategoria.value = "";
  atualizarCategoriasUI();
  salvarLocal();
  atualizarPreview(); [cite: 26]
});

function atualizarCategoriasUI() { 
  categoryTree.innerHTML = state.categorias
    .map((c, i) => `
      <div class="categoria">
        ${c.nome}
        <button onclick="removerCategoria(${i})" class="btn-danger">X</button>
      </div>
    `)
    .join(""); [cite: 27]
  selectProdCategoria.innerHTML = state.categorias 
    .map(c => `<option value="${c.nome}">${c.nome}</option>`)
    .join(""); [cite: 28]
}

function removerCategoria(index) { 
  if (confirm("Excluir categoria?")) {
    state.categorias.splice(index, 1);
    atualizarCategoriasUI();
    salvarLocal();
    atualizarPreview(); [cite: 29]
  }
}

// =============================================
// CRUD - MODO DE VENDA
// =============================================

const btnAdicionarModoVenda = document.getElementById("btnAdicionarModoVenda"); 
const inputModoVenda = document.getElementById("novoModoVenda");
const modoVendaLista = document.getElementById("modoVendaLista");
const selectProdModoVenda = document.getElementById("prodModoVenda"); [cite: 31]

btnAdicionarModoVenda.addEventListener("click", () => { 
  const modo = inputModoVenda.value.trim();
  if (!modo) return alert("⚠️ Digite um modo de venda!");
  state.modosVenda.push(modo);
  inputModoVenda.value = "";
  atualizarModosVendaUI();
  salvarLocal(); [cite: 31]
});

function atualizarModosVendaUI() { 
  modoVendaLista.innerHTML = state.modosVenda
    .map((m, i) => `
      <div class="categoria">
        ${m}
        <button onclick="removerModoVenda(${i})" class="btn-danger">X</button>
      </div>
    `)
    .join(""); [cite: 32]
  selectProdModoVenda.innerHTML = state.modosVenda
    .map(m => `<option value="${m}">${m}</option>`)
    .join(""); [cite: 33]
}

function removerModoVenda(index) { 
  if (confirm("Excluir modo de venda?")) {
    state.modosVenda.splice(index, 1);
    atualizarModosVendaUI();
    salvarLocal(); [cite: 34]
  }
}

// =============================================
// CRUD - PRODUTOS
// =============================================

const btnAdicionarProduto = document.getElementById("btnAdicionarProduto"); 
const listaProdutosContainer = document.getElementById("listaProdutosContainer"); [cite: 35]

btnAdicionarProduto.addEventListener("click", () => { 
  const produto = {
    nome: document.getElementById("prodNome").value,
    preco: parseFloat(document.getElementById("prodPreco").value) || 0,
    imagem: document.getElementById("prodImagem").value,
    descricao: document.getElementById("prodDescricao").value,
    categoria: document.getElementById("prodCategoria").value,
    subcategoria: document.getElementById("prodSubcategoria").value,
    modoVenda: document.getElementById("prodModoVenda").value,
    estoque: parseInt(document.getElementById("prodEstoque").value) || 0,
    destaque: document.getElementById("prodDestaque").checked,
    ativo: document.getElementById("prodAtivo").checked
  }; [cite: 36]

  if (!produto.nome || produto.preco <= 0) {
    return alert("⚠️ Nome e preço obrigatórios!");
  }

  if (produtoEditandoIndex !== null) { 
    state.produtos[produtoEditandoIndex] = produto;
    produtoEditandoIndex = null; [cite: 37]
    btnAdicionarProduto.textContent = "Adicionar Produto";
  } else {
    state.produtos.push(produto);
  }

  limparFormularioProduto(); 
  atualizarProdutosUI(); [cite: 38]
  salvarLocal();
  atualizarPreview();
});

function limparFormularioProduto() { 
  document.getElementById("prodNome").value = "";
  document.getElementById("prodPreco").value = "";
  document.getElementById("prodImagem").value = "";
  document.getElementById("prodDescricao").value = "";
  document.getElementById("prodCategoria").value = ""; [cite: 39]
  document.getElementById("prodSubcategoria").value = "";
  document.getElementById("prodModoVenda").value = "";
  document.getElementById("prodEstoque").value = "";
  document.getElementById("prodDestaque").checked = false;
  document.getElementById("prodAtivo").checked = false; [cite: 40]
}

function atualizarProdutosUI() { 
  listaProdutosContainer.innerHTML = state.produtos
    .map((p, i) => `
      <div class="produto-card">
        <img src="${p.imagem}" alt="${p.nome}">
        <div class="info">
          <h3>${p.nome}</h3>
          <p>R$ ${p.preco.toFixed(2)}</p>
          <p>${p.categoria}</p>
        </div>
        <div class="actions">
          <button onclick="editarProduto(${i})" class="btn-secondary">✏️ Editar</button>
          <button onclick="removerProduto(${i})" class="btn-danger">🗑️ Excluir</button>
        </div>
      </div>
    `)
    .join(""); [cite: 41, 42]
}

function editarProduto(index) { 
  const p = state.produtos[index];
  document.getElementById("prodNome").value = p.nome;
  document.getElementById("prodPreco").value = p.preco;
  document.getElementById("prodImagem").value = p.imagem;
  document.getElementById("prodDescricao").value = p.descricao;
  document.getElementById("prodCategoria").value = p.categoria; [cite: 43]
  document.getElementById("prodSubcategoria").value = p.subcategoria;
  document.getElementById("prodModoVenda").value = p.modoVenda;
  document.getElementById("prodEstoque").value = p.estoque;
  document.getElementById("prodDestaque").checked = p.destaque;
  document.getElementById("prodAtivo").checked = p.ativo;
  produtoEditandoIndex = index; [cite: 44]
  btnAdicionarProduto.textContent = "Salvar Alterações";
}

function removerProduto(index) { 
  if (confirm("Excluir produto?")) {
    state.produtos.splice(index, 1);
    atualizarProdutosUI(); [cite: 45]
    salvarLocal();
    atualizarPreview();
  }
}

// =============================================
// PREVIEW EM TEMPO REAL (Simula o TOTEM)
// =============================================

function atualizarPreview() { 
  const iframe = document.getElementById("previewIframe");
  iframe.srcdoc = gerarTotemHTML(); [cite: 45, 46]
}

function gerarTotemHTML() { 
  return `
    <html>
      <head>
        <title>${state.loja.nome}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: ${state.loja.fundo || "#fff"}; [cite: 47]
            color: ${state.loja.modoEscuro ? "#eee" : "#333"};
            padding: 20px; 
          }
          .produto {
            display: flex; 
            align-items: center; [cite: 49]
            gap: 10px;
            margin-bottom: 10px;
          }
          .produto img {
            width: 60px; 
            height: 60px; [cite: 50]
            object-fit: cover;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <h1>${state.loja.nome}</h1>
        <h2>Produtos:</h2>
        ${state.produtos
          .map(
            p => `
          <div class="produto">
            <img src="${p.imagem}" alt="${p.nome}">
            <div> 
              <strong>${p.nome}</strong><br> [cite: 51]
              R$ ${p.preco.toFixed(2)}<br>
              ${p.descricao}
            </div>
          </div>
        `
          )
        .join("")} [cite: 52]
      </body>
    </html>
  `; 
    }
