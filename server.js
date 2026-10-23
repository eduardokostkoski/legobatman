import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolvendo caminhos do sistema no modo ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MODELO = 'openai/gpt-oss-20b';  

// Banco de dados em memória para testes
const user = [];

// Middlewares para JSON e CORS
app.use(express.json());
app.use(cors());

// Serve todos os arquivos estáticos da pasta "public" (HTML, CSS, imagens)
const pastaPublic = path.join(__dirname, 'public');
app.use(express.static(pastaPublic));

// --- ROTA PRINCIPAL: Abre o login.html automaticamente ao acessar http://localhost:3000 ---
app.get('/', (req, res) => {
    const caminhoLogin = path.join(pastaPublic, 'index.html');
    
    res.sendFile(caminhoLogin, (err) => {
        if (err) {
            console.error(`\n❌ ERRO: O arquivo login.html não foi encontrado dentro da pasta public!`);
            console.error(`Procurado em: ${caminhoLogin}\n`);
            res.status(404).send(`
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Erro 404: Arquivo não encontrado!</h2>
                    <p>O servidor tentou abrir o arquivo <b>index.html</b> dentro da pasta <b>public</b>, mas ele não está lá.</p>
                    <p><b>Caminho procurado:</b> <code>${caminhoLogin}</code></p>
                    <hr>
                    <p><b>O que fazer:</b> Verifique se o arquivo está na pasta <code>public</code> e se o nome está em minúsculo: <code>login.html</code>.</p>
                </div>
            `);
        }
    });
});

// --- ROTA DE CADASTRO ---
app.post('/cadastro', (req, res) => {
    const { usuario, email, senha } = req.body;

    if (!usuario || !email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos!" });
    }
    
    // Regra de validação: Senha deve ter pelo menos 8 caracteres
    if (senha.length < 8) {
        return res.status(400).json({ erro: "A senha deve ter no mínimo 8 caracteres!" });
    }

    // Regra de validação: Verifica se o e-mail já foi utilizado
    const emailExiste = user.find((busca) => busca.email.toLowerCase() === email.toLowerCase());

    if (emailExiste) {
        return res.status(409).json({ erro: "Este e-mail já foi utilizado por outro herói!" });
    }

    // Salva o novo usuário
    user.push({ usuario, email, senha });

    return res.json({
        mensagem: "CADASTRO COM SUCESSO",
        PERFIL: `Usuário @${usuario} cadastrado com o e-mail ${email}`
    });
});

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos!" });
    }

    const usuarioExiste = user.find((busca) => busca.email.toLowerCase() === email.toLowerCase());

    // Regra: Caso o e-mail não esteja cadastrado
    if (!usuarioExiste) {
        return res.status(404).json({ erro: "Usuário não encontrado! Por favor, cadastre-se primeiro." });
    }

    // Regra: Caso a senha esteja incorreta
    if (usuarioExiste.senha !== senha) {
        return res.status(401).json({ erro: "Senha incorreta!" });
    }

    return res.json({
        mensagem: "Login realizado com sucesso!",
        usuario: usuarioExiste.usuario
    });
});

// --- ROTA DO CHAT (Groq API) ---
app.post('/chat', async (req, res) => {
    const API_KEY = process.env.API_KEY_GROQ ? process.env.API_KEY_GROQ.trim() : null;
    const historico = Array.isArray(req.body.historico) ? req.body.historico : [];

    if (!API_KEY) {
        return res.status(500).json({ erro: "API Key da Groq não configurada no arquivo .env!" });
    }

    const messages = [
        {
            role: "system",
            content: "Você é o LEGO Batman. Responda de forma EXTREMAMENTE CURTA (no máximo 1 ou 2 frases curtas),tenha opiniões fortes e específicas, resposta muito sarcástica e direta. Você ama ser o Batman e comer açaí no Pará. sempre fale em português brasileiro, NUNCA faça respostas longas ou com listas, seja falmenguista (fã do time de futebol brasileiro Flamengo). Não fale sempre sobre o acaí no Pará."
        },
        ...historico
    ];

    try {
        const respostaGroq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODELO,
                messages: messages
            })
        });

        const data = await respostaGroq.json();

        if (respostaGroq.ok && data.choices && data.choices.length > 0) {
            return res.json({ resposta: data.choices[0].message.content });
        } else {
            console.error("\n❌ ERRO RETORNADO PELA GROQ:", data);
            return res.status(respostaGroq.status || 500).json({ 
                erro: data.error?.message || "Erro ao se comunicar com o LEGO Batman." 
            });
        }
    } catch (err) {
        console.error("❌ ERRO DE CONEXÃO NO FETCH /chat:", err);
        return res.status(500).json({ erro: "Erro interno no servidor do Bat-Terminal." });
    }
});


// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`\n🦇 Batcaverna rodando!`);
    console.log(`📍 Acesse em: http://localhost:${PORT}`);
    console.log(`📁 Buscando arquivos na pasta: ${pastaPublic}\n`);
});
