/**
 * GARIMPO IA™ — Google Gemini AI Service
 *
 * Camada de abstração para análise de oportunidades via IA.
 * Modelo: Gemini 2.5 Pro. Validação Zod e tratamento de erro.
 */

import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { envConfig } from '@/lib/env';
import type { AIAnalysisRequest, AIAnalysisResponse } from '@/types';

const aiResponseSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  risks: z.array(z.string()),
  recommendation: z.enum(['strong_buy', 'buy', 'hold', 'avoid']),
  estimated_total_cost: z.number(),
  estimated_net_profit: z.number(),
});

function getGenAI() {
  if (!envConfig.GEMINI_API_KEY?.trim()) {
    throw new Error('Configure VITE_GEMINI_API_KEY no Vercel para usar análise por IA.');
  }
  return new GoogleGenerativeAI(envConfig.GEMINI_API_KEY);
}

const SYSTEM_PROMPT = `Você é o motor de análise do Garimpo IA™, uma plataforma de inteligência em leilões de ativos físicos no Brasil.

Sua função: receber dados de um lote de leilão e produzir uma análise financeira rigorosa.

REGRAS:
- Sempre responda em JSON válido, sem markdown.
- O score vai de 0 a 100 (0 = evitar, 100 = compra obrigatória).
- Considere: valor FIPE/mercado, condição estimada, custos de documentação, frete, reparos comuns para a categoria, liquidez regional.
- Seja conservador nos cálculos — nunca infle lucro potencial.
- Liste riscos concretos, não genéricos.
- recommendation: "strong_buy" (score >= 85), "buy" (70-84), "hold" (50-69), "avoid" (< 50).

FORMATO DE RESPOSTA (JSON):
{
  "score": number,
  "summary": "string (máx 200 palavras)",
  "risks": ["string", "string"],
  "recommendation": "strong_buy" | "buy" | "hold" | "avoid",
  "estimated_total_cost": number,
  "estimated_net_profit": number
}`;

export async function analyzeOpportunity(
  request: AIAnalysisRequest,
): Promise<AIAnalysisResponse> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro-preview-05-06',
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = `Analise esta oportunidade de leilão:

Categoria: ${request.category}
Lance atual: R$ ${request.current_bid.toLocaleString('pt-BR')}
Valor de mercado estimado: R$ ${request.market_value.toLocaleString('pt-BR')}
Localização: ${request.location}
${request.additional_context ? `Contexto adicional: ${request.additional_context}` : ''}

Retorne APENAS o JSON de análise.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    const raw = JSON.parse(cleaned) as unknown;
    const parsed = aiResponseSchema.parse(raw);
    return parsed as AIAnalysisResponse;
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Resposta da IA inválida: ${err.flatten().fieldErrors ? JSON.stringify(err.flatten().fieldErrors) : err.message}`);
    }
    if (err instanceof Error) throw err;
    throw new Error('Erro ao analisar oportunidade com IA.');
  }
}
