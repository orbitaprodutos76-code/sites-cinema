// Vercel Serverless Function: POST /api/primeiro-treino
// Recebe as respostas do questionário e devolve uma mensagem curta de boas-vindas
// escrita pelo Claude. A chave fica na variável de ambiente ANTHROPIC_API_KEY da Vercel
// (nunca no repositório).
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const OPCOES = {
  idade: ["até 17", "18 a 29", "30 a 44", "45 a 59", "60 ou mais"],
  objetivo: ["emagrecer", "ganhar força e músculo", "saúde e disposição", "voltar a treinar"],
  experiencia: ["nunca treinei", "já treinei, parei", "treino hoje"],
  horario: ["manhã cedo (5h–8h)", "manhã", "almoço", "tarde", "noite (até 23h)", "fim de semana"],
};

const SISTEMA = `Você é a recepção da Body Gym Academia, em Mineiros (GO). Lema: "Você além de um simples treino".
Horário: seg a sex 5h–23h, sáb 8h–16h, dom 8h–12h. Ambiente acolhedor, público de todas as idades e tamanhos, eventos da turma, esteiras de frente para o pôr do sol.
Escreva em português do Brasil, tom caloroso e direto, no máximo 90 palavras, sem listas longas e sem emojis em excesso (no máximo 1).
Diga como a pessoa pode começar, de forma geral, e convide para conversar no WhatsApp com a equipe.
Nunca prescreva exercícios, cargas, dietas ou suplementos e nunca faça promessa de resultado. Se a pessoa tem 60+ ou nunca treinou, reforce que o professor acompanha e adapta tudo.
Não invente preços, planos ou promoções.`;

const tentativas = new Map(); // limite simples por IP (memória da instância)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ erro: "Use POST." });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || "anon";
  const agora = Date.now();
  const lista = (tentativas.get(ip) || []).filter((t) => agora - t < 60_000);
  if (lista.length >= 5) return res.status(429).json({ erro: "Muitas tentativas. Tente de novo em 1 minuto." });
  tentativas.set(ip, [...lista, agora]);

  const r = req.body || {};
  for (const campo of Object.keys(OPCOES)) {
    if (!OPCOES[campo].includes(r[campo])) return res.status(400).json({ erro: `Resposta inválida em ${campo}.` });
  }

  try {
    const resposta = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SISTEMA,
      messages: [{
        role: "user",
        content: `Idade: ${r.idade}\nObjetivo: ${r.objetivo}\nExperiência: ${r.experiencia}\nHorário preferido: ${r.horario}`,
      }],
    });

    if (resposta.stop_reason === "refusal") return res.status(200).json({ texto: null });
    const texto = resposta.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return res.status(200).json({ texto: texto || null });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return res.status(503).json({ erro: "Assistente ocupado." });
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API ${error.status}:`, error.message);
      return res.status(502).json({ erro: "Assistente indisponível." });
    }
    console.error(error);
    return res.status(500).json({ erro: "Falha inesperada." });
  }
}
